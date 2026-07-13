import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const retrieval = JSON.parse(await readFile(new URL('../data/non-gemara-retrieval.json', import.meta.url), 'utf8'));
test('non-Gemara retrieval covers every deepening domain with answer criteria', () => {
  assert.equal(retrieval.items.length, 7);
  for (const item of retrieval.items) {
    assert.ok(item.skillId && item.sourceContext && item.prompt && item.model);
    assert.ok(item.accepted.length >= 1);
  }
});
