import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
const reader=JSON.parse(await readFile(new URL('../data/additional-source-reader.json',import.meta.url),'utf8'));
test('additional reader collections cover Amidah and exile history', () => {
  assert.deepEqual(reader.collections.map((x) => x.id), ['amidah', 'exile']);
  assert.ok(reader.collections.every((x) => x.lines.length === 3));
  for (const source of reader.collections) {
    for (const line of source.lines) {
      assert.ok(line.answers.length >= 2 && line.answers.length <= 3);
      assert.ok(line.answers[line.correct]);
    }
  }
});
