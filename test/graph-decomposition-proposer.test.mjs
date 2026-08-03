import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const repoRoot = fileURLToPath(new URL('..', import.meta.url));
const graph = JSON.parse(readFileSync(new URL('../data/foundation-skill-graph.json', import.meta.url), 'utf8'));
const graphBefore = readFileSync(new URL('../data/foundation-skill-graph.json', import.meta.url), 'utf8');
const byId = new Map(graph.skills.map((s) => [s.id, s]));
const layerOf = (id) => byId.get(id).layer;

// Independent reachability check, mirroring the proposer, to verify its classification.
const dependents = new Map(graph.skills.map((s) => [s.id, []]));
for (const s of graph.skills) for (const p of s.prerequisites || []) dependents.get(p).push(s.id);
function altPath(from, to) {
  const q = (dependents.get(from) || []).filter((x) => x !== to); const seen = new Set(q);
  while (q.length) { const c = q.shift(); if (c === to) return true; for (const d of dependents.get(c) || []) if (!seen.has(d)) { seen.add(d); q.push(d); } }
  return false;
}

execFileSync(process.execPath, ['scripts/graph-decomposition-proposer.mjs'], { cwd: repoRoot });
const report = JSON.parse(readFileSync(new URL('../data/graph-decomposition-proposals.json', import.meta.url), 'utf8'));

test('proposes for every long edge and leaves the graph untouched', () => {
  const longEdges = graph.skills.flatMap((s) => (s.prerequisites || []).filter((p) => s.layer - layerOf(p) >= report.params.spanThreshold).map((p) => [p, s.id]));
  assert.equal(report.summary.targeted, longEdges.length);
  assert.equal(report.summary.redundantEdges + report.summary.insertIntermediate, report.summary.targeted);
  assert.equal(readFileSync(new URL('../data/foundation-skill-graph.json', import.meta.url), 'utf8'), graphBefore, 'proposal-only: graph unchanged');
});

test('redundant-edge proposals are truly redundant; each drops exactly that edge', () => {
  const redundant = report.proposals.filter((p) => p.kind === 'redundant-edge');
  assert.ok(redundant.length > 0);
  for (const p of redundant) {
    assert.ok(altPath(p.edge.from, p.edge.to), `${p.edge.from}->${p.edge.to} must have an alternative path to be droppable`);
    assert.deepEqual(p.graphEdits.removeEdges, [{ from: p.edge.from, to: p.edge.to }]);
  }
});

test('insert-intermediate proposals invent no pedagogy and rewire correctly', () => {
  const inserts = report.proposals.filter((p) => p.kind === 'insert-intermediate');
  assert.ok(inserts.length > 0);
  for (const p of inserts) {
    // No alternative path — the edge is a real dependency needing a bridge.
    assert.ok(!altPath(p.edge.from, p.edge.to));
    // The stub carries NO authored content — that is the human's to write.
    const stub = p.graphEdits.addSkill;
    assert.equal(stub.title, null);
    assert.equal(stub.statement, null);
    assert.equal(stub.teachingMove, null);
    assert.equal(stub.status ?? p.status, 'draft-needs-authoring');
    // Placed strictly between the two ends.
    assert.ok(p.proposedLayer > p.edge.fromLayer && p.proposedLayer < p.edge.toLayer);
    // Rewire: from→new, new→to, drop the direct edge.
    assert.deepEqual(p.graphEdits.removeEdges, [{ from: p.edge.from, to: p.edge.to }]);
    assert.ok(p.graphEdits.addEdges.some((e) => e.from === p.edge.from) && p.graphEdits.addEdges.some((e) => e.to === p.edge.to));
    // Guidance quotes the real endpoint skills — grounded, not fabricated.
    assert.equal(p.bridges.from.statement, byId.get(p.edge.from).statement);
    assert.equal(p.bridges.to.statement, byId.get(p.edge.to).statement);
  }
});
