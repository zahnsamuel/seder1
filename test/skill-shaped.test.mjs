import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const repoRoot = fileURLToPath(new URL('..', import.meta.url));
const graph = JSON.parse(readFileSync(new URL('../data/foundation-skill-graph.json', import.meta.url), 'utf8'));

// A specific source named in a title is the tell of a content node (see check-skill-shaped.mjs).
const NAMED_SOURCE = /\b(berakhot|shabbat|eruvin|pesachim|sukkah|yoma|bava|ketubot|sanhedrin|chullin|niddah|nedarim|nazir|megillah|taanit|chagigah|zevachim|arakhin|genesis|exodus|leviticus|numbers|deuteronomy|psalms?|rashi|akhnai|\d+[ab]\b)/i;

test('the skill-shape gate passes on the current graph and exits 0', () => {
  const out = execFileSync(process.execPath, ['scripts/check-skill-shaped.mjs'], { cwd: repoRoot, encoding: 'utf8' });
  assert.match(out, /All nodes are skill-shaped/);
  assert.match(out, /53\/53 clean/);
  assert.match(out, /Interlocking density/);
});

test('the graph is skill-based, not content-based (data invariant, independent of the script)', () => {
  for (const s of graph.skills) {
    // Every node is a learner capability, not a topic or source.
    assert.match((s.statement || '').trim(), /^you can\b/i, `${s.id} statement is a "You can" capability`);
    // No node is named after a specific source/text.
    assert.doesNotMatch(s.title || '', NAMED_SOURCE, `${s.id} title does not name a specific source`);
    assert.doesNotMatch(s.id, NAMED_SOURCE, `${s.id} id does not name a specific source`);
  }
});

test('no skill is orphaned — the graph is one interlocking structure', () => {
  const outdeg = new Map(graph.skills.map((s) => [s.id, 0]));
  for (const s of graph.skills) for (const p of s.prerequisites || []) outdeg.set(p, (outdeg.get(p) || 0) + 1);
  const orphans = graph.skills.filter((s) => (s.prerequisites || []).length === 0 && outdeg.get(s.id) === 0);
  assert.equal(orphans.length, 0, `orphaned skills: ${orphans.map((s) => s.id).join(', ')}`);
});
