import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { knowledgeFrontier } from '../data/knowledge-graph.mjs';
import { foundationFrontierRecommendation, foundationSessionHref, normalizeNextAction } from '../data/next-action.mjs';

const graph = JSON.parse(readFileSync(new URL('../data/foundation-skill-graph.json', import.meta.url), 'utf8'));
const server = readFileSync(new URL('../server.mjs', import.meta.url), 'utf8');
const decode = ['fnd-decode-letters', 'fnd-decode-vowels', 'fnd-decode-blend', 'fnd-decode-word'];
const secure = (ids) => Object.fromEntries(ids.map((id) => [id, 0.8]));

test('server foundation path uses the knowledge frontier, not a hardcoded ladder', () => {
  const engine = readFileSync(new URL('../data/next-action.mjs', import.meta.url), 'utf8');
  assert.match(server, /academyFoundationRecommendation/);
  assert.match(server, /foundationFrontierRecommendation/);
  assert.match(engine, /knowledgeFrontier/);
  assert.match(engine, /foundationGraduated/);
  assert.doesNotMatch(server, /daily-router\.html\?foundationSkill=/);
  assert.doesNotMatch(server, /fnd-signal-question-words[\s\S]*fnd-orient-question-present[\s\S]*fnd-arg-claim/);
});

test('foundation session href opens the live lesson with the skill id preserved', () => {
  assert.equal(foundationSessionHref('fnd-decode-letters'), 'hebrew-decoding.html');
  assert.equal(foundationSessionHref('fnd-orient-source-type'), 'academy-session.html?skill=fnd-orient-source-type');
  assert.equal(foundationSessionHref('javascript:alert(1)'), 'daily-router.html');
});

test('a placed beginner is sent to the graph-root frontier skill, not Today', () => {
  const rec = foundationFrontierRecommendation({ placement: { completedAt: '2026-09-07' }, foundationScores: {} }, graph);
  const roots = graph.skills.filter((skill) => !(skill.prerequisites || []).length).map((skill) => skill.id);
  assert.ok(rec);
  assert.equal(rec.kind, 'academy-foundation');
  assert.ok(roots.includes(rec.skillId), `${rec.skillId} must be a graph root`);
  assert.equal(rec.url, foundationSessionHref(rec.skillId));
  const action = normalizeNextAction({ type: 'foundation', ...rec, href: rec.url });
  assert.equal(action.href, rec.url);
  assert.equal(action.skillId, rec.skillId);
});

test('after the decode on-ramp, the next action is a frontier skill the 14-skill ladder skipped', () => {
  const rec = foundationFrontierRecommendation({ placement: { completedAt: '2026-09-07' }, foundationScores: secure(decode) }, graph);
  const { frontier } = knowledgeFrontier(graph, decode);
  assert.ok(rec);
  assert.ok(frontier.includes(rec.skillId), `${rec.skillId} must sit on knowledgeFrontier`);
  assert.equal(rec.skillId, 'fnd-orient-source-type');
  assert.equal(rec.url, 'academy-session.html?skill=fnd-orient-source-type');
  assert.equal(rec.builtOn, graph.skills.find((skill) => skill.id === 'fnd-decode-word').title);
});

test('securing a ladder skill still leaves skipped graph siblings on the frontier', () => {
  const mastered = [...decode, 'fnd-orient-source-type'];
  const rec = foundationFrontierRecommendation({ placement: { completedAt: '2026-09-07' }, foundationScores: secure(mastered) }, graph);
  const { frontier } = knowledgeFrontier(graph, mastered);
  assert.ok(rec);
  assert.ok(frontier.includes(rec.skillId));
  assert.equal(rec.skillId, 'fnd-orient-page-geography');
  assert.equal(rec.url, 'academy-session.html?skill=fnd-orient-page-geography');
  assert.ok(!['fnd-signal-question-words', 'fnd-orient-question-present', 'fnd-arg-claim'].includes(rec.skillId));
});

test('a graduated or fully-secured foundation learner is not given a leftover foundation CTA', () => {
  assert.equal(foundationFrontierRecommendation({ foundationGraduated: true, foundationScores: secure(decode) }, graph), null);
  const all = graph.skills.map((skill) => skill.id);
  assert.equal(foundationFrontierRecommendation({ foundationScores: secure(all) }, graph), null);
});

test('Today no longer falls through to nextGraphPractice as an independent next-action', () => {
  const engine = readFileSync(new URL('../data/curriculum-engine.mjs', import.meta.url), 'utf8');
  assert.doesNotMatch(server, /if \(graphPractice\) return \{ kind: 'graph-practice'/);
  assert.match(server, /citedSkillId/);
  assert.match(server, /Content-move graphs are indexes/);
  assert.doesNotMatch(engine, /content-skill-graph/);
  assert.doesNotMatch(engine, /skill-graph\.json/);
  assert.match(engine, /foundation-content-map\.json/);
});
