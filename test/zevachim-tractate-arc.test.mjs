import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
test('Zevachim offers a validity-and-obligation source arc', async () => {
  const [arc, page, tractatesFile, engine] = await Promise.all(['zevachim-arc.js', 'zevachim-arc.html', 'data/gemara-tractates.json', 'course-engine.js'].map((file) => readFile(file, 'utf8')));
  for (const skill of ['zevachim-intention-case', 'zevachim-validity', 'zevachim-fulfillment', 'zevachim-learning-boundary', 'zevachim-independent-map']) assert.match(arc, new RegExp(skill));
  assert.match(arc, /Mishnah Zevachim 1:1/); assert.match(arc, /Zevachim 2a/); assert.match(page, /not practical ritual guidance/i);
  assert.match(engine, /'zevachim-tractate-arc':\{tractate:'zevachim'/);
  const zevachim = JSON.parse(tractatesFile).tractates.find((tractate) => tractate.title === 'Zevachim');
  assert.equal(zevachim.stage, 'tractate-arc'); assert.equal(zevachim.arcUrl, 'zevachim-arc.html');
});
