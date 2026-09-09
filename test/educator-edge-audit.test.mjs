import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { foldWorkbenchExport } from '../data/audit-fold.mjs';
import {
  authoredFromStub,
  starterAuditInventory,
  starterPrerequisiteEdges,
  starterIdsOf,
  toWorkbenchExport,
  validateEdgeAuditStub,
  edgeKey,
  STUB_KIND,
  WORKBENCH_EXPORT
} from '../data/edge-audit.mjs';

const read = (p) => JSON.parse(readFileSync(new URL(`../${p}`, import.meta.url), 'utf8'));
const text = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');

const graph = read('data/foundation-skill-graph.json');
const starterSet = read('data/foundation-starter-set.json');
const edgeLayer = read('data/foundation-skill-edges.json');
const stub = read('data/foundation-edge-audit.json');
const skillIds = new Set(graph.skills.map((s) => s.id));
const starterIds = starterIdsOf(starterSet);
const edgeKeys = new Set(
  starterPrerequisiteEdges(starterIds, edgeLayer).map((e) => edgeKey(e.from, e.to))
);

test('the fillable stub matches the schema and the live graph version', () => {
  const errors = validateEdgeAuditStub(stub, { graphVersion: graph.version, skillIds, edgeKeys });
  assert.deepEqual(errors, []);
  assert.equal(stub.kind, STUB_KIND);
  assert.equal(stub.scope, 'starter-set');
  assert.ok(stub.schema.edgeRationale.rationale);
  assert.ok(stub.schema.misconception.description);
  assert.ok(stub.schema.misconception.signal);
});

test('the stub does not invent pedagogical content for real fnd- skills', () => {
  assert.equal(stub.edgeRationales.length, 0, 'no authored rationales until an educator writes them');
  assert.equal(stub.misconceptions.length, 0, 'no authored misconceptions until an educator writes them');
  const authored = authoredFromStub(stub);
  assert.equal(Object.keys(authored.edgeRationales).length, 0);
  assert.equal(Object.keys(authored.misconceptions).length, 0);
});

test('the 1–2 stub examples are labeled EXAMPLE and stay off the real graph', () => {
  assert.ok(stub.examples.length >= 1 && stub.examples.length <= 2);
  for (const ex of stub.examples) {
    assert.equal(ex.example, true);
    assert.match(JSON.stringify(ex), /EXAMPLE ONLY/);
    for (const id of [ex.from, ex.to, ex.skill].filter(Boolean)) {
      assert.ok(String(id).startsWith('example-'), `${id} must be an example-* id`);
      assert.ok(!skillIds.has(id), `${id} must not be a real skill`);
      assert.ok(!String(id).startsWith('fnd-'));
    }
    if (ex.id) {
      assert.match(String(ex.id), /example-/);
      assert.ok(!skillIds.has(ex.id));
      assert.ok(!String(ex.id).startsWith('fnd-'));
    }
  }
});

test('the starter inventory is the frozen 29 skills and their closed prerequisite edges', () => {
  const inv = starterAuditInventory(graph, starterSet, edgeLayer);
  assert.equal(inv.graphVersion, graph.version);
  assert.equal(inv.skills.length, 29);
  assert.equal(inv.edges.length, 38);
  assert.equal(inv.counts.misconceptions, 29);
  for (const e of inv.edges) {
    assert.ok(starterIds.has(e.from) && starterIds.has(e.to), `${e.id} must stay inside the starter set`);
    assert.equal(e.rationale, null, 'live edges stay honestly empty');
  }
  const listed = new Set(inv.skills.map((s) => s.id));
  for (const id of starterIds) assert.ok(listed.has(id), `${id} is on the workbench`);
});

test('a filled stub (not examples) exports in the existing workbench import shape', () => {
  const sampleEdge = [...edgeKeys][0];
  const [from, to] = sampleEdge.split('::');
  const filled = {
    ...stub,
    edgeRationales: [{ from, to, rationale: 'Educator-written reason this edge holds.' }],
    misconceptions: [{ skill: to, description: 'Named wrong reading', signal: 'Observable move' }]
  };
  assert.deepEqual(validateEdgeAuditStub(filled, { graphVersion: graph.version, skillIds, edgeKeys }), []);
  const exp = toWorkbenchExport(filled, { graphVersion: graph.version, exportedAt: '2026-09-08T00:00:00.000Z' });
  assert.equal(exp.workbench, WORKBENCH_EXPORT);
  assert.equal(exp.edgeRationales[sampleEdge], 'Educator-written reason this edge holds.');
  assert.deepEqual(exp.misconceptions[to], { description: 'Named wrong reading', signal: 'Observable move' });
  const { errors, audit } = foldWorkbenchExport({
    export: exp, graphVersion: graph.version, edgeKeys: new Set(edgeLayer.edges.filter((e) => e.type === 'prerequisite').map((e) => `${e.from}::${e.to}`)), skillIds, gradIds: new Set(['x'])
  });
  assert.deepEqual(errors, []);
  assert.equal(audit.edgeRationales[sampleEdge], 'Educator-written reason this edge holds.');
});

test('examples in the stub are skipped by the import-shaped export', () => {
  const exp = toWorkbenchExport(stub, { graphVersion: graph.version });
  assert.deepEqual(exp.edgeRationales, {});
  assert.deepEqual(exp.misconceptions, {});
});

test('validateEdgeAuditStub refuses unlabeled examples on real skills', () => {
  const sampleEdge = [...edgeKeys][0];
  const [from, to] = sampleEdge.split('::');
  const bad = {
    ...stub,
    examples: [{ example: true, from, to, rationale: 'EXAMPLE ONLY' }]
  };
  const errors = validateEdgeAuditStub(bad, { graphVersion: graph.version, skillIds, edgeKeys });
  assert.ok(errors.some((e) => e.includes(from) || e.includes('fnd-')));
});

test('the workbench page is an internal educator surface listing starter skills and the stub', () => {
  const html = text('educator-edge-audit.html');
  const js = text('educator-edge-audit.js');
  assert.match(html, /NOT LEARNER-FACING/);
  assert.match(html, /noindex/);
  assert.match(html, /data\/foundation-edge-audit\.json/);
  assert.match(html, /analytics\.html/);
  assert.doesNotMatch(html, /jla-shell/);
  assert.doesNotMatch(html, /daily-router\.html/);
  assert.doesNotMatch(js, /daily-router\.html/);
  for (const file of [
    'data/foundation-starter-set.json',
    'data/foundation-skill-graph.json',
    'data/foundation-skill-edges.json',
    'data/foundation-edge-audit.json'
  ]) {
    assert.match(js, new RegExp(file.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
  assert.match(js, /workbench: 'jla-educator-audit'/);
  assert.match(js, /EXAMPLE/);
  // The page must not ship invented rationales for real skills — empty placeholders only.
  assert.match(js, /Leave blank until an educator/);
  assert.doesNotMatch(js, /fnd-decode-letters::fnd-decode-vowels/);
});

test('analytics links to the starter edge-audit workbench', () => {
  const html = text('analytics.html');
  assert.match(html, /educator-edge-audit\.html/);
  assert.match(html, /Educator graph tools/);
});
