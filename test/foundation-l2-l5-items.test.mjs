import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { itemProblem } from '../data/item-authoring-fold.mjs';

const load = async (f) => JSON.parse(await readFile(new URL(`../${f}`, import.meta.url), 'utf8'));

// The L2-L5 bands of the frozen starter set (signals, roles, case, argument).
// Authored review banks, following the Layer-1 orientation banks. Guards the content,
// not just the fold mechanism. See docs/foundation-starter-set.md.
const L2_L5 = [
  // L2 signals
  'fnd-signal-known-words',
  'fnd-signal-question-words',
  'fnd-signal-name-formulas',
  'fnd-signal-connectors',
  'fnd-signal-quotation',
  // L3 roles
  'fnd-role-question-vs-answer',
  'fnd-role-example',
  'fnd-role-quotation-bounds',
  'fnd-role-ruling-vs-discussion',
  // L4 case
  'fnd-case-actors',
  'fnd-case-what-happens',
  'fnd-case-restate',
  'fnd-case-uncertainty',
  // L5 argument
  'fnd-arg-claim',
  'fnd-arg-evidence-role',
  'fnd-arg-objection',
  'fnd-arg-response',
  'fnd-arg-unresolved',
];

test('every L2-L5 starter skill has a complete, valid, unbiased authored item bank', async () => {
  const bank = (await load('data/foundation-authored-items.json')).items;
  const graphIds = new Set((await load('data/foundation-skill-graph.json')).skills.map((s) => s.id));
  const starter = new Set((await load('data/foundation-starter-set.json')).starterSet.map((s) => s.id));

  for (const skill of L2_L5) {
    assert.ok(graphIds.has(skill), `${skill} is not a graph skill`);
    assert.ok(starter.has(skill), `${skill} must be in the frozen starter set`);
    const items = bank[skill];
    assert.ok(Array.isArray(items) && items.length >= 4, `${skill} needs >=4 authored items`);

    for (const [i, item] of items.entries()) {
      assert.equal(itemProblem(item), null, `${skill}[${i}] invalid: ${itemProblem(item)}`);
      assert.ok(item.sourceRef && item.sourceRef.trim(), `${skill}[${i}] missing sourceRef`);
      assert.ok(item.feedback && item.feedback.length >= 25, `${skill}[${i}] feedback must teach (>=25 chars)`);
      // No length-bias exploit: the correct answer is not reliably the longest option.
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
