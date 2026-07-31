import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (p) => JSON.parse(readFileSync(new URL(`../${p}`, import.meta.url), 'utf8'));
const graph = read('data/foundation-skill-graph.json');
const layer = read('data/foundation-knowledge-points.json');
const skillById = new Map(graph.skills.map((s) => [s.id, s]));
const layerOf = new Map(graph.skills.map((s) => [s.id, s.layer]));

test('the KP layer is in sync with the graph version', () => {
  assert.equal(layer.graphVersion, graph.version);
  assert.match(layer.generatedBy, /build-knowledge-points\.mjs/);
});

test('no KP text is invented — each is the skill’s own teachingMove / check / transfer', () => {
  for (const kp of layer.knowledgePoints) {
    const skill = skillById.get(kp.skill);
    assert.ok(skill, `${kp.id} references a real skill`);
    const expected = { teachingMove: skill.teachingMove, check: (skill.checks || [])[0], transfer: skill.transfer }[kp.source];
    assert.equal(kp.statement, expected, `${kp.id} statement is the skill's ${kp.source} verbatim`);
  }
});

test('every skill decomposes into ordered introduce -> practice -> transfer KPs', () => {
  for (const skill of graph.skills) {
    const kps = layer.knowledgePoints.filter((k) => k.skill === skill.id).sort((a, b) => a.index - b.index);
    assert.deepEqual(kps.map((k) => k.index), kps.map((_, i) => i + 1), `${skill.id} KP indices are 1..n`);
    assert.deepEqual(kps.map((k) => k.kind), ['introduce', 'practice', 'transfer']);
  }
});

test('each KP key prerequisite is one of the skill’s real prerequisites, by the stated heuristic', () => {
  for (const kp of layer.knowledgePoints) {
    const skill = skillById.get(kp.skill);
    const prereqs = skill.prerequisites || [];
    if (prereqs.length === 0) {
      assert.equal(kp.keyPrerequisite, null, `${kp.id} root skill has no key prerequisite`);
      assert.equal(kp.keyPrerequisiteStatus, 'none-root-skill');
      continue;
    }
    assert.ok(prereqs.includes(kp.keyPrerequisite), `${kp.id} key prereq is one of the skill's own prerequisites`);
    assert.equal(kp.keyPrerequisiteStatus, 'proposed-pending-expert');
    const sorted = [...prereqs].sort((a, b) => layerOf.get(a) - layerOf.get(b));
    const expected = kp.kind === 'introduce' ? sorted[0] : sorted[sorted.length - 1];
    assert.equal(kp.keyPrerequisite, expected, `${kp.id} uses the ${kp.kind === 'introduce' ? 'foundational' : 'proximate'} prerequisite`);
  }
});

test('coverage is reported accurately', () => {
  assert.equal(layer.coverage.knowledgePoints, layer.knowledgePoints.length);
  assert.equal(layer.coverage.skills, new Set(layer.knowledgePoints.map((k) => k.skill)).size);
  assert.equal(layer.coverage.keyPrerequisitesProposed, layer.knowledgePoints.filter((k) => k.keyPrerequisite).length);
  assert.equal(layer.coverage.knowledgePoints, 3 * graph.skills.length, 'three KPs per skill in this scaffold');
});
