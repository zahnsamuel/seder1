import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { foldWorkbenchExport } from '../data/audit-fold.mjs';

const read = (p) => JSON.parse(readFileSync(new URL(`../${p}`, import.meta.url), 'utf8'));
const graph = read('data/foundation-skill-graph.json');
const edgeLayer = read('data/foundation-skill-edges.json');
const edgeKeys = new Set(edgeLayer.edges.filter((e) => e.type === 'prerequisite').map((e) => `${e.from}::${e.to}`));
const skillIds = new Set(graph.skills.map((s) => s.id));
const gradIds = new Set(Object.keys(read('data/graduation-skill-map.json').map));
const anEdge = [...edgeKeys][0];
const [, aSkill] = anEdge.split('::');
const aGrad = [...gradIds][0];
const base = { workbench: 'jla-educator-audit', graphVersion: graph.version };

test('a valid export folds in, keyed to the real graph', () => {
  const { errors, audit, report } = foldWorkbenchExport({
    export: { ...base, edgeRationales: { [anEdge]: 'because X precedes Y' }, encompassingWeights: { [anEdge]: 0.6 }, misconceptions: { [aSkill]: { description: 'wrong reading', signal: 'does the wrong thing' } }, coverageDecisions: { [aGrad]: 'new skill: …' } },
    graphVersion: graph.version, edgeKeys, skillIds, gradIds
  });
  assert.deepEqual(errors, []);
  assert.equal(audit.edgeRationales[anEdge], 'because X precedes Y');
  assert.equal(audit.encompassingWeights[anEdge], 0.6);
  assert.deepEqual(audit.misconceptions[aSkill], { description: 'wrong reading', signal: 'does the wrong thing' });
  assert.equal(report.added.edgeRationales, 1);
});

test('a stale or wrong export is refused, not silently accepted', () => {
  assert.ok(foldWorkbenchExport({ export: { workbench: 'nope' }, graphVersion: graph.version, edgeKeys, skillIds, gradIds }).errors.length);
  assert.ok(foldWorkbenchExport({ export: { ...base, graphVersion: '9.9.9' }, graphVersion: graph.version, edgeKeys, skillIds, gradIds }).errors.length);
});

test('entries that do not match the current graph are skipped, never injected', () => {
  const { audit, report } = foldWorkbenchExport({
    export: { ...base,
      edgeRationales: { 'ghost-a::ghost-b': 'edge does not exist' },
      encompassingWeights: { [anEdge]: 5 },                       // out of [0,1]
      misconceptions: { [aSkill]: { description: 'only half' } }, // missing signal
      coverageDecisions: { 'not-a-grad-id': 'x' } },
    graphVersion: graph.version, edgeKeys, skillIds, gradIds
  });
  assert.equal(Object.keys(audit.edgeRationales).length, 0);
  assert.equal(Object.keys(audit.encompassingWeights).length, 0);
  assert.equal(Object.keys(audit.misconceptions).length, 0);
  assert.equal(Object.keys(audit.coverageDecisions).length, 0);
  assert.ok(report.skipped.edgeRationales.includes('ghost-a::ghost-b'));
});

test('multiple educators merge; later entries win per key', () => {
  const first = foldWorkbenchExport({ export: { ...base, edgeRationales: { [anEdge]: 'first take' } }, graphVersion: graph.version, edgeKeys, skillIds, gradIds }).audit;
  const merged = foldWorkbenchExport({ export: { ...base, edgeRationales: { [anEdge]: 'second, sharper take' } }, graphVersion: graph.version, edgeKeys, skillIds, gradIds, existing: first }).audit;
  assert.equal(merged.edgeRationales[anEdge], 'second, sharper take');
  assert.equal(merged.sources.length, 2, 'both imports are recorded');
});

test('with no audit imported, the graph is honestly bare — nothing fabricated', () => {
  // prerequisite rationales all null, encompassing weights pending-expert, misconception layer empty.
  for (const e of edgeLayer.edges.filter((e) => e.type === 'prerequisite')) {
    assert.equal(e.rationale, null);
    assert.equal(e.encompassing.status, 'pending-expert');
  }
  assert.deepEqual(edgeLayer.auditApplied, { rationales: 0, encompassingWeights: 0 });
  assert.equal(read('data/foundation-misconceptions.json').misconceptions.length, 0);
});

test('the generators read the audit store (round-trip wiring)', () => {
  const edges = readFileSync(new URL('../scripts/build-skill-edges.mjs', import.meta.url), 'utf8');
  const mis = readFileSync(new URL('../scripts/build-misconceptions.mjs', import.meta.url), 'utf8');
  assert.match(edges, /foundation-audit\.json/);
  assert.match(edges, /auditRationales\[key\]/);
  assert.match(mis, /foundation-audit\.json/);
});
