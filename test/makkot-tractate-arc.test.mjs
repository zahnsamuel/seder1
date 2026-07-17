import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('Makkot offers a source-grounded testimony arc and visible workspace', async () => {
  const [arc, page, workbench, workbenchPage, tractatesFile, engine] = await Promise.all(['makkot-arc.js', 'makkot-arc.html', 'makkot-daf-workbench.js', 'makkot-daf-workbench.html', 'data/gemara-tractates.json', 'course-engine.js'].map((file) => readFile(file, 'utf8')));
  for (const skill of ['makkot-category-orientation', 'makkot-source-principle', 'makkot-schemed-not-did', 'makkot-hazama-distinction', 'makkot-independent-map', 'makkot-translation-anchor']) assert.match(arc, new RegExp(skill));
  assert.match(arc, /Makkot 5b/);
  assert.match(arc, /const makkotSteps=window\.SederCourse\.steps/);
  assert.match(page, /not guidance for legal, pastoral, or personal decisions/i);
  assert.match(workbench, /Witness distinction/);
  assert.match(workbenchPage, /Makkot 1:1 · 5b/);
  assert.match(engine, /'makkot-tractate-arc':\{tractate:'makkot'/);
  const makkot = JSON.parse(tractatesFile).tractates.find((tractate) => tractate.title === 'Makkot');
  assert.equal(makkot.stage, 'tractate-arc');
  assert.equal(makkot.arcUrl, 'makkot-arc.html');
});
