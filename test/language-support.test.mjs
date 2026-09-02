import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('language-support module still exists, but the one-line reader does not mount it', async () => {
  const [html, source] = await Promise.all(['source-reader.html', 'source-reader-language.js'].map((file) => readFile(new URL(`../${file}`, import.meta.url), 'utf8')));
  assert.doesNotMatch(html, /source-reader-language\.js/);
  assert.doesNotMatch(html, /textarea/i);
  assert.match(source, /Hear Hebrew/);
  assert.match(source, /SpeechSynthesisUtterance/);
  assert.match(source, /Save key word/);
  assert.match(source, /seder-personal-vocabulary/);
  assert.match(source, /Language lens/);
  assert.match(source, /Read this line before translating/);
  assert.match(source, /Practice this reading skill in the language ladder/);
});
