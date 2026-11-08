import { Home, HomeStatus } from '../domain/home.model';
import { formatMoney } from '../../../shared/money';

export const HOME_STATUS_LABELS: Record<HomeStatus, string> = {
  Shortlisted: 'Da valutare',
  'Visit planned': 'Visita programmata',
  Visited: 'Visitato',
  Discarded: 'Scartato',
};

/** Monthly rent per square metre; condominium fees are excluded. */
export function formatRentPerSquareMetre(home: Home): string {
  return formatMoney(home.price / home.sqm, 2);
}
