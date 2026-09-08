import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { knowledgeFrontier, keyPrerequisiteRemediation } from '../data/knowledge-graph.mjs';
import {
  STARTER_SKILL_IDS,
  foundationFrontierRecommendation,
  foundationSessionHref,
  pickFrontierFoundationSkill,
  pickRetrievalFoundationSkill,
  teachableFoundationIds
} from '../data/next-action.mjs';
import { buildJlaPlacementResult } from '../jla-placement-router.js';

const graph = JSON.parse(readFileSync(new URL('../data/foundation-skill-graph.json', import.meta.url), 'utf8'));
const starterDoc = JSON.parse(readFileSync(new URL('../data/foundation-starter-set.json', import.meta.url), 'utf8'));
const knowledgePoints = JSON.parse(readFileSync(new URL('../data/foundation-knowledge-points.json', import.meta.url), 'utf8')).knowledgePoints;
const map = JSON.parse(readFileSync(new URL('../data/foundation-content-map.json', import.meta.url), 'utf8'));
const starterIds = new Set(starterDoc.starterSet.map((skill) => skill.id));
const frozenIds = new Set(starterDoc.frozen.map((skill) => skill.id));
const decode = ['fnd-decode-letters', 'fnd-decode-vowels', 'fnd-decode-blend', 'fnd-decode-word'];
const starterThrough = (maxLayer) => starterDoc.starterSet.filter((skill) => skill.layer <= maxLayer).map((skill) => skill.id);
const secure = (ids) => Object.fromEntries(ids.map((id) => [id, 0.8]));
const learnerWith = (ids) => ({ placement: { completedAt: '2026-09-08' }, foundationScores: secure(ids) });

test('the daily picker defaults to the frozen starter set, including Layer 0 decode', () => {
  assert.equal(teachableFoundationIds().size, 29);
  assert.deepEqual([...STARTER_SKILL_IDS].sort(), [...starterIds].sort());
  for (const id of decode) assert.ok(STARTER_SKILL_IDS.has(id), `${id} must stay teachable`);
  const beginner = pickFrontierFoundationSkill(graph, learnerWith([]));
  assert.equal(beginner.id, 'fnd-decode-letters');
  assert.ok(starterIds.has(beginner.id));
  assert.equal(foundationSessionHref(beginner.id), 'hebrew-decoding.html');
});

test('knowledgeFrontier still sees frozen skills; the teachable slice does not', () => {
  const mastered = starterThrough(2);
  const full = knowledgeFrontier(graph, mastered);
  const slice = knowledgeFrontier(graph, mastered, { among: STARTER_SKILL_IDS });
  assert.ok(full.frontier.includes('fnd-signal-sentence-structure'), 'unrestricted frontier still lists the frozen L2 sibling');
  assert.ok(!slice.frontier.includes('fnd-signal-sentence-structure'));
  assert.ok(slice.frontier.every((id) => starterIds.has(id)));
  assert.ok(slice.frontier.includes('fnd-role-question-vs-answer'));
  assert.equal(slice.frontier.length + slice.blocked.length + slice.mastered.length, starterIds.size);
});

test('after starter Layers 0–2, Today teaches a remaining starter skill — not the frozen L2 sibling', () => {
  const mastered = starterThrough(2);
  const unrestricted = pickFrontierFoundationSkill(graph, learnerWith(mastered), { teachableIds: null });
  assert.equal(unrestricted.id, 'fnd-signal-sentence-structure');
  assert.ok(frozenIds.has(unrestricted.id));

  const rec = foundationFrontierRecommendation(learnerWith(mastered), graph, map);
  assert.ok(rec);
  assert.equal(rec.kind, 'academy-foundation');
  assert.ok(starterIds.has(rec.skillId), `${rec.skillId} must be in the starter set`);
  assert.ok(!frozenIds.has(rec.skillId), `${rec.skillId} is frozen and must not be taught yet`);
  assert.equal(rec.skillId, 'fnd-role-question-vs-answer');
  assert.equal(rec.url, 'academy-session.html?skill=fnd-role-question-vs-answer');
});

