import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { estimateFrontierFromDiagnostic } from '../data/knowledge-graph.mjs';

const graph = JSON.parse(readFileSync(new URL('../data/foundation-skill-graph.json', import.meta.url), 'utf8'));
const server = readFileSync(new URL('../server.mjs', import.meta.url), 'utf8');

test('the server wires placement into the frontier estimator (downward inference)', () => {
  // A placement_completed event is enriched before it is recorded.
  assert.match(server, /if \(event\.type === 'placement_completed'\) await enrichPlacementWithFrontier\(root, event\)/);
  // The enrichment uses the diagnostic estimator and only raises scores (never lowers them).
  assert.match(server, /estimateFrontierFromDiagnostic\(\{ skills: cachedGraphSkills \}/);
  assert.match(server, /Math\.max\(foundationScores\[id\] \|\| 0, SECURE_SEED\)/);
});

test('demonstrating one mid-layer skill infers its whole prerequisite chain as known', () => {
  const deep = graph.skills.find((s) => s.layer >= 4 && (s.prerequisites || []).length);
  const { known } = estimateFrontierFromDiagnostic(graph, { [deep.id]: true });
  assert.ok(known.includes(deep.id));
  // Downward inference expands one demonstrated skill into itself + all its transitive prerequisites.
  assert.ok(known.length > 1 + deep.prerequisites.length - 1, 'the known set expands beyond the single demonstrated skill');
  const prereqClosure = new Set();
  const collect = (id) => { for (const p of graph.skills.find((s) => s.id === id)?.prerequisites || []) if (!prereqClosure.has(p)) { prereqClosure.add(p); collect(p); } };
  collect(deep.id);
  for (const p of prereqClosure) assert.ok(known.includes(p), `transitive prerequisite ${p} is seeded known`);
});
