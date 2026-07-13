import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('saved reader words become recall items and return inside the Gemara mastery loop', async () => {
  const [vocabulary, mastery] = await Promise.all(['canon-vocabulary.js', 'tractate-mastery.js'].map((file) => readFile(new URL(`../${file}`, import.meta.url), 'utf8')));
  assert.match(vocabulary, /seder-personal-vocabulary/);
  assert.match(vocabulary, /Your source vocabulary/);
  assert.match(vocabulary, /terms: \[\.\.\.personal, \.\.\.result\.terms\]/);
  assert.match(mastery, /Cumulative vocabulary/);
});
