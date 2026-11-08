import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CATALOGUE_HOMES } from '../src/app/features/homes/domain/home.catalogue';
import { sortHomes } from '../src/app/features/homes/domain/home.sort';

test('monthly ordering includes condominium fees and never mutates the catalogue', () => {
  const original = CATALOGUE_HOMES.map((home) => home.id);
  const sorted = sortHomes(CATALOGUE_HOMES, 'monthly', 'asc');
  assert.deepEqual(
    sorted.map((home) => home.price + home.fees),
    [750, 800, 873, 900, 950, 1000, 1000],
  );
  assert.deepEqual(
    CATALOGUE_HOMES.map((home) => home.id),
    original,
  );
  assert.equal(sortHomes(CATALOGUE_HOMES, 'catalogue'), CATALOGUE_HOMES);
  assert.deepEqual(
    sortHomes(CATALOGUE_HOMES, 'monthly', 'desc').map((home) => home.price + home.fees),
    [1000, 1000, 950, 900, 873, 800, 750],
  );
});

test('space and unit-rent rankings use the actual corresponding metrics', () => {
  assert.equal(sortHomes(CATALOGUE_HOMES, 'area', 'desc')[0]?.sqm, 55);
  assert.equal(sortHomes(CATALOGUE_HOMES, 'unit-rent')[0]?.id, 'immobiliare-132198580');
});

test('unknown deposits follow known deposits and equal values retain original order', () => {
  const sorted = sortHomes(CATALOGUE_HOMES, 'deposit', 'asc');
  assert.deepEqual(
    sorted.map((home) => home.deposit),
    [2055, 2100, 2250, 2760, undefined, undefined, undefined],
  );
  assert.deepEqual(
    sortHomes(CATALOGUE_HOMES, 'deposit', 'desc').map((home) => home.deposit),
    [2760, 2250, 2100, 2055, undefined, undefined, undefined],
  );
  assert.equal(sortHomes(CATALOGUE_HOMES, 'area', 'asc')[0]?.sqm, 39);
  assert.equal(sortHomes(CATALOGUE_HOMES, 'unit-rent', 'desc')[0]?.id, 'immobiliare-130146018');
  const ascending = sortHomes(CATALOGUE_HOMES, 'monthly', 'asc');
  assert.deepEqual(
    ascending.filter((home) => home.price + home.fees === 1000).map((home) => home.id),
    ['immobiliare-134021467', 'immobiliare-132198580'],
  );
});
