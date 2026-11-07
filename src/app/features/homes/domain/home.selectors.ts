import { Home, HomeFilters } from './home.model';

export const MAX_COMPARISON_HOMES = 4;

export function filterHomes(homes: readonly Home[], filters: HomeFilters): Home[] {
  const query = filters.query.trim().toLowerCase();
  const result = homes.filter(
    (home) =>
      `${home.title} ${home.address} ${home.notes}`.toLowerCase().includes(query) &&
      (filters.maxPrice === null || home.price <= filters.maxPrice) &&
      (filters.minSqm === null || home.sqm >= filters.minSqm) &&
      (filters.status === 'All statuses'
        ? home.status !== 'Discarded'
        : home.status === filters.status),
  );
  if (filters.sort === 'price') result.sort((a, b) => a.price - b.price);
  if (filters.sort === 'size') result.sort((a, b) => b.sqm - a.sqm);
  return result;
}

export function toggleComparison(ids: ReadonlySet<string>, id: string): Set<string> {
  const next = new Set(ids);
  if (next.has(id)) next.delete(id);
  else if (next.size < MAX_COMPARISON_HOMES) next.add(id);
  else throw new Error(`Compare up to ${MAX_COMPARISON_HOMES} homes at a time.`);
  return next;
}
