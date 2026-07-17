import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
test('Beitzah offers a category-and-reason source arc', async () => {
  const [arc, page, tractatesFile, engine] = await Promise.all(['beitzah-arc.js', 'beitzah-arc.html', 'data/gemara-tractates.json', 'course-engine.js'].map((file) => readFile(file, 'utf8')));
  for (const skill of ['beitzah-case-timing', 'beitzah-two-positions', 'beitzah-nolad-category', 'beitzah-category-case-fit', 'beitzah-reason-scope', 'beitzah-reason-consequence', 'beitzah-independent-map']) assert.match(arc, new RegExp(skill));
  assert.match(arc, /Mishnah Beitzah 1:1/); assert.match(page, /not practical guidance about holiday observance/i);
  assert.match(engine, /'beitzah-tractate-arc':\{tractate:'beitzah'/);
  const beitzah = JSON.parse(tractatesFile).tractates.find((tractate) => tractate.title === 'Beitzah');
  assert.equal(beitzah.stage, 'tractate-arc'); assert.equal(beitzah.arcUrl, 'beitzah-arc.html');
});
