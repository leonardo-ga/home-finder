import '@angular/compiler';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { WorkspaceRepository } from '../src/app/core/storage/workspace.repository';
import { HomesStore } from '../src/app/features/homes/data-access/homes.store';
import { createExampleWorkspace } from '../src/app/features/homes/domain/home.examples';
import { Home, Workspace } from '../src/app/features/homes/domain/home.model';

class MemoryRepository extends WorkspaceRepository {
  value: unknown = { ...createExampleWorkspace(), homes: [], demo: false };
  failRead = false;
  failWrite = false;
  writes: Workspace[] = [];
  override async read(): Promise<unknown> {
    if (this.failRead) throw new Error('read failed');
    return structuredClone(this.value);
  }
  override async write(value: unknown): Promise<void> {
    if (this.failWrite) throw new Error('write failed');
    this.value = structuredClone(value);
    this.writes.push(value as Workspace);
  }
}

function fixture(): Home {
  return { ...createExampleWorkspace().homes[0]!, id: 'personal-home' };
}

test('mutation before initialization cannot race with loading', async () => {
  const store = new HomesStore(new MemoryRepository());
  await assert.rejects(store.saveHome(fixture()), /wait/);
  await store.initialize();
  assert.equal(store.ready(), true);
  assert.equal(store.homes().length, 0);
});

test('save updates by ID, uses defensive copies and reports transaction completion', async () => {
  const repository = new MemoryRepository();
  const store = new HomesStore(repository);
  await store.initialize();
  const draft = fixture();
  const save = store.saveHome(draft);
  assert.equal(store.persistence(), 'saving');
  draft.title = 'Unsaved mutation';
  await save;
  assert.notEqual(store.homes()[0]?.title, draft.title);
  await store.saveHome({ ...fixture(), price: 1700 });
  assert.equal(store.homes().length, 1);
  assert.equal(store.homes()[0]?.price, 1700);
  assert.equal(store.persistence(), 'saved');
});

test('failed writes retain editable data and cannot display a success notification', async () => {
  const repository = new MemoryRepository();
  repository.failWrite = true;
  const store = new HomesStore(repository);
  await store.initialize();
  await store.saveHome(fixture());
  assert.equal(store.homes().length, 1);
  assert.equal(store.persistence(), 'unsaved');
  assert.match(store.notice(), /could not be saved/);
  repository.failWrite = false;
  await store.saveHome({ ...fixture(), price: 1800 });
  assert.equal(store.persistence(), 'saved');
});

test('unreadable stored data is never overwritten with sample data', async () => {
  const repository = new MemoryRepository();
  repository.value = { malformed: true };
  const store = new HomesStore(repository);
  await store.initialize();
  await store.saveHome(fixture());
  assert.equal(store.persistence(), 'unsaved');
  assert.equal(repository.writes.length, 0);
  assert.deepEqual(repository.value, { malformed: true });
});

test('writes are serialized and the final persisted snapshot is the latest mutation', async () => {
  const repository = new MemoryRepository();
  const store = new HomesStore(repository);
  await store.initialize();
  await Promise.all([store.saveHome(fixture()), store.saveHome({ ...fixture(), price: 1900 })]);
  assert.equal(repository.writes.length, 2);
  assert.equal(repository.writes[1]?.homes[0]?.price, 1900);
  assert.equal(store.persistence(), 'saved');
});

test('removing examples prunes stale selections and comparison entries', async () => {
  const repository = new MemoryRepository();
  repository.value = createExampleWorkspace();
  const store = new HomesStore(repository);
  await store.initialize();
  store.select('demo-1');
  store.toggleCompare('demo-1');
  await store.saveHome(fixture());
  store.toggleCompare('personal-home');
  await store.removeExamples();
  assert.deepEqual(
    store.homes().map((home) => home.id),
    ['personal-home'],
  );
  assert.deepEqual([...store.comparisonIds()], ['personal-home']);
});

test('invalid replacement data does not change the existing workspace', async () => {
  const repository = new MemoryRepository();
  const store = new HomesStore(repository);
  await store.initialize();
  await store.saveHome(fixture());
  await assert.rejects(
    store.replace({ ...createExampleWorkspace(), homes: [{ ...fixture(), lat: 999 }] }),
  );
  assert.equal(store.homes()[0]?.lat, fixture().lat);
});

test('commute drafts and exported snapshots cannot mutate live state', async () => {
  const store = new HomesStore(new MemoryRepository());
  await store.initialize();
  const settings = {
    destinations: createExampleWorkspace().destinations,
    mode: 'walking' as const,
  };
  await store.saveCommute(settings);
  settings.destinations[0].address = 'Unsaved';
  const snapshot = store.snapshot();
  snapshot.destinations[0].name = 'Changed snapshot';
  assert.equal(store.mode(), 'walking');
  assert.equal(store.destinations()[0].address, '');
  assert.notEqual(store.destinations()[0].name, 'Changed snapshot');
});
