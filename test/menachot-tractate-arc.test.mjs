import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('Menachot offers a parallel-and-exception Kodashim source arc', async () => {
  const [arc, page, tractatesFile, engine] = await Promise.all(['menachot-arc.js', 'menachot-arc.html', 'data/gemara-tractates.json', 'course-engine.js'].map((file) => readFile(file, 'utf8')));
  for (const skill of ['menachot-parallel-case', 'menachot-validity-transfer', 'menachot-exception-locate', 'menachot-learning-boundary', 'menachot-independent-transfer']) assert.match(arc, new RegExp(skill));
  assert.match(arc, /Mishnah Menachot 1:1/); assert.match(arc, /Menachot 2a/); assert.match(page, /not practical ritual guidance/i);
  assert.match(engine, /'menachot-tractate-arc':\{tractate:'menachot'/);
  const menachot = JSON.parse(tractatesFile).tractates.find((tractate) => tractate.title === 'Menachot');
  assert.equal(menachot.stage, 'tractate-arc'); assert.equal(menachot.arcUrl, 'menachot-arc.html');
});
