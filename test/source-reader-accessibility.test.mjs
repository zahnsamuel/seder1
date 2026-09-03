import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('source reader exposes translation and Hebrew without hover-only or typed controls', async () => {
  const [html, js] = await Promise.all(['source-reader.html', 'source-reader.js'].map((file) => readFile(file, 'utf8')));
  assert.match(html, /id="hebrew"/);
  assert.match(html, /lang="he" dir="rtl"/);
  assert.match(html, /id="toggleTranslation"/);
  assert.match(html, /id="prompt"/);
  assert.match(html, /id="choices"/);
  assert.match(html, /id="feedback"/);
  assert.match(js, /Show translation/);
  assert.match(js, /Hide translation/);
  assert.doesNotMatch(js, /onmouseover|onmouseenter|:hover-only/);
  assert.doesNotMatch(html + js, /textarea/i);
});
