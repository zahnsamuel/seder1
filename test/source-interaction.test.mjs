import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
test('anchor units load word-level source interaction', async () => {
  const html = await readFile(new URL('../anchor-unit.html', import.meta.url), 'utf8');
  const js = await readFile(new URL('../anchor-unit.js', import.meta.url), 'utf8');
  assert.match(html, /source-interaction\.js/);
  assert.match(js, /SederSourceInteraction\.enhance/);
});
