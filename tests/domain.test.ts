import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Home, DEFAULT_FILTERS } from '../src/app/features/homes/domain/home.model';
import { filterHomes, toggleComparison } from '../src/app/features/homes/domain/home.selectors';
import {
  isHome,
  parseBackup,
  parseWorkspace,
  serializeBackup,
} from '../src/app/features/homes/domain/home.validation';
import { createExampleWorkspace } from '../src/app/features/homes/domain/home.examples';
import { googleMapsRoute } from '../src/app/features/homes/domain/commute';

export function home(overrides: Partial<Home> = {}): Home {
  return {
    id: 'one',
    title: 'Test home',
    address: 'Milan',
    price: 1000,
    fees: 150,
    sqm: 50,
    rooms: 2,
    bathrooms: 1,
    floor: 1,
    energy: 'C',
    lat: 45,
    lng: 9,
    status: 'Shortlisted',
    notes: 'Quiet garden',
    url: '',
    photo: '',
    elevator: true,
    outdoor: true,
    ...overrides,
  };
}

test('filters combine text, price, area and explicit discarded status', () => {
  const homes = [
    home(),
    home({ id: 'two', price: 1500 }),
    home({ id: 'three', status: 'Discarded' }),
  ];
  const filters = { ...DEFAULT_FILTERS, query: ' GARDEN ', maxPrice: 1200, minSqm: 40 };
  assert.deepEqual(
    filterHomes(homes, filters).map((item) => item.id),
    ['one'],
  );
  assert.deepEqual(
    filterHomes(homes, { ...filters, status: 'Discarded' }).map((item) => item.id),
    ['three'],
  );
  assert.equal(filterHomes(homes, { ...DEFAULT_FILTERS, maxPrice: 0 }).length, 0);
});

test('sorting never mutates source order', () => {
  const homes = [home({ id: 'expensive', price: 1600 }), home({ id: 'cheap', price: 900 })];
  assert.equal(filterHomes(homes, { ...DEFAULT_FILTERS, sort: 'price' })[0]?.id, 'cheap');
  assert.equal(homes[0]?.id, 'expensive');
});

test('comparison enforces its limit without mutating the input set', () => {
  const ids = new Set(['a', 'b', 'c', 'd']);
  assert.throws(() => toggleComparison(ids, 'e'));
  assert.equal(toggleComparison(ids, 'a').size, 3);
  assert.equal(ids.size, 4);
});

test('one validation contract rejects invalid form and backup records', () => {
  for (const change of [
    { fees: -1 },
    { price: NaN },
    { lat: 91 },
    { lng: -181 },
    { sqm: 0 },
    { rooms: 0 },
    { bathrooms: 1.5 },
    { floor: 2.2 },
    { title: ' ' },
    { id: '' },
    { url: 'javascript:alert(1)' },
    { photo: 'https://' },
    { url: 'https://user:secret@example.com' },
  ]) {
    assert.equal(isHome(home(change)), false, JSON.stringify(change));
    assert.throws(() => parseWorkspace({ ...createExampleWorkspace(), homes: [home(change)] }));
  }
  assert.equal(isHome(home({ url: 'https://example.com/listing' })), true);
});

test('backup round-trip preserves homes, destinations and travel mode', () => {
  const workspace = createExampleWorkspace();
  workspace.mode = 'walking';
  workspace.destinations[0] = { name: 'Office', address: 'Milan' };
  assert.deepEqual(parseBackup(serializeBackup(workspace)), workspace);
});

test('original version-1 backups and stored workspaces default to transit', () => {
  const legacy = { ...createExampleWorkspace(), mode: undefined };
  assert.equal(parseWorkspace(legacy).mode, 'transit');
  assert.equal(parseBackup(JSON.stringify({ ...legacy, version: 1 })).mode, 'transit');
});

test('duplicate IDs, malformed settings and unsupported backup versions are rejected', () => {
  const workspace = createExampleWorkspace();
  assert.throws(() => parseWorkspace({ ...workspace, homes: [home(), home()] }));
  assert.throws(() => parseWorkspace({ ...workspace, destinations: [] }));
  assert.throws(() => parseWorkspace({ ...workspace, mode: 'plane' }));
  assert.throws(() => parseBackup('{'));
  assert.throws(() => parseBackup(JSON.stringify({ ...workspace, version: 2 })));
});

test('route links encode destination parameters correctly', () => {
  const destination = { name: 'Office', address: 'Via A & B, Milano' };
  const url = new URL(googleMapsRoute(home(), destination, 'transit'));
  assert.equal(url.searchParams.get('destination'), destination.address);
  assert.equal(url.searchParams.get('origin'), '45,9');
  assert.equal(url.searchParams.get('travelmode'), 'transit');
});
