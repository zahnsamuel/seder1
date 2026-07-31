import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (p) => JSON.parse(readFileSync(new URL(`../${p}`, import.meta.url), 'utf8'));
const graph = read('data/foundation-skill-graph.json');
const gradMap = read('data/graduation-skill-map.json').map;
const authoredSliceSkills = new Set(read('data/jla-academy-sessions.json').map((a) => a.skillId));
const edgeLayer = read('data/foundation-skill-edges.json');
const skillIds = new Set(graph.skills.map((s) => s.id));
const edges = edgeLayer.edges;

test('the typed-edge layer is in sync with the graph version (regenerate on graph change)', () => {
  assert.equal(edgeLayer.graphVersion, graph.version);
  assert.match(edgeLayer.generatedBy, /build-skill-edges\.mjs/);
});

test('prerequisite edges exactly mirror the graph adjacency — no drift, nothing invented', () => {
  const key = (e) => `${e.from}->${e.to}`;
  const fromGraph = new Set();
  for (const skill of graph.skills) for (const pre of skill.prerequisites || []) fromGraph.add(`${pre}->${skill.id}`);
  const fromEdges = edges.filter((e) => e.type === 'prerequisite');
  // Same count (no duplicates), and the same set both directions.
  assert.equal(fromEdges.length, fromGraph.size, 'prerequisite edge count matches the adjacency');
  const edgeKeys = new Set(fromEdges.map(key));
  assert.equal(edgeKeys.size, fromEdges.length, 'no duplicate prerequisite edges');
  for (const k of fromGraph) assert.ok(edgeKeys.has(k), `graph prerequisite ${k} has a typed edge`);
  for (const e of fromEdges) assert.ok(fromGraph.has(key(e)), `typed edge ${key(e)} corresponds to a real graph prerequisite`);
});

test('prerequisite direction is from-requirement -> to-dependent (§3)', () => {
  // For a skill S with prerequisite P: edge is { from: P, to: S }. "to cannot be learned before from."
  const sample = graph.skills.find((s) => (s.prerequisites || []).length);
  const pre = sample.prerequisites[0];
  assert.ok(edges.some((e) => e.type === 'prerequisite' && e.from === pre && e.to === sample.id));
});

test('every edge endpoint resolves to a real node', () => {
  for (const e of edges) {
    assert.ok(skillIds.has(e.from), `edge.from ${e.from} is a real skill`);
    if (e.type === 'prerequisite') assert.ok(skillIds.has(e.to), `prerequisite edge.to ${e.to} is a real skill`);
    if (e.type === 'assessed-by') assert.ok(authoredSliceSkills.has(e.to), `assessed-by edge.to ${e.to} is an authored academy item`);
  }
});

test('assessed-by edges come only from Migration 001 links that are actually authored', () => {
  const assessedBy = edges.filter((e) => e.type === 'assessed-by');
  assert.ok(assessedBy.length > 0);
  for (const e of assessedBy) {
    const entry = gradMap[e.to];
    assert.ok(entry, `assessed-by ${e.to} exists in the graduation-skill map`);
    assert.equal(entry.graphSkill, e.from, 'assessed-by edge matches the map pairing');
    assert.equal(e.confidence, entry.confidence, 'assessed-by carries the map confidence, not an invented one');
  }
});

test('only derivable edge types exist; judgment edges wait for the audit', () => {
  const allowed = new Set(['prerequisite', 'assessed-by']);
  for (const e of edges) assert.ok(allowed.has(e.type), `edge type ${e.type} is derivable`);
  assert.deepEqual([...new Set(edges.map((e) => e.type))].sort(), ['assessed-by', 'prerequisite']);
  // Soft/judgment edges must not have been fabricated during the freeze.
  for (const banned of ['supports', 'transfers-to', 'misconception-of', 'repaired-by']) {
    assert.ok(!edges.some((e) => e.type === banned), `${banned} edges are not fabricated before the audit`);
  }
});

test('pedagogical rationales are null — they are educator-authored, never fabricated (§3, freeze)', () => {
  for (const e of edges.filter((e) => e.type === 'prerequisite')) assert.equal(e.rationale, null);
});

test('the reported counts match the actual edges', () => {
  const tally = edges.reduce((acc, e) => ({ ...acc, [e.type]: (acc[e.type] || 0) + 1 }), {});
  assert.deepEqual(edgeLayer.counts, tally);
});
