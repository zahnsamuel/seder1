import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { knowledgeFrontier, learningPath, encompassingReviewSet, keyPrerequisiteRemediation, estimateFrontierFromDiagnostic, nextDiagnosticProbe } from '../data/knowledge-graph.mjs';

const graph = JSON.parse(readFileSync(new URL('../data/foundation-skill-graph.json', import.meta.url), 'utf8'));
const edges = JSON.parse(readFileSync(new URL('../data/foundation-skill-edges.json', import.meta.url), 'utf8')).edges;
const knowledgePoints = JSON.parse(readFileSync(new URL('../data/foundation-knowledge-points.json', import.meta.url), 'utf8')).knowledgePoints;
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

test('the diagnostic infers prerequisites downward from a passed skill', () => {
  const deep = graph.skills.find((s) => s.layer >= 4 && (s.prerequisites || []).length);
  const { known } = estimateFrontierFromDiagnostic(graph, { [deep.id]: true });
  assert.ok(known.includes(deep.id), 'the passed skill is known');
  for (const p of deep.prerequisites) assert.ok(known.includes(p), `prerequisite ${p} inferred known`);
});

test('a direct failure overrides an inferred pass', () => {
  const skill = graph.skills.find((s) => (s.prerequisites || []).length);
  const prereq = skill.prerequisites[0];
  // Passing `skill` would infer `prereq` known; failing `prereq` directly must win.
  const { known } = estimateFrontierFromDiagnostic(graph, { [skill.id]: true, [prereq]: false });
  assert.ok(!known.includes(prereq), 'the directly-failed prerequisite is not counted as known');
});

test('empty diagnostic yields the root frontier; probes are always fresh and uncertain', () => {
  const roots = graph.skills.filter((s) => !(s.prerequisites || []).length).map((s) => s.id);
  assert.deepEqual(estimateFrontierFromDiagnostic(graph, {}).frontier.sort(), roots.sort());
  const probe = nextDiagnosticProbe(graph, {});
  assert.ok(graph.skills.some((s) => s.id === probe), 'probe is a real skill');
});

test('the adaptive diagnostic pins the exact frontier in far fewer questions than skills', () => {
  for (const maxLayer of [0, 2, 3, 5, 8]) {
    const trueKnown = new Set(graph.skills.filter((s) => s.layer <= maxLayer).map((s) => s.id));
    const responses = {};
    let questions = 0;
    for (;;) {
      const probe = nextDiagnosticProbe(graph, responses);
      if (!probe) break;
      assert.ok(!(probe in responses), 'never re-probes an answered skill');
      responses[probe] = trueKnown.has(probe); // a truthful learner
      if (++questions > graph.skills.length) { assert.fail('diagnostic did not terminate'); }
    }
    const est = estimateFrontierFromDiagnostic(graph, responses);
    const trueFrontier = knowledgeFrontier(graph, [...trueKnown]).frontier;
    assert.deepEqual(est.frontier.sort(), trueFrontier.sort(), `frontier exact at layer<=${maxLayer}`);
    assert.deepEqual(est.known.sort(), [...trueKnown].sort(), `known set exact at layer<=${maxLayer}`);
    assert.ok(questions < graph.skills.length, `${questions} questions < ${graph.skills.length} skills`);
  }
});

test('MA remediation routes a struggled skill to its knowledge points’ key prerequisite', () => {
  const skill = graph.skills.find((s) => (s.prerequisites || []).length && knowledgePoints.some((k) => k.skill === s.id && k.kind === 'practice' && k.keyPrerequisite));
  const practiceKey = knowledgePoints.find((k) => k.skill === skill.id && k.kind === 'practice').keyPrerequisite;
  const r = keyPrerequisiteRemediation({ knowledgePoints, struggles: { [skill.id]: 2 }, mastery: {} });
  assert.equal(r.strugglingSkill, skill.id);
  assert.equal(r.keyPrerequisite, practiceKey, 'targets the practice KP’s key prerequisite (the proximate foundation)');
  assert.equal(r.count, 2);
});

test('MA remediation skips a foundation the learner already holds, and low struggle', () => {
  const skill = 'fnd-role-question-vs-answer';
  const key = knowledgePoints.find((k) => k.skill === skill && k.kind === 'practice').keyPrerequisite;
  // Foundation already strong -> reviewing it would not help -> fall through.
  assert.equal(keyPrerequisiteRemediation({ knowledgePoints, struggles: { [skill]: 2 }, mastery: { [key]: 0.9 } }), null);
  // Below the twice-failed threshold -> no remediation yet.
  assert.equal(keyPrerequisiteRemediation({ knowledgePoints, struggles: { [skill]: 1 }, mastery: {} }), null);
  // Nothing struggled -> nothing to remediate.
  assert.equal(keyPrerequisiteRemediation({ knowledgePoints, struggles: {}, mastery: {} }), null);
});

test('FIRe practices every due skill that nothing else encompasses', () => {
  // Two unrelated leaves: neither encompasses the other, so both must be practiced.
  const leaves = graph.skills.filter((s) => (s.prerequisites || []).length && s.layer >= 8).slice(0, 2).map((s) => s.id);
  const { practice, covered } = encompassingReviewSet(leaves, edges);
  assert.deepEqual(practice.sort(), leaves.sort());
  assert.equal(Object.keys(covered).length, 0);
});
