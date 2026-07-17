import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('flagship tractate capstones require guided source judgments, not typed prose', async () => {
  const [html, js] = await Promise.all(['tractate-capstone.html', 'tractate-capstone.js'].map((file) => readFile(file, 'utf8')));
  assert.match(html, /CASE OR FACT PATTERN/);
  assert.match(html, /GEMARA READING MOVE/);
  assert.match(html, /SOURCE-GROUNDED JUDGMENT/);
  assert.doesNotMatch(html, /textarea/i);
  assert.match(js, /tractate_capstone/);
  assert.match(js, /judgment !== 'separate'/);
  for (const id of ['berakhot', 'shabbat', 'pesachim', 'eruvin', 'sukkah', 'bava-metzia', 'bava-kamma']) assert.match(js, new RegExp(`['"]?${id}['"]?:`));
});
