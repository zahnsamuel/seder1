import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('Chanukah machloket is a source-based, boundary-aware second worked disagreement', async () => {
  const [html, source] = await Promise.all(['halakha-chanukah.html', 'halakha-chanukah.js'].map((file) => readFile(file, 'utf8')));
  assert.match(html, /not practical lighting guidance/i);
  assert.match(source, /Shabbat 21b/);
  assert.match(source, /מעלין בקדש ואין מורידין/);
  assert.match(source, /halakha-chanukah-boundary/);
  assert.match(source, /typed:true/);
  assert.equal((source.match(/skill:'halakha-chanukah-/g) || []).length, 10);
});
