import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('placement samples Gemara and the broader canon before choosing a path', async () => {
  const source = await readFile('placement.js', 'utf8');
  for (const skill of ['hebrew-decoding', 'gemara-moves', 'halakha-torah-directive', 'tanakh-address-claim', 'thought-identify-claim', 'liturgical-function', 'historical-context', 'comparative-reading', 'conceptual-application']) assert.match(source, new RegExp(skill));
  assert.match(source, /checks\.length/);
});
