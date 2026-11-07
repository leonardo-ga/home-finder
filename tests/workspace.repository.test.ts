import '@angular/compiler';
import 'fake-indexeddb/auto';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { WorkspaceRepository } from '../src/app/core/storage/workspace.repository';

test('IndexedDB adapter round-trips records and replaces the previous snapshot', async () => {
  const repository = new WorkspaceRepository();
  assert.equal(await repository.read(), undefined);
  await repository.write({ homes: ['first'], mode: 'transit' });
  assert.deepEqual(await repository.read(), { homes: ['first'], mode: 'transit' });
  await repository.write({ homes: [], mode: 'walking' });
  assert.deepEqual(await repository.read(), { homes: [], mode: 'walking' });
});

test('IndexedDB cloning failures reject the write', async () => {
  const repository = new WorkspaceRepository();
  await assert.rejects(repository.write(() => 'uncloneable'));
});
