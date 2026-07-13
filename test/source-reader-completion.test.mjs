import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('source reader requires a full line-by-line reading and reflection before completion', async () => {
  const source = await readFile(new URL('../source-reader.js', import.meta.url), 'utf8');
  assert.match(source, /Close the reading loop/);
  assert.match(source, /Complete this passage/);
  assert.match(source, /source_reading_completed/);
  assert.match(source, /collection\.lines\.length - viewed\.size/);
});