test('a placed learner’s next teach skill stays in the starter set while starters remain unsecured', () => {
  for (const maxLayer of [0, 1, 2, 3, 4, 5, 7]) {
    const known = starterThrough(maxLayer);
    const remaining = [...starterIds].filter((id) => !known.includes(id));
    assert.ok(remaining.length, `expected unsecured starters after L${maxLayer}`);
    const rec = foundationFrontierRecommendation(learnerWith(known), graph, map);
    const placement = buildJlaPlacementResult({ graph, known });
    assert.ok(rec, `expected a teach recommendation after starter L${maxLayer}`);
    assert.ok(starterIds.has(rec.skillId), `teach ${rec.skillId} after L${maxLayer} is not in the starter set`);
    assert.ok(!frozenIds.has(rec.skillId), `teach ${rec.skillId} after L${maxLayer} is frozen`);
    assert.equal(placement.skillId, rec.skillId, 'placement CTA and Today must name the same starter skill');
    assert.equal(placement.firstSession, rec.url);
  }
});

test('securing every starter skill stops foundation teach — frozen leftovers are not the next lesson', () => {
  const allStarters = [...starterIds];
  assert.equal(pickFrontierFoundationSkill(graph, learnerWith(allStarters)), null);
  assert.equal(foundationFrontierRecommendation(learnerWith(allStarters), graph, map), null);
  assert.ok(pickFrontierFoundationSkill(graph, learnerWith(allStarters), { teachableIds: null }));
});

test('review and repair skip frozen ids when a starter skill is still the right target', () => {
  const dueFrozenThenStarter = pickRetrievalFoundationSkill(graph, map, {
    dueIds: ['fnd-signal-sentence-structure', 'fnd-arg-claim']
  });
  assert.equal(dueFrozenThenStarter.skillId, 'fnd-arg-claim');

  const frozenOnly = pickRetrievalFoundationSkill(graph, map, {
    dueIds: ['fnd-signal-sentence-structure', 'fnd-role-text-vs-commentary']
  });
  assert.equal(frozenOnly, null);

  const fadedStarter = pickRetrievalFoundationSkill(graph, map, {
    dueIds: ['fnd-signal-sentence-structure'],
    fadedIds: ['fnd-orient-speaker']
  });
  assert.equal(fadedStarter.skillId, 'fnd-orient-speaker');
  assert.equal(fadedStarter.trigger, 'decay');

  const welcome = pickRetrievalFoundationSkill(graph, map, {
    dueIds: ['fnd-compare-shared-question'],
    learner: {
      foundationScores: secure([...decode, 'fnd-orient-source-type']),
      masteryUpdatedAt: { 'fnd-orient-source-type': '2026-08-20T12:00:00.000Z' }
    },
    allowSecuredFallback: true
  });
  assert.equal(welcome.skillId, 'fnd-orient-source-type');
  assert.equal(welcome.trigger, 'welcome-back');

  const frozenKp = knowledgePoints.find((kp) => frozenIds.has(kp.skill) && frozenIds.has(kp.keyPrerequisite));
  assert.ok(frozenKp, 'need a frozen skill whose key prerequisite is also frozen');
  assert.equal(
    keyPrerequisiteRemediation({
      knowledgePoints,
      struggles: { [frozenKp.skill]: 3 },
      among: STARTER_SKILL_IDS
    }),
    null
  );
  const starterKp = knowledgePoints.find((kp) => kp.skill === 'fnd-role-question-vs-answer' && kp.kind === 'practice');
  const repair = keyPrerequisiteRemediation({
    knowledgePoints,
    struggles: { [starterKp.skill]: 3 },
    among: STARTER_SKILL_IDS
  });
  assert.equal(repair.keyPrerequisite, starterKp.keyPrerequisite);
  assert.ok(starterIds.has(repair.keyPrerequisite));
});
