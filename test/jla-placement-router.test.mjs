import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { foundationSessionHref, foundationFrontierRecommendation } from '../data/next-action.mjs';
import {
  buildJlaPlacementResult,
  foundationIdFor,
  resolvePlacementStart
} from '../jla-placement-router.js';

const readJson = async (path) => JSON.parse(await readFile(new URL(path, import.meta.url), 'utf8'));
const graph = await readJson('../data/foundation-skill-graph.json');
const sliceSkills = await readJson('../data/jla-foundation-skill-slice.json');
const { map: graduationMap } = await readJson('../data/graduation-skill-map.json');
const sliceIds = new Set(sliceSkills.map((skill) => skill.id));
const isLiveSession = (href) => href === 'hebrew-decoding.html' || href.startsWith('academy-session.html?skill=fnd-');

test('placement treats a new learner as a starting point, not a judgment', () => {
  const result = buildJlaPlacementResult({ graph });
  assert.equal(result.headline, 'Starting point, not a test.');
  assert.match(result.summary, /one useful capability/i);
  assert.match(result.skillId, /^fnd-/);
  assert.equal(result.firstUsefulSkill.id, result.skillId);
  assert.ok(!sliceIds.has(result.skillId), 'start must not be a graduation-slice id');
  assert.ok(isLiveSession(result.firstSession));
  assert.equal(result.firstSession, foundationSessionHref(result.skillId));
});

test('placement reports a capability profile on foundation layers, not graduation-slice domains', () => {
  const result = buildJlaPlacementResult({
    graph,
    known: ['fnd-decode-letters', 'fnd-decode-vowels', 'fnd-decode-blend', 'fnd-decode-word']
  });
  assert.ok(result.profile.length);
  assert.equal(result.profile[0].state, 'secure');
  assert.ok(result.profile.some((layer) => layer.state === 'emerging'));
  assert.equal(result.profile.some((layer) => 'domain' in layer), false);
  assert.ok(result.known.every((id) => id.startsWith('fnd-')));
});

test('a capable profile still starts on a frontier fnd- skill, never a slice id or Gemara default', () => {
  const domainScores = Object.fromEntries([
    ['source-navigation', 0.9],
    ['gemara-moves', 0.9],
    ['tefillah-siddur-literacy', 0.2]
  ]);
  const result = buildJlaPlacementResult({ graph, domainScores, sliceSkills, graduationMap });
  assert.match(result.skillId, /^fnd-/);
  assert.ok(!sliceIds.has(result.skillId));
  assert.notEqual(result.skillId, 'tefillah-blessing-001');
  assert.notEqual(result.skillId, 'gemara-question-001');
  assert.notEqual(result.skillId, 'source-family-001');
  assert.ok(isLiveSession(result.firstSession));
  assert.doesNotMatch(result.firstSession, /source-family-001|tefillah-blessing-001/);
});

test('placement preserves a sustainable learner rhythm within safe bounds', () => {
  const chosen = buildJlaPlacementResult({
    graph,
    rhythm: { daysPerWeek: 4, minutesPerSession: 15 }
  });
  assert.deepEqual(chosen.recommendedRhythm, { daysPerWeek: 4, minutesPerSession: 15 });

  const bounded = buildJlaPlacementResult({
    graph,
    rhythm: { daysPerWeek: 10, minutesPerSession: 2 }
  });
  assert.deepEqual(bounded.recommendedRhythm, { daysPerWeek: 7, minutesPerSession: 10 });
});

test('placement refuses a missing foundation graph', () => {
  assert.throws(() => buildJlaPlacementResult({}), /foundation skill graph/);
  assert.throws(() => buildJlaPlacementResult({ graph: { skills: [] } }), /foundation skill graph/);
});

test('slice ids translate onto the foundation graph and never own the start', () => {
  assert.equal(foundationIdFor('fnd-orient-source-type', graduationMap), 'fnd-orient-source-type');
  assert.equal(foundationIdFor('source-family-001', graduationMap), 'fnd-orient-source-type');
  assert.equal(foundationIdFor('tefillah-blessing-001', graduationMap), 'fnd-signal-name-formulas');
  const resolved = resolvePlacementStart({
    graph,
    scores: { 'source-family-001': 0.9, 'hebrew-decoding': 0.4 },
    recommendedSkill: 'source-family-001',
    graduationMap
  });
  assert.equal('source-family-001' in resolved.scores, false);
  assert.ok(resolved.scores['fnd-orient-source-type'] >= 0.8);
  assert.equal(resolved.scores['hebrew-decoding'], 0.4);
  assert.match(resolved.recommendedSkill, /^fnd-/);
  assert.ok(!sliceIds.has(resolved.recommendedSkill));
  assert.ok(isLiveSession(resolved.firstSession));
});

test('post-placement recommendation matches the placement CTA on the same fnd- id', () => {
  const placement = buildJlaPlacementResult({ graph, known: ['fnd-orient-source-type'] });
  const rec = foundationFrontierRecommendation({
    placement: { completedAt: '2026-09-07' },
    foundationScores: Object.fromEntries(placement.known.map((id) => [id, 0.8]))
  }, graph);
  assert.equal(placement.skillId, rec.skillId);
  assert.equal(placement.firstSession, rec.url);
  assert.match(placement.skillId, /^fnd-/);
  assert.ok(isLiveSession(placement.firstSession));
});
