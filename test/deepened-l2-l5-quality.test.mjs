import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { itemProblem } from '../data/item-authoring-fold.mjs';

const load = async (f) => JSON.parse(await readFile(new URL(`../${f}`, import.meta.url), 'utf8'));

// The 11 L2-L5 starter banks deepened away from weak abstract items toward source-grounded
// application items. (The fat-bucket trio — arg-response, role-ruling-vs-discussion,
// case-what-happens — is owned by JLA Bot's split work and deliberately untouched here.)
const DEEPENED = [
  'fnd-signal-question-words',
  'fnd-signal-name-formulas',
  'fnd-signal-connectors',
  'fnd-signal-quotation',
  'fnd-role-example',
  'fnd-case-actors',
  'fnd-case-restate',
  'fnd-case-uncertainty',
  'fnd-arg-claim',
  'fnd-arg-evidence-role',
  'fnd-arg-unresolved',
];

// Standing product law: no untaught Jewish/technical term in a learner-facing ask.
// (Torah / Mishnah / Gemara / commentary are taught by the prior source-type skill, so allowed.)
const UNTAUGHT = /\b(sugya|rambam|mussar|tanakh|halakhah|halacha|halakhic|aggad|shulchan\s*aruch|amora|tanna)\b/i;

test('deepened L2-L5 banks are source-grounded, valid, unbiased, and free of untaught terms', async () => {
  const bank = (await load('data/foundation-authored-items.json')).items;
  const starter = new Set((await load('data/foundation-starter-set.json')).starterSet.map((s) => s.id));

  for (const skill of DEEPENED) {
    assert.ok(starter.has(skill), `${skill} is in the frozen starter set`);
    const items = bank[skill];
    assert.ok(Array.isArray(items) && items.length >= 3, `${skill} needs >=3 items`);
    for (const [i, item] of items.entries()) {
      assert.equal(itemProblem(item), null, `${skill}[${i}] invalid: ${itemProblem(item)}`);
      assert.ok(item.sourceRef && item.sourceRef.trim(), `${skill}[${i}] missing sourceRef`);
      assert.ok(item.feedback && item.feedback.length >= 25, `${skill}[${i}] feedback must teach`);
      const lengths = item.choices.map((c) => c.length);
      assert.ok(lengths[item.correct] <= 1.5 * Math.min(...lengths), `${skill}[${i}] length-bias`);
      const ask = `${item.stem} ${item.choices.join(' ')}`;
      assert.doesNotMatch(ask, UNTAUGHT, `${skill}[${i}] ask uses an untaught term (${(ask.match(UNTAUGHT) || [])[0]})`);
    }
  }
});
