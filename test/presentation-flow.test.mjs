import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('landing page makes the full learner loop visible for a first-time presentation', async () => {
  const [page, styles] = await Promise.all(['seder.html', 'presentation-flow.css'].map((file) => readFile(file, 'utf8')));
  for (const phrase of ['THE LEARNING LOOP', 'See Jewish Learning Academy in four moves.', 'START', 'READ', 'PROVE', 'CONTINUE']) assert.match(page, new RegExp(phrase));
  for (const route of ['placement.html', 'berakhot-deep.html?entry=placement', 'gemara-mastery.html', 'journey.html']) assert.match(page, new RegExp(route.replace(/[.?]/g, '\\$&')));
  assert.match(styles, /presentation-grid/);
  assert.match(styles, /grid-template-columns:repeat\(4,1fr\)/);
});
