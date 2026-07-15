import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('the first Berakhot lesson includes an interactive, line-focused Daf rail', async () => {
  const [auth, rail] = await Promise.all(['seder-auth.js', 'berakhot-daf-rail.js'].map((file) => readFile(new URL(`../${file}`, import.meta.url), 'utf8')));
  assert.match(auth, /berakhot-daf-rail\.js/);
  for (const phrase of ['FOCUS IN THE DAF', 'Berakhot 2a', 'GEMARA QUESTION', 'SCRIPTURAL SIGNAL', 'READING AID']) assert.match(rail, new RegExp(phrase));
  assert.match(auth, /Show focus-word transliteration/);
  assert.match(rail, /modeToLine/);
  assert.match(rail, /data-daf-line/);
});
