import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('source reader makes language help available inside each source line', async () => {
  const [html, source] = await Promise.all(['source-reader.html', 'source-reader-language.js'].map((file) => readFile(new URL(`../${file}`, import.meta.url), 'utf8')));
  assert.match(html, /source-reader-language\.js/);
  assert.match(source, /Hear Hebrew/);
  assert.match(source, /SpeechSynthesisUtterance/);
  assert.match(source, /Save key word/);
  assert.match(source, /seder-personal-vocabulary/);
  assert.match(source, /Language lens/);
  assert.match(source, /Read this line before translating/);
  assert.match(source, /Practice this reading skill in the language ladder/);
});
