import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { computeRedundantDrops } from '../scripts/apply-redundant-edges.mjs';

const committed = JSON.parse(readFileSync(new URL('../data/foundation-skill-graph.json', import.meta.url), 'utf8'));

// Each skill's full set of transitive prerequisites (ancestors) — the relation reduction must preserve.
function closure(g) {
  const byId = new Map(g.skills.map((s) => [s.id, s]));
  const anc = (id, seen = new Set()) => { for (const p of byId.get(id)?.prerequisites || []) if (!seen.has(p)) { seen.add(p); anc(p, seen); } return seen; };
  return Object.fromEntries(g.skills.map((s) => [s.id, [...anc(s.id)].sort()]));
}

// A tiny graph with a deliberately redundant long edge: A → C is implied by A → B → C.
const synthetic = () => ({
  version: 'test', layers: [{ n: 0 }, { n: 1 }, { n: 2 }],
  skills: [
    { id: 'A', layer: 0, prerequisites: [] },
    { id: 'B', layer: 1, prerequisites: ['A'] },
    { id: 'C', layer: 2, prerequisites: ['B', 'A'] } // 'A' is redundant (C → B → A)
  ]
});

test('computeRedundantDrops removes a redundant long edge and preserves the closure exactly', () => {
  const input = synthetic();
  const snapshot = JSON.stringify(input);
  const { drops, graph: reduced } = computeRedundantDrops(input, 2);
  assert.deepEqual(drops.map((d) => `${d.from}->${d.to}`), ['A->C'], 'only the redundant edge is dropped');
  assert.equal(JSON.stringify(input), snapshot, 'input is not mutated');
  assert.deepEqual(closure(reduced), closure(synthetic()), 'reachability is identical');
  assert.ok(!reduced.skills.find((s) => s.id === 'C').prerequisites.includes('A'), 'direct edge gone');
  assert.ok(closure(reduced).C.includes('A'), 'still reachable transitively');
});

test('a genuine dependency (no alternative path) is never dropped', () => {
  const g = { version: 'test', layers: [{ n: 0 }, { n: 2 }], skills: [
    { id: 'A', layer: 0, prerequisites: [] },
    { id: 'C', layer: 2, prerequisites: ['A'] } // the only path — must stay
  ] };
  assert.equal(computeRedundantDrops(g, 2).drops.length, 0);
});

test('the committed graph is already transitively reduced (apply-redundant has been run)', () => {
  // Idempotence: re-running the cleanup on the shipped graph finds nothing to drop.
  assert.deepEqual(computeRedundantDrops(committed, 3).drops, []);
});
