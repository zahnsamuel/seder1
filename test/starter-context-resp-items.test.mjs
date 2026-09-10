import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { itemProblem } from '../data/item-authoring-fold.mjs';

const load = async (f) => JSON.parse(await readFile(new URL(`../${f}`, import.meta.url), 'utf8'));
const JARGON = /make the move|reading move|make this .*move/i;
// Product law: a learner-facing ask must not use an untaught Jewish/technical term.
// These may appear in the See-it teach and in post-answer feedback, never in a stem or choice.
const UNTAUGHT_TERMS = /\b(gemara|mishnah|halakhah|halacha|halakhic|aggad|sugya|shulchan\s*aruch|rashi)\b/i;

const SKILLS = ['fnd-context-genre-expectations', 'fnd-resp-learning-vs-ruling'];

test('the context and responsibility starter skills have complete, valid, unbiased banks', async () => {
  const bank = (await load('data/foundation-authored-items.json')).items;
  const graphIds = new Set((await load('data/foundation-skill-graph.json')).skills.map((s) => s.id));
  const starter = new Set((await load('data/foundation-starter-set.json')).starterSet.map((s) => s.id));

  for (const skill of SKILLS) {
    assert.ok(graphIds.has(skill), `${skill} is a graph skill`);
    assert.ok(starter.has(skill), `${skill} is in the frozen starter set`);
    const items = bank[skill];
    assert.ok(Array.isArray(items) && items.length >= 5, `${skill} needs >=5 authored items`);
    for (const [i, item] of items.entries()) {
      assert.equal(itemProblem(item), null, `${skill}[${i}] invalid: ${itemProblem(item)}`);
      assert.ok(item.sourceRef && item.sourceRef.trim(), `${skill}[${i}] missing sourceRef`);
      assert.ok(item.feedback && item.feedback.length >= 25, `${skill}[${i}] feedback must teach`);
      assert.doesNotMatch(`${item.stem} ${item.feedback}`, JARGON, `${skill}[${i}] avoids "make the move" jargon`);
      const lengths = item.choices.map((c) => c.length);
      assert.ok(lengths[item.correct] <= 1.5 * Math.min(...lengths), `${skill}[${i}] length-bias`);
    }
  }

  const respText = bank['fnd-resp-learning-vs-ruling'].map((it) => it.feedback).join(' ').toLowerCase();
  assert.ok(/authority|not.*(told|ruling)|learned/.test(respText), 'responsibility feedback names the learning/ruling boundary');
});

test('genre-expectations is taught before it is asked, and the ask assumes no unexplained terms', async () => {
  const teachFile = await load('data/foundation-teach.json');
  const bank = (await load('data/foundation-authored-items.json')).items;

  // 1. See-it teach exists for this skill and actually defines the terms the checks lean on.
  const teach = teachFile.teach && teachFile.teach['fnd-context-genre-expectations'];
  assert.ok(typeof teach === 'string' && teach.length >= 80, 'a See-it teach entry exists for the skill');
  assert.match(teach, /halakhah/i, 'teach defines halakhah');
  assert.match(teach, /aggad/i, 'teach defines aggadah');

  // 2. For BOTH #28 skills, no item's ASK (stem or choices) uses an unexplained term — only the
  //    feedback (shown after answering, once the teach has introduced them) may.
  for (const skill of SKILLS) {
    for (const [i, item] of bank[skill].entries()) {
      const ask = `${item.stem} ${item.choices.join(' ')}`;
      assert.doesNotMatch(ask, UNTAUGHT_TERMS, `${skill}[${i}] ask uses an unexplained term (${(ask.match(UNTAUGHT_TERMS) || [])[0]})`);
    }
  }
});
