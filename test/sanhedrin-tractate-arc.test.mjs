import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('Sanhedrin is a full, source-grounded tractate arc with a safe mastery handoff', async () => {
  const [html, arc, registry, workbench, tractates, sequence, entry, continuation] = await Promise.all([
    readFile(new URL('../sanhedrin-arc.html', import.meta.url), 'utf8'),
    readFile(new URL('../sanhedrin-arc.js', import.meta.url), 'utf8'),
    readFile(new URL('../course-engine.js', import.meta.url), 'utf8'),
    readFile(new URL('../flagship-daf-workbench.js', import.meta.url), 'utf8'),
    readFile(new URL('../data/gemara-tractates.json', import.meta.url), 'utf8'),
    readFile(new URL('../data/advanced-gemara-sequence.json', import.meta.url), 'utf8'),
    readFile(new URL('../sanhedrin-foundation.html', import.meta.url), 'utf8'),
    readFile(new URL('../gemara-continuation.js', import.meta.url), 'utf8')
  ]);
  for (const phrase of ['Sanhedrin 2a', 'Mishnah Sanhedrin 1:1', 'Seder learning boundary', 'typed:true', 'sanhedrin-transfer-map']) assert.match(arc, new RegExp(phrase));
  assert.match(html, /course-engine\.js/);
  assert.match(registry, /'sanhedrin-tractate-arc':\{tractate:'sanhedrin',url:'flagship-daf-workbench\.html\?tractate=sanhedrin'/);
  assert.match(workbench, /sources\.sanhedrin=/);
  assert.match(workbench, /'Mishnah case','Begin with the broad field/);
  assert.match(tractates, /"title":"Sanhedrin"[^\n]+"stage":"tractate-arc"[^\n]+"arcUrl":"sanhedrin-arc\.html"/);
  assert.match(sequence, /"stageId":"sanhedrin-tractate-arc"/);
  assert.match(entry, /sanhedrin-arc\.html/);
  assert.match(continuation, /'sanhedrin-tractate-arc': 'sanhedrin'/);
});
