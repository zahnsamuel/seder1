import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
test('Bava Batra offers a source-grounded shared-property arc', async () => {
  const [arc, page, tractatesFile, engine] = await Promise.all(['bava-batra-arc.js', 'bava-batra-arc.html', 'data/gemara-tractates.json', 'course-engine.js'].map((file) => readFile(file, 'utf8')));
  for (const skill of ['bava-batra-shared-case', 'bava-batra-sight-harm', 'bava-batra-measure-reason', 'bava-batra-independent-map']) assert.match(arc, new RegExp(skill));
  assert.match(arc, /Bava Batra 2a/); assert.match(arc, /const bavaBatraSteps=window\.SederCourse\.steps/);
  assert.match(page, /not legal, housing, or neighbor-dispute advice/i);
  assert.match(engine, /'bava-batra-tractate-arc':\{tractate:'bava-batra'/);
  const bavaBatra = JSON.parse(tractatesFile).tractates.find((tractate) => tractate.title === 'Bava Batra');
  assert.equal(bavaBatra.stage, 'tractate-arc'); assert.equal(bavaBatra.arcUrl, 'bava-batra-arc.html');
});
