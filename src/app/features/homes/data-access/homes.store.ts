import { Injectable, computed, signal } from '@angular/core';
import { WorkspaceRepository } from '../../../core/storage/workspace.repository';
import { createExampleWorkspace } from '../domain/home.examples';
import {
  CommuteSettings,
  DEFAULT_FILTERS,
  Home,
  HomeFilters,
  Workspace,
} from '../domain/home.model';
import { filterHomes, toggleComparison } from '../domain/home.selectors';
import { isHome, parseWorkspace } from '../domain/home.validation';

export type PersistenceStatus = 'loading' | 'saving' | 'saved' | 'unsaved';

/** Feature state and mutations. UI components never access IndexedDB directly. */
@Injectable()
export class HomesStore {
  private readonly state = signal<Workspace>({
    homes: [],
    destinations: [
      { name: 'Destination 1', address: '' },
      { name: 'Destination 2', address: '' },
    ],
    mode: 'transit',
    demo: false,
  });
  private readonly filterState = signal<HomeFilters>({ ...DEFAULT_FILTERS });
  private readonly selection = signal<string | null>(null);
  private readonly comparison = signal<ReadonlySet<string>>(new Set());
  private readonly initialized = signal(false);
  private readonly persistenceState = signal<PersistenceStatus>('loading');
  private initialization: Promise<void> | undefined;
  private writeQueue: Promise<void> = Promise.resolve();
  private revision = 0;
  private storageRecoveryRequired = false;

  readonly ready = this.initialized.asReadonly();
  readonly persistence = this.persistenceState.asReadonly();
  readonly filters = this.filterState.asReadonly();
  readonly selectedId = this.selection.asReadonly();
  readonly comparisonIds = this.comparison.asReadonly();
  readonly homes = computed<readonly Home[]>(() => this.state().homes);
  readonly destinations = computed(() => this.state().destinations);
  readonly mode = computed(() => this.state().mode);
  readonly demo = computed(() => this.state().demo);
  readonly filtered = computed(() => filterHomes(this.homes(), this.filters()));
  readonly compared = computed(() => this.homes().filter((home) => this.comparison().has(home.id)));
  readonly activeHome = computed(
    () => this.filtered().find((home) => home.id === this.selection()) ?? null,
  );
  private readonly message = signal('');
  readonly notice = this.message.asReadonly();

  report(message: string): void {
    this.message.set(message);
  }
  dismissNotice(): void {
    this.message.set('');
  }

  constructor(private readonly repository: WorkspaceRepository) {}

  initialize(): Promise<void> {
    return (this.initialization ??= this.load());
  }

  private async load(): Promise<void> {
    try {
      const stored = await this.repository.read();
      this.state.set(stored === undefined ? createExampleWorkspace() : parseWorkspace(stored));
      this.persistenceState.set('saved');
    } catch {
      // Never overwrite an unreadable stored workspace with demonstration data.
      this.storageRecoveryRequired = true;
      this.state.set(createExampleWorkspace());
      this.persistenceState.set('unsaved');
      this.message.set(
        'Stored data could not be loaded. Changes will remain in memory to protect existing data. Export a backup before leaving.',
      );
    } finally {
      this.initialized.set(true);
    }
  }

  updateFilters(patch: Partial<HomeFilters>): void {
    this.filterState.update((current) => ({ ...current, ...patch }));
  }

  select(id: string | null): void {
    this.selection.set(id);
  }

  toggleCompare(id: string): void {
    if (!this.homes().some((home) => home.id === id)) return;
    try {
      this.comparison.set(toggleComparison(this.comparison(), id));
    } catch (error) {
      this.message.set(error instanceof Error ? error.message : 'Comparison unavailable.');
    }
  }

  async saveHome(home: Home): Promise<void> {
    this.assertReady();
    if (!isHome(home))
      throw new Error(
        'Enter valid home details, positive rent and area, whole room counts, coordinates, and HTTP(S) links.',
      );
    const savedHome = structuredClone(home);
    this.state.update((current) => ({
      ...current,
      homes: current.homes.some((item) => item.id === home.id)
        ? current.homes.map((item) => (item.id === home.id ? savedHome : item))
        : [savedHome, ...current.homes],
    }));
    this.selection.set(home.id);
    await this.persist('Home saved on this device.');
  }

  async removeHome(id: string): Promise<void> {
    this.assertReady();
    this.state.update((current) => ({
      ...current,
      homes: current.homes.filter((home) => home.id !== id),
    }));
    this.pruneSelection();
    await this.persist('Home deleted.');
  }

  async removeExamples(): Promise<void> {
    this.assertReady();
    this.state.update((current) => ({
      ...current,
      demo: false,
      homes: current.homes.filter((home) => !home.id.startsWith('demo-')),
    }));
    this.pruneSelection();
    await this.persist('Example homes removed.');
  }

  async saveCommute(settings: CommuteSettings): Promise<void> {
    this.assertReady();
    this.state.set(parseWorkspace({ ...this.state(), ...settings }));
    await this.persist(
      'Destinations saved. Choose your departure time in Google Maps when opening a route.',
    );
  }

  async replace(workspace: Workspace): Promise<void> {
    this.assertReady();
    this.state.set(parseWorkspace(workspace));
    this.selection.set(null);
    this.comparison.set(new Set());
    await this.persist('Backup imported and saved on this device.');
  }

  snapshot(): Workspace {
    this.assertReady();
    return structuredClone(this.state());
  }

  private pruneSelection(): void {
    const existing = new Set(this.homes().map((home) => home.id));
    this.comparison.update((ids) => new Set([...ids].filter((id) => existing.has(id))));
    if (!existing.has(this.selection() ?? '')) this.selection.set(null);
  }

  private assertReady(): void {
    if (!this.ready()) throw new Error('Please wait for your workspace to load.');
  }

  private persist(successMessage: string): Promise<void> {
    const snapshot = this.snapshot();
    const revision = ++this.revision;
    this.message.set('');
    if (this.storageRecoveryRequired) {
      this.message.set(
        'Changes are in memory only because stored data could not be loaded. Export a backup before leaving.',
      );
      return Promise.resolve();
    }
    this.persistenceState.set('saving');
    // Serialize writes and report completion only for the latest mutation.
    const operation = this.writeQueue.then(async () => {
      try {
        await this.repository.write(snapshot);
        if (revision === this.revision) {
          this.persistenceState.set('saved');
          this.message.set(successMessage);
        }
      } catch {
        if (revision === this.revision) {
          this.persistenceState.set('unsaved');
          this.message.set(
            'Changes could not be saved. They remain in memory; export a backup before leaving.',
          );
        }
      }
    });
    this.writeQueue = operation;
    return operation;
  }
}
