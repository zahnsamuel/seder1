import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
test('Chagigah offers a historically careful rule-and-exception source arc', async () => {
  const [arc, page, tractatesFile, engine] = await Promise.all(['chagigah-arc.js', 'chagigah-arc.html', 'data/gemara-tractates.json', 'course-engine.js'].map((file) => readFile(file, 'utf8')));
  for (const skill of ['chagigah-broad-claim', 'chagigah-historical-classification', 'chagigah-scope-question', 'chagigah-learning-boundary', 'chagigah-independent-map']) assert.match(arc, new RegExp(skill));
  assert.match(arc, /Mishnah Chagigah 1:1/); assert.match(arc, /Chagigah 2a/); assert.match(page, /not personal guidance about religious obligation, disability, or participation/i);
  assert.match(engine, /'chagigah-tractate-arc':\{tractate:'chagigah'/);
  const chagigah = JSON.parse(tractatesFile).tractates.find((tractate) => tractate.title === 'Chagigah');
  assert.equal(chagigah.stage, 'tractate-arc'); assert.equal(chagigah.arcUrl, 'chagigah-arc.html');
});
