import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('Foundation Year visibly connects three earned terms and their next moves', async () => {
  const [year, script, journey, capstone, levelComplete, termThree] = await Promise.all([
    readFile(new URL('../foundation-year.html', import.meta.url), 'utf8'),
    readFile(new URL('../foundation-year.js', import.meta.url), 'utf8'),
    readFile(new URL('../journey.html', import.meta.url), 'utf8'),
    readFile(new URL('../term-two-capstone.js', import.meta.url), 'utf8'),
    readFile(new URL('../level-complete.js', import.meta.url), 'utf8'),
    readFile(new URL('../term-three-journey.html', import.meta.url), 'utf8')
  ]);
  // journey.html folds Foundation Year in (simplification) — it no longer offers it as a navigable
  // program; it stays reachable from the term-completion flow (capstone / level-complete, asserted below).
  assert.doesNotMatch(journey, /Open Foundation Year/);
  for (const stage of ['foundation-capstone', 'term-two-capstone', 'second-foundation-synthesis']) assert.match(script, new RegExp(stage));
  assert.match(capstone, /stageId: 'term-two-capstone'/);
  assert.match(capstone, /foundation-year\.html/);
  assert.match(levelComplete, /foundation-year\.html/);
  assert.match(termThree, /second-foundation-synthesis\.html/);
});
