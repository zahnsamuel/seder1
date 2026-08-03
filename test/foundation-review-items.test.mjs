import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { foundationReviewItem, sourceReviewItems } from '../data/curriculum-engine.mjs';

const graph = JSON.parse(readFileSync(new URL('../data/foundation-skill-graph.json', import.meta.url), 'utf8'));
const statements = new Set(graph.skills.map((s) => s.statement));

test('foundationReviewItem builds a real, skill-specific discrimination retrieval', () => {
  const skill = graph.skills.find((s) => s.id === 'fnd-arg-claim');
  const item = foundationReviewItem(skill, graph.skills, 1); // fixed seed for determinism
  assert.equal(item.trueSkillId, 'fnd-arg-claim');
  assert.equal(item.answers.length, 3, 'three choices');
  // The correct answer is the skill's own statement.
  assert.equal(item.answers[item.correct], skill.statement);
  // The distractors are OTHER real skills' statements — a genuine discrimination, not boilerplate.
  const distractors = item.answers.filter((_, i) => i !== item.correct);
  for (const d of distractors) {
    assert.notEqual(d, skill.statement);
    assert.ok(statements.has(d), 'each distractor is a real skill statement');
  }
  // Grounded in one of the skill's own source contexts.
  assert.ok(item.prompt.includes(skill.sourceContexts[0].ref) || skill.sourceContexts.some((c) => item.prompt.includes(c.ref)));
});

test('the same seed is deterministic; different seeds vary the retrieval', () => {
  const skill = graph.skills.find((s) => s.id === 'fnd-orient-source-type');
  assert.deepEqual(foundationReviewItem(skill, graph.skills, 4), foundationReviewItem(skill, graph.skills, 4));
  const a = foundationReviewItem(skill, graph.skills, 1);
  const b = foundationReviewItem(skill, graph.skills, 2);
  assert.notDeepEqual(a.answers, b.answers, 'a different seed rotates/repicks the choices');
});

test('sourceReviewItems now gives a due fnd-* skill a real retrieval, not the generic daf card', async () => {
  const items = await sourceReviewItems('.', ['fnd-arg-claim']);
  const item = items.find((entry) => entry.trueSkillId === 'fnd-arg-claim');
  assert.ok(item, 'an item is produced for the foundation skill');
  assert.match(item.variantId, /^fnd-/, 'it is the foundation retrieval, not a fallback');
  const skill = graph.skills.find((s) => s.id === 'fnd-arg-claim');
  assert.equal(item.answers[item.correct], skill.statement, 'answer is this skill, not the shared boilerplate');
  assert.notEqual(item.prompt, 'Before deciding whether a line is correct, what should you identify in a sugya?');
});
