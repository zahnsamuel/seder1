import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('source reader exposes translation and reading focus without hover-only controls', async () => {
  const [html, js] = await Promise.all(['source-reader.html', 'source-reader.js'].map((file) => readFile(file, 'utf8')));
  assert.match(html, /id="focus"/);
  assert.match(js, /Show translation/);
  assert.match(js, /Focus this line/);
  assert.match(js, /lang="he" dir="rtl"/);
});
