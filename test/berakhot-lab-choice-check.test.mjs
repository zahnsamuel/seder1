import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('Berakhot independent source check uses shuffled choices instead of a text input', async () => {
  const source = await readFile(new URL('../berakhot-lab.js', import.meta.url), 'utf8');
  assert.match(source, /Which meaning belongs to this source line/);
  assert.match(source, /shuffle\(choices\)/);
  assert.doesNotMatch(source, /typedInput|Type your answer|document\.createElement\('input'\)/);
});
