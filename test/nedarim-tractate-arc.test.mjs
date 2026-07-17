import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('Nedarim offers a bounded legal-speech source arc', async () => {
  const [arc, page, tractatesFile, engine] = await Promise.all(['nedarim-arc.js', 'nedarim-arc.html', 'data/gemara-tractates.json', 'course-engine.js'].map((file) => readFile(file, 'utf8')));
  for (const skill of ['nedarim-substitute-term', 'nedarim-origins-dispute', 'nedarim-category-limit', 'nedarim-learning-boundary', 'nedarim-independent-map']) assert.match(arc, new RegExp(skill));
  assert.match(arc, /Mishnah Nedarim 1:1/); assert.match(arc, /Nedarim 2a/); assert.match(page, /not personal guidance about making, interpreting, or releasing vows/i);
  assert.match(engine, /'nedarim-tractate-arc':\{tractate:'nedarim'/);
  const nedarim = JSON.parse(tractatesFile).tractates.find((tractate) => tractate.title === 'Nedarim');
  assert.equal(nedarim.stage, 'tractate-arc'); assert.equal(nedarim.arcUrl, 'nedarim-arc.html');
});
