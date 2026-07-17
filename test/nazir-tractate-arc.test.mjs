import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
test('Nazir offers a cross-tractate status source arc', async () => {
  const [arc, page, tractatesFile, engine] = await Promise.all(['nazir-arc.js', 'nazir-arc.html', 'data/gemara-tractates.json', 'course-engine.js'].map((file) => readFile(file, 'utf8')));
  for (const skill of ['nazir-substitute-term', 'nazir-nedarim-transfer', 'nazir-default-duration', 'nazir-learning-boundary', 'nazir-independent-map']) assert.match(arc, new RegExp(skill));
  assert.match(arc, /Mishnah Nazir 1:1/); assert.match(arc, /Nazir 2a/); assert.match(page, /not guidance about accepting, ending, or applying a nazirite vow/i);
  assert.match(engine, /'nazir-tractate-arc':\{tractate:'nazir'/);
  const nazir = JSON.parse(tractatesFile).tractates.find((tractate) => tractate.title === 'Nazir');
  assert.equal(nazir.stage, 'tractate-arc'); assert.equal(nazir.arcUrl, 'nazir-arc.html');
});
