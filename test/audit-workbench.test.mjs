import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const repoRoot = fileURLToPath(new URL('..', import.meta.url));
const read = (p) => JSON.parse(readFileSync(new URL(`../${p}`, import.meta.url), 'utf8'));
const graph = read('data/foundation-skill-graph.json');
const edges = read('data/foundation-skill-edges.json').edges.filter((e) => e.type === 'prerequisite');
const gradMap = read('data/graduation-skill-map.json').map;

test('the workbench regenerates and embeds the whole graph for review', () => {
  execFileSync(process.execPath, ['scripts/build-audit-workbench.mjs'], { cwd: repoRoot });
  const html = readFileSync(new URL('../docs/educator-audit-workbench.html', import.meta.url), 'utf8');
  assert.ok(html.startsWith('<!doctype html>'));
  const data = JSON.parse(html.match(/id="graph-data">(.*?)<\/script>/s)[1]);
  // Every skill, every prerequisite edge, and every coverage gap is present to review.
  assert.equal(data.skills.length, graph.skills.length, 'all skills');
  assert.equal(data.edges.length, edges.length, 'all prerequisite edges (each needs a rationale)');
  const unmapped = Object.values(gradMap).filter((m) => !m.graphSkill).length;
  const approximate = Object.values(gradMap).filter((m) => m.graphSkill && m.confidence === 'approximate').length;
  assert.equal(data.unmapped.length, unmapped, 'every unmapped graduation skill surfaces as a gap');
  assert.equal(data.approximate.length, approximate, 'every approximate mapping surfaces for confirmation');
  // It carries what the educator needs to judge each edge and skill.
  for (const e of data.edges) assert.ok(e.fromTitle && e.toTitle && 'weight' in e, 'edges carry titles + a weight to set');
  for (const s of data.skills) assert.ok(s.statement && 'repair' in s, 'skills carry the statement + repair seed');
});

test('the workbench ships self-contained (no external requests) and exports auditable JSON', () => {
  const html = readFileSync(new URL('../docs/educator-audit-workbench.html', import.meta.url), 'utf8');
  assert.doesNotMatch(html, /https?:\/\/[^"']*\.(css|js|woff2?|ttf)/, 'no external stylesheet/script/font');
  assert.doesNotMatch(html, /<link[^>]+href=["']https?:/, 'no external link');
  // Export folds back into the graph: keyed by the same rationale/weight/misconception fields.
  for (const key of ['edgeRationales', 'encompassingWeights', 'misconceptions', 'coverageDecisions']) {
    assert.ok(html.includes(key), `export includes ${key}`);
  }
});
