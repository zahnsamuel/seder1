import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { itemProblem } from '../data/item-authoring-fold.mjs';
import { findTeachBeforeAskViolations } from '../data/teach-before-ask.mjs';
import { isVagueMoveAsk, lookupExcerpt } from '../academy-session-lesson.mjs';

const load = async (f) => JSON.parse(await readFile(new URL(`../${f}`, import.meta.url), 'utf8'));

// Six thinnest non-L0 starter banks after the #31 quality pass: leftover abstract
// "meta" items (including the fat-bucket trio #31 left untouched) plus a
// single-family connectors bank. Draft for educator audit.
const DEEPENED = [
  'fnd-signal-connectors',
  'fnd-role-ruling-vs-discussion',
  'fnd-case-what-happens',
  'fnd-arg-objection',
  'fnd-arg-response',
  'fnd-resp-learning-vs-ruling'
];

const HEBREW = /[\u0590-\u05FF]/;
const ABSTRACT_META = /why does|how do you locate|the question to ask is|what is the (danger|quickest)|to follow a response well|what move does it signal/i;
const DECODE_L0 = [
  'fnd-decode-letters',
  'fnd-decode-vowels',
  'fnd-decode-blend',
  'fnd-decode-word'
];

function familyOf(ref) {
  const r = String(ref || '').toLowerCase();
  if (/genesis|exodus|leviticus|numbers|deuteronomy|psalm|job/.test(r)) return 'tanakh';
  if (/mishnah|pirkei|avot/.test(r)) return 'mishnah';
  if (/berakhot|shabbat|eruvin|pesachim|sukkah|bava|gittin|kiddushin|gemara/.test(r)) return 'gemara';
  if (/rashi|tosafot|mikraot/.test(r)) return 'commentary';
  if (/rambam|shulchan|hilchot|yesodei|code of jewish law/.test(r)) return 'halakhic';
  if (/orchot|guide for the perplexed/.test(r)) return 'thought';
  if (/source of jewish law|undecided views/.test(r)) return 'responsibility';
  return `other:${ref}`;
}

test('the six thinnest starter banks are source-grounded, varied, and unbiased', async () => {
  const bank = (await load('data/foundation-authored-items.json')).items;
  const starter = new Set((await load('data/foundation-starter-set.json')).starterSet.map((s) => s.id));
  const frozen = new Set((await load('data/foundation-starter-set.json')).frozen.map((s) => s.id));
  const excerpts = await load('data/foundation-source-excerpts.json');

  for (const skill of DEEPENED) {
    assert.ok(starter.has(skill), `${skill} is in the frozen starter set`);
    assert.ok(!frozen.has(skill), `${skill} must not be a frozen skill`);
    const items = bank[skill];
    assert.ok(Array.isArray(items) && items.length >= 3, `${skill} needs >=3 items`);
    const families = new Set(items.map((item) => familyOf(item.sourceRef)));
    assert.ok(families.size >= 2, `${skill} needs source-family variety, got ${[...families].join(', ')}`);

    for (const [i, item] of items.entries()) {
      assert.equal(itemProblem(item), null, `${skill}[${i}] invalid: ${itemProblem(item)}`);
      assert.ok(item.sourceRef && item.sourceRef.trim(), `${skill}[${i}] missing sourceRef`);
      assert.ok(item.feedback && item.feedback.length >= 25, `${skill}[${i}] feedback must teach`);
      assert.match(item.stem, HEBREW, `${skill}[${i}] stem carries an on-page Hebrew excerpt`);
      assert.doesNotMatch(item.stem, ABSTRACT_META, `${skill}[${i}] is abstract/meta rather than application`);
      assert.equal(isVagueMoveAsk(item.stem), false, `${skill}[${i}] stem is a vague-move ask`);
      const lengths = item.choices.map((c) => c.length);
      assert.ok(
        lengths[item.correct] <= 1.5 * Math.min(...lengths),
        `${skill}[${i}] length-bias: correct ${lengths[item.correct]} vs shortest ${Math.min(...lengths)}`
      );
      if (i < 3) {
        const excerpt = lookupExcerpt(item.sourceRef, excerpts);
        assert.ok(
          excerpt && (excerpt.hebrew || excerpt.translation),
          `${skill}[${i}] ${item.sourceRef} needs an on-page excerpt`
        );
      }
    }
  }

  for (const id of DECODE_L0) {
    assert.equal(bank[id], undefined, `${id} is L0 decode — no authored review bank`);
  }
});

test('deepened banks plus the rest of the authored file earn every ask term', async () => {
  const teach = await load('data/foundation-teach.json');
  const bank = (await load('data/foundation-authored-items.json')).items;
  const graph = await load('data/foundation-skill-graph.json');
  const violations = findTeachBeforeAskViolations({
    itemsBySkill: bank,
    teachFile: teach,
    graph
  });
  assert.deepEqual(
    violations,
    [],
    violations.map((v) => `${v.skillId}[${v.index}]: ${v.terms.join(', ')}`).join('\n')
  );
});
