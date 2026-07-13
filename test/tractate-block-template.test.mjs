import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('tractate block template requires a second source, Daf map, retrieval, and transfer', async () => {
  const template = JSON.parse(await readFile(new URL('../data/tractate-block-template.json', import.meta.url), 'utf8'));
  assert.deepEqual(template.requiredStages.map((stage) => stage.id), ['orientation', 'language', 'argument', 'second-source', 'daf-map', 'retrieval', 'transfer']);
  for (const field of ['reference', 'translation', 'misconception', 'secondSource', 'transferPrompt']) assert.ok(template.packetFields.includes(field));
});

test('Shabbat is a deep case-mapping block with a second source and transfer route', async () => {
  const [block, sequence] = await Promise.all(['docs/shabbat-foundation-block.md', 'data/gemara-source-sequences.json'].map((file) => readFile(new URL(`../${file}`, import.meta.url), 'utf8')));
  for (const route of ['shabbat-arc.html', 'daf-workbench.html?tractate=shabbat', 'lab.html?tractate=shabbat', 'gemara-unseen-check.html']) assert.match(block, new RegExp(route.replace(/[.?]/g, '\\$&')));
  const shabbat = JSON.parse(sequence).sequences.find((item) => item.tractate === 'shabbat');
  assert.equal(shabbat.packets[1][2], 'shabbat-arc.html');
});
