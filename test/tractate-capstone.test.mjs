import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('flagship tractate capstones require a case, a Gemara move, and a source-grounded explanation', async () => {
  const [html, js] = await Promise.all(['tractate-capstone.html', 'tractate-capstone.js'].map((file) => readFile(file, 'utf8')));
  assert.match(html, /CASE OR FACT PATTERN/);
  assert.match(html, /GEMARA READING MOVE/);
  assert.match(js, /tractate_capstone/);
  for (const id of ['berakhot', 'shabbat', 'pesachim', 'eruvin', 'sukkah', 'bava-metzia', 'bava-kamma']) assert.match(js, new RegExp(`['"]?${id}['"]?:`));
});
