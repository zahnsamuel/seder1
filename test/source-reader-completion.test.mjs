import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('source reader completes after every line without a typed reflection', async () => {
  const source = await readFile(new URL('../source-reader.js', import.meta.url), 'utf8');
  assert.match(source, /Complete this passage/);
  assert.match(source, /source_reading_completed/);
  assert.match(source, /seder-source-reader-seen-/);
  assert.match(source, /seder-source-reader-complete-/);
  assert.match(source, /viewed\.size >= collection\.lines\.length|current >= collection\.lines\.length - 1/);
  assert.doesNotMatch(source, /reading-reflection/);
  assert.doesNotMatch(source, /reflection,/);
  assert.doesNotMatch(source, /textarea/);
  assert.match(source, /location\.assign/);
  assert.match(source, /source-reader\.html\?collection=/);
  assert.match(source, /nextPageHref/);
});
