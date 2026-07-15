import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('every interactive flagship source trail hands learners into a written sugya map', async () => {
  const routes = {
    'pesachim-arc.js': 'pesachim',
    'eruvin-arc.js': 'eruvin',
    'sukkah-arc.js': 'sukkah',
    'bava-metzia-arc.js': 'bava-metzia',
    'bava-kamma-arc.js': 'bava-kamma'
  };
  await Promise.all(Object.entries(routes).map(async ([file, tractate]) => {
    const source = await readFile(new URL(`../${file}`, import.meta.url), 'utf8');
    assert.match(source, new RegExp(`nextUrl:'flagship-daf-workbench\\.html\\?tractate=${tractate}'`));
    assert.match(source, /Build the .*sugya map/);
  }));
  const workspace = await readFile(new URL('../daf-argument-map.js', import.meta.url), 'utf8');
  assert.match(workspace, /Explain one transition in this sugya/);
  assert.match(workspace, /source_map_completed/);
});
