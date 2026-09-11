import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { itemProblem } from '../data/item-authoring-fold.mjs';
import { sentenceCount } from '../academy-session-lesson.mjs';
import { findTeachBeforeAskViolations } from '../data/teach-before-ask.mjs';

const load = async (f) => JSON.parse(await readFile(new URL(`../${f}`, import.meta.url), 'utf8'));

// After the L1/L2 5→6 thicken (PR #66), the remaining 5-item starter banks
// are L3 roles, L4 cases, and L5 argument. Each needs ≥6 valid,
// teach-before-ask-clean items and a fair See-it. Leave L0 decode empty,
// and leave L7/L8 (still at 5) for a later slice.
const THICKENED = [
  'fnd-role-example',
  'fnd-role-question-vs-answer',
  'fnd-role-quotation-bounds',
  'fnd-role-ruling-vs-discussion',
  'fnd-case-actors',
  'fnd-case-restate',
  'fnd-case-uncertainty',
  'fnd-case-what-happens',
  'fnd-arg-claim',
  'fnd-arg-evidence-role',
  'fnd-arg-objection',
  'fnd-arg-response',
  'fnd-arg-unresolved'
];

const HEBREW = /[֐-׿]/;
const JARGON = /make the move|reading move|make this .*move|\bthe move\b/i;
const META = /why does recognizing|what does sight-reading|a reader who must stop|how do you locate|why does noticing/i;
const L0 = /^fnd-decode-/;

test('the thirteen L3–L5 starter banks have ≥6 valid items and fair See-it teach', async () => {
  const bank = (await load('data/foundation-authored-items.json')).items;
  const teachFile = await load('data/foundation-teach.json');
  const graph = await load('data/foundation-skill-graph.json');
  const starter = await load('data/foundation-starter-set.json');
  const starterIds = new Set(starter.starterSet.map((s) => s.id));
  const frozenIds = new Set(starter.frozen.map((s) => s.id));

  assert.deepEqual(
    starter.starterSet.filter((s) => s.layer === 0).map((s) => s.id).filter((id) => Array.isArray(bank[id])),
    [],
    'L0 decode banks stay empty'
  );

  for (const skill of THICKENED) {
    assert.ok(starterIds.has(skill), `${skill} must stay in the frozen starter set`);
    assert.ok(!frozenIds.has(skill), `${skill} is frozen and must not grow`);
    assert.ok(!L0.test(skill), `${skill} is L0; this lane holds those banks`);
    const items = bank[skill];
    assert.ok(Array.isArray(items) && items.length >= 6, `${skill} needs >=6 authored items (has ${items?.length || 0})`);

    const teach = teachFile.teach[skill];
    assert.ok(typeof teach === 'string' && teach.trim(), `${skill} needs a See-it teach`);
    const n = sentenceCount(teach);
    assert.ok(n >= 2 && n <= 4, `${skill} teach has ${n} sentences, expected 2–4`);
    assert.ok(teach.length >= 80 && teach.length <= 700, `${skill} teach length ${teach.length}`);
    assert.doesNotMatch(teach, JARGON, `${skill} teach avoids move-jargon`);

    const stems = items.map((item) => item.stem.replace(/\s+/g, ' '));
    assert.equal(new Set(stems).size, stems.length, `${skill} stems should not be clones`);

    for (const [i, item] of items.entries()) {
      const label = `${skill}[${i}]`;
      assert.equal(itemProblem(item), null, `${label} invalid: ${itemProblem(item)}`);
      assert.ok(item.sourceRef && item.sourceRef.trim(), `${label} missing sourceRef`);
      assert.ok(Array.isArray(item.choices) && item.choices.length >= 3, `${label} needs ≥3 choices`);
      assert.ok(item.feedback && item.feedback.length >= 25, `${label} feedback must teach`);
      assert.doesNotMatch(`${item.stem} ${item.choices.join(' ')} ${item.feedback}`, JARGON, `${label} avoids move-jargon`);
      assert.doesNotMatch(item.stem, META, `${label} is application, not a meta-ask about the skill`);
      const lengths = item.choices.map((c) => c.length);
      assert.ok(
        lengths[item.correct] <= 1.5 * Math.min(...lengths),
        `${label} length-bias: correct ${lengths[item.correct]} vs shortest ${Math.min(...lengths)}`
      );
    }

    const newest = items[items.length - 1];
    assert.match(newest.stem, HEBREW, `${skill} newest item carries a Hebrew on-page excerpt`);
    assert.doesNotMatch(newest.stem, /sefaria/i, `${skill} newest item shows the text, not a Sefaria link`);
  }

  const violations = findTeachBeforeAskViolations({
    itemsBySkill: bank,
    teachFile,
    graph,
    skillIds: THICKENED
  });
  assert.deepEqual(
    violations,
    [],
    violations.map((v) => `${v.skillId}[${v.index}]: ${v.terms.join(', ')}`).join('\n')
  );
});

test('L3–L5 See-it still names the shapes the sixth asks rely on', async () => {
  const teach = (await load('data/foundation-teach.json')).teach;
  assert.match(teach['fnd-role-example'], /poor person/i);
  assert.match(teach['fnd-role-example'], /householder/i);
  assert.match(teach['fnd-role-ruling-vs-discussion'], /two or more views|cutoff times/i);
  assert.match(teach['fnd-case-actors'], /Jonah/i);
  assert.match(teach['fnd-case-uncertainty'], /child/i);
  assert.match(teach['fnd-arg-objection'], /rescue plan|made things worse/i);
  assert.match(teach['fnd-arg-response'], /spared|innocent/i);
  assert.match(teach['fnd-arg-unresolved'], /further question|verdict/i);
});
