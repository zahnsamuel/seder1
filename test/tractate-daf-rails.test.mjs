import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('flagship tractate arcs load an interactive, source-specific Daf rail', async () => {
  const [auth, rail] = await Promise.all(['seder-auth.js', 'tractate-daf-rails.js'].map((file) => readFile(new URL(`../${file}`, import.meta.url), 'utf8')));
  assert.match(auth, /tractate-daf-rails\.js/);
  for (const tractate of ['pesachim', 'eruvin', 'sukkah', 'bava-metzia', 'bava-kamma']) assert.match(rail, new RegExp(`\\b${tractate}\\b`));
  for (const phrase of ['FOCUS IN THE DAF', 'READING AID', 'data-tractate-line', 'spec\\.modes']) assert.match(rail, new RegExp(phrase));
});
