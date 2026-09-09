import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  BANNED_LEARNER_COPY,
  learnerCopyHasBannedPhrase,
  sentenceCount,
  teachCopy
} from '../academy-session-lesson.mjs';

const load = async (f) => JSON.parse(await readFile(new URL(`../${f}`, import.meta.url), 'utf8'));
const JARGON = /make the move|reading move|make this .*move|\bthe move\b/i;

test('every non-L0 starter skill has a 2–4 sentence See-it teach in foundation-teach.json', async () => {
  const teachFile = await load('data/foundation-teach.json');
  const starter = (await load('data/foundation-starter-set.json')).starterSet;
  const graph = await load('data/foundation-skill-graph.json');
  const bank = teachFile.teach || {};

  assert.equal(typeof bank, 'object');
  assert.ok(!Array.isArray(bank), 'teach is a skill-id map, not a list');

  const nonL0 = starter.filter((entry) => entry.layer !== 0);
  const l0 = starter.filter((entry) => entry.layer === 0);
  const starterIds = new Set(starter.map((entry) => entry.id));
  const frozenIds = new Set((await load('data/foundation-starter-set.json')).frozen.map((entry) => entry.id));

  const missing = nonL0.filter((entry) => typeof bank[entry.id] !== 'string' || !bank[entry.id].trim());
  assert.deepEqual(
    missing.map((entry) => entry.id),
    [],
    `See-it gaps for non-L0 starters: ${missing.map((entry) => entry.id).join(', ')}`
  );

  for (const entry of nonL0) {
    const text = bank[entry.id];
    const n = sentenceCount(text);
    assert.ok(text.length >= 80 && text.length <= 700, `${entry.id} teach is 2–4 sentences (${text.length} chars)`);
    assert.ok(n >= 2 && n <= 4, `${entry.id} has ${n} sentences, expected 2–4`);
    assert.doesNotMatch(text, JARGON, `${entry.id} teach avoids "the move" jargon`);
    assert.equal(learnerCopyHasBannedPhrase(text), false, `${entry.id} teach has no banned learner copy`);
    for (const banned of BANNED_LEARNER_COPY) {
      assert.doesNotMatch(text, banned, `${entry.id} teach matches ${banned}`);
    }

    const skill = graph.skills.find((item) => item.id === entry.id);
    const rendered = teachCopy({ skill, kind: 'introduce', teachBank: teachFile });
    assert.equal(rendered, text, `${entry.id} teachCopy should use the banked See-it, not a generic fallback`);
    assert.equal(teachCopy({ skill, kind: 'practice', teachBank: teachFile }), '', `${entry.id} practice has no See-it`);
  }

  for (const entry of l0) {
    assert.equal(bank[entry.id], undefined, `${entry.id} is L0 decode; glyph UI does not need a teach JSON entry`);
  }

  for (const id of Object.keys(bank)) {
    assert.ok(starterIds.has(id), `${id} is in the teach bank but not in the frozen starter set`);
    assert.ok(!frozenIds.has(id), `${id} is frozen and must not grow the teach bank past the starter set`);
  }

  assert.ok(teachFile.genres && typeof teachFile.genres === 'object', 'genre gallery is preserved');
});
