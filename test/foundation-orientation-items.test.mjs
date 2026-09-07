import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { itemProblem } from '../data/item-authoring-fold.mjs';

const load = async (f) => JSON.parse(await readFile(new URL(`../${f}`, import.meta.url), 'utf8'));

// The Layer-1 orientation band of the frozen starter set. First authored review banks
// (docs/foundation-starter-set.md). Guards the content, not just the fold mechanism.
const ORIENTATION = [
  'fnd-orient-source-type',
  'fnd-orient-page-geography',
  'fnd-orient-speaker',
  'fnd-orient-unit-boundary',
  'fnd-orient-question-present',
];

test('every orientation starter skill has a complete, valid, unbiased authored item bank', async () => {
  const bank = (await load('data/foundation-authored-items.json')).items;
  const graphIds = new Set((await load('data/foundation-skill-graph.json')).skills.map((s) => s.id));
  const starter = new Set((await load('data/foundation-starter-set.json')).starterSet.map((s) => s.id));

  for (const skill of ORIENTATION) {
    assert.ok(graphIds.has(skill), `${skill} is not a graph skill`);
    assert.ok(starter.has(skill), `${skill} must be in the frozen starter set`);
    const items = bank[skill];
    assert.ok(Array.isArray(items) && items.length >= 3, `${skill} needs >=3 authored items`);

    for (const [i, item] of items.entries()) {
      assert.equal(itemProblem(item), null, `${skill}[${i}] invalid: ${itemProblem(item)}`);
      assert.ok(item.sourceRef && item.sourceRef.trim(), `${skill}[${i}] missing sourceRef`);
      assert.ok(item.feedback && item.feedback.length >= 25, `${skill}[${i}] feedback must teach (>=25 chars)`);
      const lengths = item.choices.map((c) => c.length);
      const correctLen = lengths[item.correct];
      const shortest = Math.min(...lengths);
      assert.ok(
        correctLen <= 1.5 * shortest,
        `${skill}[${i}] length-bias: correct ${correctLen} vs shortest ${shortest}`,
      );
    }
  }
});
