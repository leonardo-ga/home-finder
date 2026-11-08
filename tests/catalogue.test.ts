import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CATALOGUE_HOMES } from '../src/app/features/homes/domain/home.catalogue';
import { isHome } from '../src/app/features/homes/domain/home.validation';

test('the catalogue contains exactly the eight selected, valid listings', () => {
  assert.deepEqual(
    CATALOGUE_HOMES.map((home) => home.url),
    [
      'https://www.immobiliare.it/annunci/133551500/',
      'https://www.immobiliare.it/annunci/134409133/',
      'https://www.immobiliare.it/annunci/134021467/',
      'https://www.immobiliare.it/annunci/132198580/',
      'https://www.immobiliare.it/annunci/132703154/',
      'https://www.immobiliare.it/annunci/130146018/',
      'https://www.immobiliare.it/annunci/133519316/',
      'https://www.immobiliare.it/annunci/130761760/',
    ],
  );
  assert.ok(CATALOGUE_HOMES.every(isHome));
  assert.equal(new Set(CATALOGUE_HOMES.map((home) => home.id)).size, CATALOGUE_HOMES.length);
  assert.deepEqual(
    CATALOGUE_HOMES.map((home) => home.price + home.fees),
    [750, 900, 1000, 1000, 800, 950, 873, 1000],
  );
});

test('catalogue records and the catalogue array cannot be changed at runtime', () => {
  assert.ok(Object.isFrozen(CATALOGUE_HOMES));
  assert.ok(CATALOGUE_HOMES.every(Object.isFrozen));
  assert.equal(Reflect.set(CATALOGUE_HOMES, 'length', 0), false);
  assert.equal(Reflect.set(CATALOGUE_HOMES[0]!, 'price', 1), false);
  assert.equal(CATALOGUE_HOMES.length, 8);
  assert.equal(CATALOGUE_HOMES[0]?.price, 685);
});
