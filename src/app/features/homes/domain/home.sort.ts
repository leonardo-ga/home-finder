import { Home } from './home.model';

export const HOME_SORT_CRITERIA = [
  { value: 'catalogue', label: 'Ordine base' },
  { value: 'monthly', label: 'Costo mensile' },
  { value: 'unit-rent', label: 'Canone / m²' },
  { value: 'area', label: 'Spazio' },
  { value: 'deposit', label: 'Cauzione' },
] as const;

export type HomeSortCriterion = (typeof HOME_SORT_CRITERIA)[number]['value'];
export type SortDirection = 'asc' | 'desc';

/** Keep source order for ties and unknown deposits last in both directions. */
export function sortHomes(
  homes: readonly Home[],
  criterion: HomeSortCriterion,
  direction: SortDirection = 'asc',
): readonly Home[] {
  if (criterion === 'catalogue') return homes;
  const sign = direction === 'asc' ? 1 : -1;
  return [...homes].sort((a, b) => {
    switch (criterion) {
      case 'monthly':
        return sign * (a.price + a.fees - b.price - b.fees);
      case 'unit-rent':
        return sign * (a.price / a.sqm - b.price / b.sqm);
      case 'area':
        return sign * (a.sqm - b.sqm);
      case 'deposit':
        if (a.deposit === undefined) return b.deposit === undefined ? 0 : 1;
        if (b.deposit === undefined) return -1;
        return sign * (a.deposit - b.deposit);
    }
  });
}
