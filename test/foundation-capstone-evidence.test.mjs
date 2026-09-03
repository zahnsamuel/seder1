import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

// The foundation capstone records an `answer_submitted` event per move, and completing it is the
// Foundation Term milestone. Those events must land on REAL foundation-graph skills, or the
// evidence is orphaned — recorded against ids no graph knows, so it never moves the learner's
// capability state. This asserts every skill the capstone credits resolves in the graph, so a
// future edit cannot silently reintroduce an off-graph `capstone-*` id.
test('foundation capstone records evidence only against real foundation-graph skills', async () => {
  const js = await readFile(new URL('../foundation-capstone.js', import.meta.url), 'utf8');
  const graph = JSON.parse(await readFile(new URL('../data/foundation-skill-graph.json', import.meta.url), 'utf8'));
  const graphIds = new Set(graph.skills.map((s) => s.id));

  const recorded = [...js.matchAll(/skill:'([^']+)'/g)].map((m) => m[1]);
  assert.ok(recorded.length >= 5, `expected the five capstone moves to carry a skill, found ${recorded.length}`);

  const offGraph = recorded.filter((id) => !graphIds.has(id));
  assert.deepEqual(offGraph, [],
    `these capstone moves record evidence against ids not in the foundation graph:\n  ${offGraph.join('\n  ')}`);
});
