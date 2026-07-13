import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('Berakhot arc visibly connects decoding, sugya flow, Daf work, and transfer', async () => {
  const source = await readFile('berakhot-mastery.js', 'utf8');
  for (const url of ['berakhot-lab.html', 'berakhot-deep.html', 'daf-workbench.html?tractate=berakhot', 'cross-tractate.html']) assert.match(source, new RegExp(url.replace(/[.?]/g, '\\$&')));
});
