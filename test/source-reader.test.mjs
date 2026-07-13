import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
const reader = JSON.parse(await readFile(new URL('../data/non-gemara-source-reader.json', import.meta.url), 'utf8'));
test('source reader offers five full short-passage collections with links and notes', () => {
  assert.equal(reader.collections.length, 5);
  for (const source of reader.collections) {
    assert.ok(source.sourceUrl && source.connectionUrl);
    assert.ok(source.lines.length >= 2);
  }
});
