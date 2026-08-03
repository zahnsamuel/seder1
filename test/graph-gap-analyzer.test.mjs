import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const repoRoot = fileURLToPath(new URL('..', import.meta.url));
const graph = JSON.parse(readFileSync(new URL('../data/foundation-skill-graph.json', import.meta.url), 'utf8'));
const graphBefore = readFileSync(new URL('../data/foundation-skill-graph.json', import.meta.url), 'utf8');

execFileSync(process.execPath, ['scripts/graph-gap-analyzer.mjs'], { cwd: repoRoot });
const report = JSON.parse(readFileSync(new URL('../data/graph-gap-report.json', import.meta.url), 'utf8'));

test('the analyzer writes a structured report without touching the graph', () => {
  assert.equal(report.graphVersion, graph.version);
  assert.ok(report.thresholds && report.thresholds.LONG_EDGE_SPAN >= 2);
  assert.equal(report.summary.skills, graph.skills.length);
  assert.ok(Array.isArray(report.findings) && report.findings.length > 0);
  // report-only: the source graph is byte-for-byte unchanged.
  assert.equal(readFileSync(new URL('../data/foundation-skill-graph.json', import.meta.url), 'utf8'), graphBefore);
});

test('findings are a prioritized worklist, most-severe first', () => {
  for (let i = 1; i < report.findings.length; i++) assert.ok(report.findings[i - 1].priority >= report.findings[i].priority, 'sorted by priority desc');
  // Every finding names the skills it concerns and offers a suggestion.
  for (const f of report.findings) {
    assert.ok(f.type && f.detail && f.suggestion, 'each finding is explained');
    assert.ok(Array.isArray(f.skills) && f.skills.every((id) => graph.skills.some((s) => s.id === id)), 'refers to real skills');
  }
});

test('long prerequisite edges are detected and rank above small structural findings', () => {
  const long = report.findings.filter((f) => f.type === 'long-edge');
  assert.ok(long.length > 0, 'the graph has cross-layer prerequisites to flag');
  // The widest jump in the current graph spans several layers — its priority beats a fan-out hub.
  const widest = long[0];
  assert.ok(widest.priority >= report.thresholds.LONG_EDGE_SPAN * 2);
  const hub = report.findings.find((f) => f.type === 'fan-out-hub');
  if (hub) assert.ok(report.findings.indexOf(widest) < report.findings.indexOf(hub), 'a wide jump outranks a hub');
  // The type counts in the summary match the findings.
  assert.equal(report.summary.longEdges, long.length);
});
