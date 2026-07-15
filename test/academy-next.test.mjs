import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const root = new URL('..', import.meta.url);
const read = (file) => readFile(new URL(file, root), 'utf8');
test('Academy completion hands learners into one evidence-led next mastery cycle', async () => {
  const [academy, next, html] = await Promise.all([read('academy.js'), read('academy-next.js'), read('academy-next.html')]);
  assert.match(academy, /academyComplete/); assert.match(academy, /academy-next\.html/); assert.match(next, /scoreDomain/); assert.match(next, /Gemara reasoning/); assert.match(next, /Canon connection/); assert.match(next, /weekly-review\.html/); assert.match(html, /One path\. Your next move\./); assert.match(html, /study-record\.html/);
});
