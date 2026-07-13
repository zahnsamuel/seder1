import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('canon course keeps the next move accessible directly beneath answer feedback', async () => {
  const source = await readFile(new URL('../canon-course.js', import.meta.url), 'utf8');
  assert.match(source, /id="continue" class="continue"/);
  assert.match(source, /Continue &rarr;/);
  assert.match(source, /id="retry" class="continue"/);
  assert.match(source, /Try this reading again/);
  assert.match(source, /aria-live="polite"/);
});
