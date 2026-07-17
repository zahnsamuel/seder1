import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('the Chassidus canon arc ends in a source-grounded production check', async () => {
  const source = await readFile(new URL('../canon-arc.js', import.meta.url), 'utf8');
  assert.match(source, /chassidus-source-check/);
  assert.match(source, /mode:'SOURCE CHECK'/);
  assert.match(source, /Choose the text-grounded reading move/);
});
