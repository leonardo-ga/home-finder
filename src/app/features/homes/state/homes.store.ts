import { Injectable, computed, signal } from '@angular/core';
import { CATALOGUE_HOMES } from '../domain/home.catalogue';

/** Read-only catalogue with transient selection. No storage or mutation operations. */
@Injectable()
export class HomesStore {
  readonly homes = CATALOGUE_HOMES;
  private readonly selection = signal<string | null>(null);
  readonly selectedId = this.selection.asReadonly();
  readonly activeHome = computed(
    () => this.homes.find((home) => home.id === this.selection()) ?? null,
  );

  select(id: string | null): void {
    if (id === null || this.homes.some((home) => home.id === id)) this.selection.set(id);
  }
}
