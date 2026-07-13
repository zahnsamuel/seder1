import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const courses = [
  ['berakhot-unit-5.js', 'berakhot'], ['shabbat-arc.js', 'shabbat'], ['eruvin-arc.js', 'eruvin'],
  ['pesachim-arc.js', 'pesachim'], ['sukkah-arc.js', 'sukkah'], ['bava-metzia-arc.js', 'bava']
];

test('every flagship Gemara course reaches a visible Daf Workbench, directly or through its mastery loop', async () => {
  for (const [file, tractate] of courses) {
    const source = await readFile(new URL(`../${file}`, import.meta.url), 'utf8');
    assert.match(source, new RegExp(`daf-workbench\\.html\\?tractate=${tractate}|tractate-mastery\\.html\\?tractate=${tractate}`));
  }
});
