import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
test('canon map has a learner-facing progression from foundation through synthesis', async () => {
  const html = await readFile(new URL('../canon-map.html', import.meta.url), 'utf8');
  const js = await readFile(new URL('../canon-map.js', import.meta.url), 'utf8');
  assert.match(html, /foundations, deepening, retrieval, then synthesis/);
  assert.match(js, /Build foundations/);
  assert.match(js, /Synthesize/);
});
