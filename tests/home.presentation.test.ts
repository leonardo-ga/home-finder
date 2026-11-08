import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CATALOGUE_HOMES } from '../src/app/features/homes/domain/home.catalogue';
import { HOME_STATUSES } from '../src/app/features/homes/domain/home.model';
import {
  HOME_STATUS_LABELS,
  formatRentPerSquareMetre,
} from '../src/app/features/homes/components/home.presentation';

test('unit rent uses monthly rent only and rounds to two Italian decimal places', () => {
  const home = { ...CATALOGUE_HOMES[0]!, price: 1000, sqm: 33, fees: 500 };
  assert.equal(formatRentPerSquareMetre(home).replace(/\s/g, ' '), '30,30 €');
  assert.equal(formatRentPerSquareMetre(CATALOGUE_HOMES[0]!).replace(/\s/g, ' '), '15,22 €');
});

test('every stored status has an Italian display label', () => {
  assert.ok(HOME_STATUSES.every((status) => HOME_STATUS_LABELS[status].length > 0));
  assert.equal(HOME_STATUS_LABELS.Shortlisted, 'Da valutare');
});
