import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('advanced Gemara sequence exposes every post-entry tractate arc', async () => {
  const [catalog, sequence] = await Promise.all([
    readFile('data/gemara-tractates.json', 'utf8').then(JSON.parse),
    readFile('data/advanced-gemara-sequence.json', 'utf8').then(JSON.parse)
  ]);
  const catalogStages = catalog.tractates.filter((tractate) => !tractate.entry).map((tractate) => `${tractate.title.toLowerCase().replace(/\s+/g, '-')}-tractate-arc`);
  const sequenceStages = sequence.steps.map((step) => step.stageId);
  assert.equal(new Set(sequenceStages).size, sequenceStages.length, 'sequence should not repeat a stage');
  for (const stageId of catalogStages) assert.ok(sequenceStages.includes(stageId), `${stageId} must be reachable in the advanced sequence`);
});
