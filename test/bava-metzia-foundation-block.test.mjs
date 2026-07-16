import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('Bava Metzia Block 5 enters an earned cross-canon consolidation', async () => {
  const [page, source, consolidation, consolidationEngine, engine] = await Promise.all([
    readFile(new URL('../bava-metzia-mastery.html', import.meta.url), 'utf8'),
    readFile(new URL('../bava-metzia-mastery.js', import.meta.url), 'utf8'),
    readFile(new URL('../foundation-consolidation.html', import.meta.url), 'utf8'),
    readFile(new URL('../foundation-consolidation.js', import.meta.url), 'utf8'),
    readFile(new URL('../course-engine.js', import.meta.url), 'utf8')
  ]);
  assert.match(page, /BAVA METZIA · FOUNDATION BLOCK 5/);
  assert.match(page, /does not resolve real disputes/);
  assert.equal((source.match(/title: '\d+ ·/g) || []).length, 6);
  for (const route of ['bava-metzia-arc.html', 'flagship-daf-workbench.html?tractate=bava-metzia', 'lab.html?tractate=bava-metzia', 'gemara-unseen-check.html?block=bava-metzia', 'canon-connection.html?tractate=bava-metzia', 'foundation-consolidation.html']) assert.match(source, new RegExp(route.replace(/[.?]/g, '\\$&')));
  assert.match(consolidation, /FOUNDATION CONSOLIDATION I/);
  for (const reference of ['Berakhot 2a', 'Bava Metzia 2a', 'Pirkei Avot 1:18', 'Deuteronomy 6:7', 'Mishnah Sukkah 1:1']) assert.match(consolidationEngine, new RegExp(reference.replace(/[.?]/g, '\\$&')));
  assert.match(consolidationEngine, /foundation-unseen-transfer/);
  assert.match(consolidationEngine, /sukkah-arc\.html/);
  assert.match(consolidationEngine, /stageId: 'foundation-consolidation-one'/);
  assert.match(source, /bava-metzia-unseen-transfer/);
  assert.match(engine, /'bava-metzia-tractate-arc':\{tractate:'bava-metzia',url:'flagship-daf-workbench\.html\?tractate=bava-metzia'/);
});
