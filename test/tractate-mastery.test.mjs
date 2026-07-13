import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('six flagship tractates have visible full mastery loops around their existing arcs', async () => {
  const source = await readFile('tractate-mastery.js', 'utf8');
  for (const id of ['shabbat', 'pesachim', 'eruvin', 'sukkah', 'bava-metzia', 'bava-kamma']) assert.match(source, new RegExp(`['"]?${id}['"]?:`));
  for (const route of ['lab.html?tractate=shabbat', 'flagship-daf-workbench.html?tractate=shabbat', 'lab.html?tractate=pesachim', 'flagship-daf-workbench.html?tractate=pesachim', 'lab.html?tractate=eruvin', 'flagship-daf-workbench.html?tractate=eruvin', 'lab.html?tractate=sukkah', 'flagship-daf-workbench.html?tractate=sukkah', 'lab.html?tractate=bava-metzia', 'flagship-daf-workbench.html?tractate=bava-metzia', 'lab.html?tractate=bava-kamma', 'flagship-daf-workbench.html?tractate=bava-kamma', 'cross-tractate.html']) assert.match(source, new RegExp(route.replace(/[.?]/g, '\\$&')));
});
