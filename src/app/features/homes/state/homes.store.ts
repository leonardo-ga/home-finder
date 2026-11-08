import { Injectable, computed, signal } from '@angular/core';
import { CATALOGUE_HOMES } from '../domain/home.catalogue';
import { HomeSortCriterion, SortDirection, sortHomes } from '../domain/home.sort';

/** Read-only catalogue with transient selection. No storage or mutation operations. */
@Injectable()
export class HomesStore {
  readonly homes = CATALOGUE_HOMES;
  private readonly criterion = signal<HomeSortCriterion>('catalogue');
  private readonly direction = signal<SortDirection>('asc');
  readonly sortCriterion = this.criterion.asReadonly();
  readonly sortDirection = this.direction.asReadonly();
  readonly orderedHomes = computed(() =>
    sortHomes(this.homes, this.sortCriterion(), this.sortDirection()),
  );
  private readonly selection = signal<string | null>(null);
  readonly selectedId = this.selection.asReadonly();
  readonly activeHome = computed(
    () => this.homes.find((home) => home.id === this.selection()) ?? null,
  );

  select(id: string | null): void {
    if (id === null || this.homes.some((home) => home.id === id)) this.selection.set(id);
  }

  setSortCriterion(criterion: HomeSortCriterion): void {
    this.criterion.set(criterion);
  }
  toggleSortDirection(): void {
    this.direction.update((direction) => (direction === 'asc' ? 'desc' : 'asc'));
  }
}
