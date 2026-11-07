import '@angular/compiler';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { HomesStore } from '../src/app/features/homes/state/homes.store';
import { CATALOGUE_HOMES } from '../src/app/features/homes/domain/home.catalogue';

test('the store exposes the source catalogue synchronously and supports selection', () => {
  const store = new HomesStore();
  assert.equal(store.homes, CATALOGUE_HOMES);
  assert.equal(store.activeHome(), null);
  store.select('immobiliare-134021467');
  assert.equal(store.activeHome()?.id, 'immobiliare-134021467');
  store.select(null);
  assert.equal(store.selectedId(), null);
  assert.equal(store.activeHome(), null);
});

test('unknown selection IDs cannot put the catalogue into an inconsistent state', () => {
  const store = new HomesStore();
  store.select('immobiliare-133551500');
  store.select('unknown');
  assert.equal(store.activeHome()?.id, 'immobiliare-133551500');
});

test('selection is temporary and does not carry over to another page instance', () => {
  const first = new HomesStore();
  first.select('immobiliare-134409133');
  const second = new HomesStore();
  assert.equal(second.selectedId(), null);
  assert.equal(second.homes, first.homes);
});

test('the catalogue works without any browser storage APIs', (context) => {
  const keys = ['indexedDB', 'localStorage', 'sessionStorage'] as const;
  const previous = keys.map((key) => Object.getOwnPropertyDescriptor(globalThis, key));
  context.after(() =>
    keys.forEach((key, index) => {
      const descriptor = previous[index];
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else Reflect.deleteProperty(globalThis, key);
    }),
  );
  for (const key of keys)
    Object.defineProperty(globalThis, key, {
      configurable: true,
      get: () => {
        throw new Error(`Unexpected storage access: ${key}`);
      },
    });
  const store = new HomesStore();
  assert.equal(store.homes.length, 7);
  store.select('immobiliare-133551500');
  assert.equal(store.activeHome()?.price, 685);
});
