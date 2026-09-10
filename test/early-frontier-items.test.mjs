import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { itemProblem } from '../data/item-authoring-fold.mjs';
import { lookupExcerpt, sentenceCount, teachCopy } from '../academy-session-lesson.mjs';
import { findTeachBeforeAskViolations } from '../data/teach-before-ask.mjs';

const load = async (f) => JSON.parse(await readFile(new URL(`../${f}`, import.meta.url), 'utf8'));

// After Layer 0 decode, Today walks these first: all L1 orientation, the L2 signal
// band, then the first role. Deepen these — not the later case/argument banks.
const EARLY = [
  'fnd-orient-source-type',
  'fnd-orient-page-geography',
  'fnd-orient-speaker',
  'fnd-orient-unit-boundary',
  'fnd-orient-question-present',
  'fnd-signal-known-words',
  'fnd-signal-question-words',
  'fnd-signal-name-formulas',
  'fnd-signal-connectors',
  'fnd-signal-quotation',
  'fnd-role-question-vs-answer'
];

const HEBREW = /[֐-׿]/;
const JARGON = /make the move|reading move|make this .*move|\bthe move\b/i;
const META = /why does recognizing|what does sight-reading|a reader who must stop|how do you locate|why does noticing/i;
const L0 = /^fnd-decode-/;

test('early non-L0 frontier skills have ≥4 source-grounded, unbiased, on-page items', async () => {
  const bank = (await load('data/foundation-authored-items.json')).items;
  const excerpts = await load('data/foundation-source-excerpts.json');
  const teachFile = await load('data/foundation-teach.json');
  const graph = await load('data/foundation-skill-graph.json');
  const starter = await load('data/foundation-starter-set.json');
  const starterIds = new Set(starter.starterSet.map((s) => s.id));
  const frozenIds = new Set(starter.frozen.map((s) => s.id));
  const l0 = starter.starterSet.filter((s) => s.layer === 0).map((s) => s.id);

  assert.deepEqual(l0.filter((id) => Array.isArray(bank[id])), [], 'L0 decode banks stay empty');
  for (const skill of EARLY) {
    assert.ok(starterIds.has(skill), `${skill} must stay in the frozen starter set`);
    assert.ok(!frozenIds.has(skill), `${skill} is frozen and must not grow`);
    assert.ok(!L0.test(skill), `${skill} is L0; this lane holds those banks`);
    const items = bank[skill];
    assert.ok(Array.isArray(items) && items.length >= 4, `${skill} needs >=4 authored items (has ${items?.length || 0})`);

    const teach = teachFile.teach[skill];
    assert.ok(typeof teach === 'string' && teach.trim(), `${skill} needs a See-it teach`);
    const n = sentenceCount(teach);
    assert.ok(n >= 2 && n <= 4, `${skill} teach has ${n} sentences, expected 2–4`);
    const skillNode = graph.skills.find((s) => s.id === skill);
    assert.equal(teachCopy({ skill: skillNode, kind: 'introduce', teachBank: teachFile }), teach);

    for (const [i, item] of items.entries()) {
      const label = `${skill}[${i}]`;
      assert.equal(itemProblem(item), null, `${label} invalid: ${itemProblem(item)}`);
      assert.ok(item.sourceRef && item.sourceRef.trim(), `${label} missing sourceRef`);
      assert.ok(item.feedback && item.feedback.length >= 25, `${label} feedback must teach`);
      assert.match(item.stem, HEBREW, `${label} stem carries a Hebrew on-page excerpt`);
      assert.doesNotMatch(item.stem, /sefaria/i, `${label} shows the text, not a Sefaria link`);
      assert.doesNotMatch(`${item.stem} ${item.choices.join(' ')} ${item.feedback}`, JARGON, `${label} avoids move-jargon`);
      assert.doesNotMatch(item.stem, META, `${label} is application, not a meta-ask about the skill`);
      const lengths = item.choices.map((c) => c.length);
      assert.ok(
        lengths[item.correct] <= 1.5 * Math.min(...lengths),
        `${label} length-bias: correct ${lengths[item.correct]} vs shortest ${Math.min(...lengths)}`
      );
      const excerpt = lookupExcerpt(item.sourceRef, excerpts);
      assert.ok(
        excerpt && (excerpt.hebrew || excerpt.translation),
        `${label} ${item.sourceRef} has no on-page excerpt`
      );
    }
  }

  const violations = findTeachBeforeAskViolations({
    itemsBySkill: bank,
    teachFile,
    graph,
    skillIds: EARLY
  });
  assert.deepEqual(
    violations,
    [],
    violations.map((v) => `${v.skillId}[${v.index}]: ${v.terms.join(', ')}`).join('\n')
  );
});

test('fnd-orient-question-present treats Mishnah Berakhot 1:1 as asking, not telling', async () => {
  const items = (await load('data/foundation-authored-items.json')).items['fnd-orient-question-present'];
  const berakhot = items.find((item) => /Mishnah Berakhot 1:1/i.test(item.sourceRef));
  assert.ok(berakhot, 'the bank still uses Mishnah Berakhot 1:1');
  assert.match(berakhot.stem, /מֵאֵימָתַי/);
  assert.match(berakhot.choices[berakhot.correct], /Asking/i);
  assert.doesNotMatch(berakhot.choices[berakhot.correct], /Telling/i);
});
