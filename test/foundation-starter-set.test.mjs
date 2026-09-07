import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const load = async (file) => JSON.parse(await readFile(new URL(`../${file}`, import.meta.url), 'utf8'));

test('the foundation starter set is a valid, prerequisite-closed freeze of the live graph', async () => {
  const graph = await load('data/foundation-skill-graph.json');
  const set = await load('data/foundation-starter-set.json');

  const byId = new Map(graph.skills.map((s) => [s.id, s]));
  const starter = set.starterSet.map((s) => s.id);
  const frozen = set.frozen.map((s) => s.id);
  const starterIds = new Set(starter);
  const frozenIds = new Set(frozen);

  // Every referenced id is a real skill in the brain graph.
  for (const id of [...starter, ...frozen]) {
    assert.ok(byId.has(id), `${id} is not a skill in foundation-skill-graph.json`);
  }

  // Starter and frozen partition the whole graph: no overlap, nothing omitted.
  assert.equal(starterIds.size, starter.length, 'duplicate id in starterSet');
  assert.equal(frozenIds.size, frozen.length, 'duplicate id in frozen');
  for (const id of starterIds) assert.ok(!frozenIds.has(id), `${id} is in both starterSet and frozen`);
  assert.equal(
    starterIds.size + frozenIds.size,
    graph.skills.length,
    'starterSet + frozen must cover every skill exactly once',
  );
  for (const s of graph.skills) {
    assert.ok(starterIds.has(s.id) || frozenIds.has(s.id), `${s.id} is neither started nor frozen`);
  }

  // The freeze stays in the north-star's ~20-30 band.
  assert.ok(starter.length >= 20 && starter.length <= 30, `starter set is ${starter.length}, expected 20-30`);

  // Prerequisite-closed: a started skill never depends on a frozen one, so the
  // frontier router can always walk the starter set without hitting a frozen prereq.
  for (const id of starterIds) {
    for (const prereq of byId.get(id).prerequisites || []) {
      assert.ok(
        starterIds.has(prereq),
        `${id} is in the starter set but its prerequisite ${prereq} is frozen — the set is not prerequisite-closed`,
      );
    }
  }

  // The declared target leaves are actually in the started set.
  for (const leaf of set.selection.leaves) {
    assert.ok(starterIds.has(leaf), `declared leaf ${leaf} is not in the starter set`);
  }

  // Titles are copied from the graph; guard against drift when a skill is renamed.
  for (const entry of [...set.starterSet, ...set.frozen]) {
    assert.equal(entry.title, byId.get(entry.id).title, `stale title for ${entry.id}; regenerate the starter set`);
    assert.equal(entry.layer, byId.get(entry.id).layer, `stale layer for ${entry.id}; regenerate the starter set`);
  }
});
