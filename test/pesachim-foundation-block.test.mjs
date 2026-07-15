import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('Pesachim Block 4 gives learners an earned loop from source trail through Bava Metzia', async () => {
  const [page, source, engine] = await Promise.all([
    readFile(new URL('../pesachim-mastery.html', import.meta.url), 'utf8'),
    readFile(new URL('../pesachim-mastery.js', import.meta.url), 'utf8'),
    readFile(new URL('../course-engine.js', import.meta.url), 'utf8')
  ]);
  assert.match(page, /PESACHIM · FOUNDATION BLOCK 4/);
  assert.match(page, /does not issue practical Passover or halakhic rulings/);
  assert.equal((source.match(/title: '\d+ ·/g) || []).length, 6);
  for (const route of ['pesachim-arc.html', 'flagship-daf-workbench.html?tractate=pesachim', 'lab.html?tractate=pesachim', 'gemara-unseen-check.html?block=pesachim', 'canon-connection.html?tractate=pesachim', 'bava-metzia-arc.html']) assert.match(source, new RegExp(route.replace(/[.?]/g, '\\$&')));
  assert.match(source, /pesachim-unseen-transfer/);
  assert.match(source, /YOUR NEXT MOVE/);
  assert.match(engine, /'pesachim-tractate-arc':\['pesachim-mastery\.html'/);
});
