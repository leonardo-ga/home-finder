import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CATALOGUE_HOMES } from '../src/app/features/homes/domain/home.catalogue';
import { homeCosts } from '../src/app/features/homes/domain/home.costs';

test('known monthly costs and deposit are reported separately', () => {
  assert.deepEqual(homeCosts(CATALOGUE_HOMES[0]!), {
    monthly: 750,
    deposit: 2055,
  });
});

test('missing deposits remain unknown rather than implying a zero initial cost', () => {
  assert.deepEqual(homeCosts(CATALOGUE_HOMES[3]!), {
    monthly: 1000,
    deposit: null,
  });
});

test('the three-month deposit in the Cucchiari description is kept outside monthly rent', () => {
  const home = CATALOGUE_HOMES.find((home) => home.id === 'immobiliare-133519316')!;
  assert.equal(home.deposit, home.price * 3);
  assert.equal(homeCosts(home).monthly, 873);
  assert.equal(homeCosts(home).deposit, 2250);
});
