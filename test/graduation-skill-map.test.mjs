import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// Migration guard for the id-space map (data/graduation-skill-map.json), the translation layer
// between the graduation-slice / academy id space and the frozen fnd-* foundation graph.

const read = (p) => JSON.parse(readFileSync(new URL(`../${p}`, import.meta.url), 'utf8'));
const { map } = read('data/graduation-skill-map.json');
const graph = read('data/foundation-skill-graph.json');
const slice = read('data/jla-foundation-skill-slice.json');
const sessions = read('data/jla-academy-sessions.json');

const graphIds = new Set(graph.skills.map((s) => s.id));

test('the map covers exactly the graduation-slice id space (no gaps, no extras)', () => {
  const sliceIds = new Set(slice.map((s) => s.id));
  const mapIds = new Set(Object.keys(map));
  for (const id of sliceIds) assert.ok(mapIds.has(id), `slice skill ${id} is missing from the graduation map`);
  for (const id of mapIds) assert.ok(sliceIds.has(id), `map has ${id}, which is not a graduation-slice skill`);
});

test('every authored academy session has a map entry (its items can reach the graph)', () => {
  for (const s of sessions) assert.ok(map[s.skillId], `academy session ${s.skillId} has no graduation-map entry`);
});

test('every non-null graphSkill resolves to a real fnd-* graph skill (no dangling references)', () => {
  for (const [gradId, entry] of Object.entries(map)) {
    assert.ok(['clear', 'approximate', 'unmapped'].includes(entry.confidence), `${gradId}: invalid confidence ${entry.confidence}`);
    if (entry.confidence === 'unmapped') { assert.equal(entry.graphSkill, null, `${gradId}: unmapped entries must have graphSkill null`); continue; }
    assert.ok(entry.graphSkill && graphIds.has(entry.graphSkill), `${gradId}: graphSkill '${entry.graphSkill}' does not resolve in the graph`);
    assert.ok(entry.note && entry.note.trim(), `${gradId}: a linked mapping must carry a rationale note`);
  }
});

test('the map is honest about coverage: some graduation skills are unmapped (audit candidates)', () => {
  const unmapped = Object.values(map).filter((e) => e.confidence === 'unmapped').length;
  const linked = Object.values(map).filter((e) => e.graphSkill).length;
  assert.equal(linked + unmapped, Object.keys(map).length);
  // This is a prototype, not a finished unification — the map should still record real gaps.
  assert.ok(unmapped > 0, 'expected some graduation skills to have no graph home (a real finding, not a forced 1:1)');
});
