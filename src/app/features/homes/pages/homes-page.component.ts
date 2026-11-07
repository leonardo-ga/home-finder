import { Component, HostListener, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BackupFileService } from '../../../core/storage/backup-file.service';
import { HomesStore } from '../data-access/homes.store';
import {
  CommuteSettings,
  Home,
  HomeFilters,
  HOME_STATUSES,
  createHome,
} from '../domain/home.model';
import { parseBackup, serializeBackup } from '../domain/home.validation';
import { HomeCardComponent } from '../components/home-card/home-card.component';
import { HomeMapComponent } from '../components/home-map/home-map.component';
import { HomeDetailsComponent } from '../components/home-details/home-details.component';
import { HomeComparisonComponent } from '../components/home-comparison/home-comparison.component';
import { HomeEditorComponent } from '../components/home-editor/home-editor.component';
import { DestinationsEditorComponent } from '../components/destinations-editor/destinations-editor.component';

/** Page orchestration: UI drafts, confirmation and file actions. */
@Component({
  selector: 'app-homes-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HomeCardComponent,
    HomeMapComponent,
    HomeDetailsComponent,
    HomeComparisonComponent,
    HomeEditorComponent,
    DestinationsEditorComponent,
  ],
  providers: [HomesStore],
  templateUrl: './homes-page.component.html',
  styleUrl: './homes-page.component.css',
})
export class HomesPageComponent {
  readonly store = inject(HomesStore);
  readonly statuses = HOME_STATUSES;
  private readonly backupFiles = inject(BackupFileService);
  @ViewChild(HomeMapComponent) private map: HomeMapComponent | undefined;

  view: 'explore' | 'compare' = 'explore';
  editing: Home | null = null;
  commuteDraft: CommuteSettings | null = null;
  editorError = '';
  saving = false;

  constructor() {
    void this.store.initialize();
  }

  get query(): string {
    return this.store.filters().query;
  }
  set query(query: string) {
    this.store.updateFilters({ query });
  }
  get maxPrice(): number | null {
    return this.store.filters().maxPrice;
  }
  set maxPrice(maxPrice: number | null) {
    this.store.updateFilters({ maxPrice });
  }
  get minSqm(): number | null {
    return this.store.filters().minSqm;
  }
  set minSqm(minSqm: number | null) {
    this.store.updateFilters({ minSqm });
  }
  get status(): HomeFilters['status'] {
    return this.store.filters().status;
  }
  set status(status: HomeFilters['status']) {
    this.store.updateFilters({ status });
  }
  get sort(): HomeFilters['sort'] {
    return this.store.filters().sort;
  }
  set sort(sort: HomeFilters['sort']) {
    this.store.updateFilters({ sort });
  }

  get persistenceLabel(): string {
    return {
      loading: 'Loading workspace',
      saving: 'Saving changes…',
      saved: 'Saved on this device',
      unsaved: 'Unsaved changes — export a backup',
    }[this.store.persistence()];
  }

  trackHome(_index: number, home: Home): string {
    return home.id;
  }
  select(home: Home): void {
    this.store.select(home.id);
  }
  add(): void {
    this.editorError = '';
    this.editing = createHome();
  }
  edit(home: Home): void {
    this.editorError = '';
    this.editing = home;
  }

  async save(home: Home): Promise<void> {
    if (this.saving) return;
    this.saving = true;
    this.editorError = '';
    try {
      await this.store.saveHome(home);
      this.editing = null;
    } catch (error) {
      this.editorError = error instanceof Error ? error.message : 'Unable to save home.';
    } finally {
      this.saving = false;
    }
  }

  async remove(home: Home): Promise<void> {
    if (confirm(`Delete “${home.title}”?`)) await this.store.removeHome(home.id);
  }

  async clearExamples(): Promise<void> {
    if (confirm('Remove the example homes? Your own homes will stay.'))
      await this.store.removeExamples();
  }

  openDestinations(): void {
    this.commuteDraft = {
      destinations: structuredClone(this.store.destinations()),
      mode: this.store.mode(),
    };
  }

  async saveDestinations(settings: CommuteSettings): Promise<void> {
    if (this.saving) return;
    this.saving = true;
    try {
      await this.store.saveCommute(settings);
      this.commuteDraft = null;
    } catch (error) {
      this.store.report(error instanceof Error ? error.message : 'Invalid destinations.');
    } finally {
      this.saving = false;
    }
  }

  export(): void {
    this.backupFiles.download(serializeBackup(this.store.snapshot()));
  }

  async import(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    try {
      const workspace = parseBackup(await file.text());
      if (!confirm('Replace your current shortlist with this backup?')) return;
      await this.store.replace(workspace);
      this.map?.fit();
    } catch {
      this.store.report('Invalid backup. Your existing shortlist was not changed.');
    } finally {
      input.value = '';
    }
  }

  @HostListener('document:keydown.escape')
  closeDialogs(): void {
    if (this.saving) return;
    this.editing = null;
    this.commuteDraft = null;
  }
}
