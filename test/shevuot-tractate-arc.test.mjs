import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('Shevuot offers a cross-tractate counted-pattern arc and visible workspace', async () => {
  const [arc, page, workbench, workbenchPage, tractatesFile, engine] = await Promise.all(['shevuot-arc.js', 'shevuot-arc.html', 'shevuot-daf-workbench.js', 'shevuot-daf-workbench.html', 'data/gemara-tractates.json', 'course-engine.js'].map((file) => readFile(file, 'utf8')));
  for (const skill of ['shevuot-counted-opening', 'shevuot-pattern-transfer', 'shevuot-basic-pair', 'shevuot-past-extension', 'shevuot-independent-map']) assert.match(arc, new RegExp(skill));
  assert.match(arc, /Mishnah Shabbat 1:1/);
  assert.match(arc, /const shevuotSteps=window\.SederCourse\.steps/);
  assert.match(page, /not practical guidance about vows or personal commitments/i);
  assert.match(workbench, /Shabbat parallel/);
  assert.match(workbenchPage, /Mishnah Shevuot 1:1 · 3:1/);
  assert.match(engine, /'shevuot-tractate-arc':\{tractate:'shevuot'/);
  const shevuot = JSON.parse(tractatesFile).tractates.find((tractate) => tractate.title === 'Shevuot');
  assert.equal(shevuot.stage, 'tractate-arc');
  assert.equal(shevuot.arcUrl, 'shevuot-arc.html');
});
