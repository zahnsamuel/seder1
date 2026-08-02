import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { computeGraphPilotAnalytics } from '../data/pilot-analytics.mjs';

const graph = JSON.parse(readFileSync(new URL('../data/foundation-skill-graph.json', import.meta.url), 'utf8'));
const server = readFileSync(new URL('../server.mjs', import.meta.url), 'utf8');
const depSkill = graph.skills.find((s) => (s.prerequisites || []).length);
const dep = depSkill.id;
const pre = depSkill.prerequisites[0];
const t0 = Date.parse('2026-08-01T10:00:00Z');
const ev = (skillId, correct, k = 0) => ({ type: 'answer_submitted', skillId, correct, at: new Date(t0 + k * 60000).toISOString() });

test('empirical edge validation: securing a prerequisite lifts the pass rate on the dependent', () => {
  // Cohort A secures the prerequisite first, then mostly passes; cohort B attempts without it, mostly fails.
  const A = Array.from({ length: 6 }, (_, i) => ({ id: `A${i}`, events: [ev(pre, true, 0), ev(pre, true, 1), ev(pre, true, 2), ev(dep, i < 5, 3)] }));
  const B = Array.from({ length: 6 }, (_, i) => ({ id: `B${i}`, events: [ev(dep, i < 1, 0)] }));
  const out = computeGraphPilotAnalytics([...A, ...B], graph, { minResponses: 4 });
  const edge = out.edges.find((e) => e.from === pre && e.to === dep);
  assert.ok(edge && edge.enough, 'the edge has enough data on both sides');
  assert.ok(edge.passWhenSecured > edge.passWhenNotSecured, 'secured prerequisite predicts success');
  assert.ok(edge.lift > 0.3, `lift ${edge.lift} is a strong positive signal`);
  assert.equal(out.summary.edgesConfirmingPrerequisite, 1);
});

test('per-skill difficulty and discrimination are computed from first attempts', () => {
  // Strong learners (pass everything) and weak learners (fail the dependent) => discriminating skill.
  const strong = Array.from({ length: 5 }, (_, i) => ({ id: `S${i}`, events: [ev(pre, true, 0), ev(pre, true, 1), ev(pre, true, 2), ev(dep, true, 3)] }));
  const weak = Array.from({ length: 5 }, (_, i) => ({ id: `W${i}`, events: [ev(pre, true, 0), ev(dep, false, 1)] }));
  const out = computeGraphPilotAnalytics([...strong, ...weak], graph, { minResponses: 4 });
  const skill = out.skills.find((s) => s.skill === dep);
  assert.ok(skill.enough);
  assert.equal(skill.difficulty, 0.5, 'first-attempt P-value = 5 of 10 correct');
  assert.ok(skill.discrimination > 0, 'those who pass tend to be the stronger learners');
});

test('sparse data is flagged, never faked', () => {
  const out = computeGraphPilotAnalytics([{ id: 'solo', events: [ev(dep, true, 0)] }], graph, { minResponses: 5 });
  const skill = out.skills.find((s) => s.skill === dep);
  assert.equal(skill.enough, false, 'one response is not enough');
  assert.equal(skill.discrimination, null, 'discrimination needs a spread of learners');
  assert.equal(out.summary.responses, 1);
});

test('the operator analytics endpoint exposes the graph pilot psychometrics', () => {
  assert.match(server, /computeGraphPilotAnalytics\(learners, foundationGraph\)/);
  assert.match(server, /graphPilot/);
});
