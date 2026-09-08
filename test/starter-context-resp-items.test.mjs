import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { itemProblem } from '../data/item-authoring-fold.mjs';

const load = async (f) => JSON.parse(await readFile(new URL(`../${f}`, import.meta.url), 'utf8'));
const JARGON = /make the move|reading move|make this .*move/i;

// The two remaining starter-set skills to get authored banks: context (L7) and the
// study-vs-ruling responsibility anchor (L8). Completes the starter set's checks (bar L0).
const SKILLS = ['fnd-context-genre-expectations', 'fnd-resp-learning-vs-ruling'];

test('the context and responsibility starter skills have complete, valid, unbiased banks', async () => {
  const bank = (await load('data/foundation-authored-items.json')).items;
  const graphIds = new Set((await load('data/foundation-skill-graph.json')).skills.map((s) => s.id));
  const starter = new Set((await load('data/foundation-starter-set.json')).starterSet.map((s) => s.id));

  for (const skill of SKILLS) {
    assert.ok(graphIds.has(skill), `${skill} is a graph skill`);
    assert.ok(starter.has(skill), `${skill} is in the frozen starter set`);
    const items = bank[skill];
    assert.ok(Array.isArray(items) && items.length >= 3, `${skill} needs >=3 authored items`);
    for (const [i, item] of items.entries()) {
      assert.equal(itemProblem(item), null, `${skill}[${i}] invalid: ${itemProblem(item)}`);
      assert.ok(item.sourceRef && item.sourceRef.trim(), `${skill}[${i}] missing sourceRef`);
      assert.ok(item.feedback && item.feedback.length >= 25, `${skill}[${i}] feedback must teach`);
      assert.doesNotMatch(`${item.stem} ${item.feedback}`, JARGON, `${skill}[${i}] avoids "make the move" jargon`);
      const lengths = item.choices.map((c) => c.length);
      assert.ok(lengths[item.correct] <= 1.5 * Math.min(...lengths), `${skill}[${i}] length-bias`);
    }
  }

  // The responsibility skill keeps the study-aid-not-pesak boundary: its items point toward
  // asking an authority / naming the limit, never toward "you may now rule for yourself".
  const respText = bank['fnd-resp-learning-vs-ruling'].map((it) => it.feedback).join(' ').toLowerCase();
  assert.ok(/authority|not.*(told|ruling)|learned/.test(respText), 'responsibility feedback names the learning/ruling boundary');
});
