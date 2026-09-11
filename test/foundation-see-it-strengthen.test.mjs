import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { sentenceCount } from '../academy-session-lesson.mjs';
import { findTeachBeforeAskViolations } from '../data/teach-before-ask.mjs';

const load = async (f) => JSON.parse(await readFile(new URL(`../${f}`, import.meta.url), 'utf8'));

const JARGON = /make the move|reading move|make this .*move|\bthe move\b/i;

// Non-L0 starter See-its rewritten so the first authored ask is fair: concrete
// "what to notice" sentences, matching the bank's first-ask shapes, with any
// technical term the stem/feedback uses introduced in teach.
const STRENGTHENED = {
  'fnd-role-question-vs-answer': /question|answer|restatement|from when/i,
  'fnd-role-ruling-vs-discussion': /ruling|discussion|one option|several/i,
  'fnd-case-actors': /cast|claimants|who-did-what|who did what/i,
  'fnd-case-what-happens': /who, did what|ordinary words|holding a garment/i,
  'fnd-case-uncertainty': /open question|cutoff|missing piece/i,
  'fnd-arg-claim': /this source claims that|as it is written/i,
  'fnd-arg-evidence-role': /as it is written|as it is said|supports|challenges/i,
  'fnd-arg-objection': /pushback|threaten/i,
  'fnd-arg-response': /deny|limit|adjust/i,
  'fnd-arg-unresolved': /let it stand|meant to last|openness|תֵּיקוּ/i,
  'fnd-context-genre-expectations': /halakhah|aggad|shepherd/i,
  'fnd-resp-learning-vs-ruling': /learned|ruling|teacher|situation/i
};

test('rewritten L3–L8 See-it entries are 2–4 concrete notice sentences', async () => {
  const teachFile = await load('data/foundation-teach.json');
  const starter = await load('data/foundation-starter-set.json');
  const starterIds = new Set(starter.starterSet.map((s) => s.id));
  const frozenIds = new Set(starter.frozen.map((s) => s.id));
  const bank = teachFile.teach || {};

  for (const [skill, cue] of Object.entries(STRENGTHENED)) {
    assert.ok(starterIds.has(skill), `${skill} must stay in the frozen starter set`);
    assert.ok(!frozenIds.has(skill), `${skill} is frozen and must not grow`);
    const text = bank[skill];
    assert.ok(typeof text === 'string' && text.trim(), `${skill} needs a See-it teach`);
    const n = sentenceCount(text);
    assert.ok(n >= 2 && n <= 4, `${skill} has ${n} sentences, expected 2–4`);
    assert.ok(
      text.length >= 200 && text.length <= 700,
      `${skill} teach should be long enough to make the first ask fair (${text.length} chars)`
    );
    assert.doesNotMatch(text, JARGON, `${skill} teach avoids move-jargon`);
    assert.match(text, cue, `${skill} See-it should name the shape the first ask relies on`);
  }
});

test('rewritten See-it entries earn every term their authored banks ask', async () => {
  const teachFile = await load('data/foundation-teach.json');
  const items = (await load('data/foundation-authored-items.json')).items;
  const graph = await load('data/foundation-skill-graph.json');
  const skillIds = Object.keys(STRENGTHENED);
  const violations = findTeachBeforeAskViolations({
    itemsBySkill: items,
    teachFile,
    graph,
    skillIds
  });
  assert.deepEqual(
    violations,
    [],
    violations.map((v) => `${v.skillId}[${v.index}]: ${v.terms.join(', ')}`).join('\n')
  );
});
