import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { knowledgeFrontier, learningPath, encompassingReviewSet } from '../data/knowledge-graph.mjs';

const graph = JSON.parse(readFileSync(new URL('../data/foundation-skill-graph.json', import.meta.url), 'utf8'));
const edges = JSON.parse(readFileSync(new URL('../data/foundation-skill-edges.json', import.meta.url), 'utf8')).edges;
const prereqsOf = new Map(graph.skills.map((s) => [s.id, s.prerequisites || []]));

test('a new learner sits at the graph roots (the initial knowledge frontier)', () => {
  const roots = graph.skills.filter((s) => (s.prerequisites || []).length === 0).map((s) => s.id);
  const { frontier, mastered } = knowledgeFrontier(graph, []);
  assert.deepEqual(frontier.sort(), roots.sort());
  assert.equal(mastered.length, 0);
});

test('frontier partitions the graph and respects prerequisites', () => {
  const mastered = ['fnd-orient-source-type'];
  const { frontier, blocked } = knowledgeFrontier(graph, mastered);
  const masteredSet = new Set(mastered);
  // frontier = not mastered, every prerequisite mastered.
  for (const id of frontier) {
    assert.ok(!masteredSet.has(id));
    for (const p of prereqsOf.get(id)) assert.ok(masteredSet.has(p), `${id} frontier => prereq ${p} mastered`);
  }
  // blocked = not mastered, at least one prerequisite missing, and `missing` is accurate.
  for (const { skill, missing } of blocked) {
    assert.ok(!masteredSet.has(skill));
    assert.ok(missing.length > 0);
    for (const p of missing) assert.ok(prereqsOf.get(skill).includes(p) && !masteredSet.has(p));
  }
  // No skill is both ready and blocked; together with mastered they cover every skill.
  assert.equal(frontier.length + blocked.length + 1, graph.skills.length);
});

test('mastering a frontier skill advances the frontier', () => {
  const before = knowledgeFrontier(graph, []).frontier; // [root]
  const after = knowledgeFrontier(graph, before).frontier;
  assert.ok(!after.includes(before[0]), 'the mastered root is no longer on the frontier');
  assert.ok(after.length > 0, 'new skills opened up');
});

test('a learning path is a valid topological order ending at the goal, excluding mastered', () => {
  const goal = graph.skills.find((s) => s.layer >= 5).id;
  const path = learningPath(graph, goal, []);
  assert.equal(path.at(-1), goal);
  const seen = new Set();
  for (const id of path) {
    for (const p of prereqsOf.get(id)) {
      if (path.includes(p)) assert.ok(seen.has(p), `prereq ${p} comes before ${id}`);
    }
    seen.add(id);
  }
  // Mastering an ancestor removes it (and only it and its own ancestors) from the path.
  const trimmed = learningPath(graph, goal, [path[0]]);
  assert.ok(!trimmed.includes(path[0]));
  assert.ok(trimmed.length < path.length);
});

test('a mastered goal needs no learning path', () => {
  const goal = graph.skills[0].id;
  assert.deepEqual(learningPath(graph, goal, [goal]), []);
});

test('FIRe collapses a due prerequisite chain to the single most-advanced task', () => {
  // source-type -> page-geography -> unit-boundary is a full-encompassing chain.
  const chain = ['fnd-orient-source-type', 'fnd-orient-page-geography', 'fnd-orient-unit-boundary'];
  const { practice, covered } = encompassingReviewSet(chain, edges);
  assert.deepEqual(practice, ['fnd-orient-unit-boundary'], 'only the most advanced skill is practiced');
  assert.equal(Object.keys(covered).length, 2, 'the two simpler skills are covered implicitly');
  // Nothing is both practiced and silently dropped.
  for (const id of practice) assert.ok(!(id in covered));
});

test('FIRe practices every due skill that nothing else encompasses', () => {
  // Two unrelated leaves: neither encompasses the other, so both must be practiced.
  const leaves = graph.skills.filter((s) => (s.prerequisites || []).length && s.layer >= 8).slice(0, 2).map((s) => s.id);
  const { practice, covered } = encompassingReviewSet(leaves, edges);
  assert.deepEqual(practice.sort(), leaves.sort());
  assert.equal(Object.keys(covered).length, 0);
});
