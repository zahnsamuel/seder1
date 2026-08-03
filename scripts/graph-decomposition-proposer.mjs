#!/usr/bin/env node
// Decomposition proposer: take the graph-gap analyzer's long prerequisite edges and draft, for each,
// how to close the jump — as PROPOSALS a human accepts or rejects, never applied. Two honest kinds:
//
//   redundant-edge      The dependent still reaches the prerequisite through another path, so the
//                       direct long edge carries no reachability — dropping it removes the jump and
//                       loses no prerequisite. Fully verifiable; no new content.
//   insert-intermediate No alternative path exists, so the jump is a genuine dependency that wants a
//                       skill between its ends. Proposes a skill STUB at the midpoint layer with the
//                       rewiring worked out — but every pedagogical field (title, statement, teaching
//                       move, checks) is left null with authoring guidance drawn from the two ends'
//                       own knowledge points. It structures the decomposition; it does not invent the
//                       skill. A wide jump may want several intermediates — re-run on the result.
//
// Report only: writes data/graph-decomposition-proposals.json and prints a summary. The graph is never
// touched — accepting a proposal means a human editing the frozen graph (or a future apply step).
//
//   node scripts/graph-decomposition-proposer.mjs [--span N] [--edge fromId::toId]   (npm run graph:decompose)
import { readFileSync, writeFileSync } from 'node:fs';

const read = (p) => { try { return JSON.parse(readFileSync(new URL(`../${p}`, import.meta.url), 'utf8')); } catch { return null; } };
const graph = read('data/foundation-skill-graph.json');
const kpLayer = read('data/foundation-knowledge-points.json');
const ctxLayer = read('data/foundation-content-contexts.json');

const args = process.argv.slice(2);
const getArg = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : null; };
const targetEdge = getArg('--edge');
const spanThreshold = Number(getArg('--span')) || 3;

const skills = graph.skills;
const byId = new Map(skills.map((s) => [s.id, s]));
const layerOf = (id) => byId.get(id)?.layer;
const titleOf = (id) => byId.get(id)?.title || id;
const layerTitle = (n) => (graph.layers || []).find((l) => l.n === n)?.title || `Layer ${n}`;

const dependents = new Map(skills.map((s) => [s.id, []]));
for (const s of skills) for (const p of s.prerequisites || []) dependents.get(p)?.push(s.id);

// Does `to` still transitively depend on `from` if the direct from→to edge is removed?
function altPath(from, to) {
  const queue = (dependents.get(from) || []).filter((x) => x !== to);
  const seen = new Set(queue);
  while (queue.length) {
    const cur = queue.shift();
    if (cur === to) return true;
    for (const d of dependents.get(cur) || []) if (!seen.has(d)) { seen.add(d); queue.push(d); }
  }
  return false;
}

const kpsBySkill = new Map();
for (const kp of (kpLayer && kpLayer.knowledgePoints) || []) {
  const entry = kpsBySkill.get(kp.skill) || {};
  entry[kp.kind] = kp.statement;
  kpsBySkill.set(kp.skill, entry);
}

const familiesOf = new Map();
for (const c of (ctxLayer && ctxLayer.contexts) || []) {
  const set = familiesOf.get(c.skill) || new Set();
  if (c.family) set.add(c.family);
  familiesOf.set(c.skill, set);
}
function suggestFamilies(from, to) {
  const a = familiesOf.get(from) || new Set();
  const b = familiesOf.get(to) || new Set();
  const shared = [...a].filter((f) => b.has(f));
  return shared.length ? shared : [...new Set([...a, ...b])];
}

const edgeMeta = (from, to, span) => ({ from, fromTitle: titleOf(from), fromLayer: layerOf(from), to, toTitle: titleOf(to), toLayer: layerOf(to), span });

function propose(from, to) {
  const span = layerOf(to) - layerOf(from);
  const edge = edgeMeta(from, to, span);
  if (altPath(from, to)) {
    return {
      kind: 'redundant-edge', edge, altPath: true,
      rationale: `${titleOf(to)} still reaches ${titleOf(from)} through another path, so the direct ${span}-layer edge carries no reachability. Removing it closes the jump without losing any prerequisite.`,
      graphEdits: { removeEdges: [{ from, to }] }
    };
  }
  const proposedLayer = Math.floor((layerOf(from) + layerOf(to)) / 2);
  const fromKp = kpsBySkill.get(from) || {};
  const toKp = kpsBySkill.get(to) || {};
  const slug = (layerTitle(proposedLayer).split(/\s+/)[0] || 'skill').toLowerCase().replace(/[^a-z]/g, '');
  const idHint = `fnd-${slug}-<name>`;
  return {
    kind: 'insert-intermediate', edge,
    status: 'draft-needs-authoring',
    proposedLayer, proposedLayerTitle: layerTitle(proposedLayer), idHint,
    // The two ends, quoted — the missing skill lives in the gap between what `from` produces and what
    // `to` assumes. Nothing here is invented; it is what an author needs to name the move.
    bridges: {
      from: { id: from, title: titleOf(from), statement: byId.get(from)?.statement || null, transferKp: fromKp.transfer || null },
      to: { id: to, title: titleOf(to), statement: byId.get(to)?.statement || null, introduceKp: toKp.introduce || null }
    },
    authoringGuidance: `Name the single reading move a learner needs after "${byId.get(from)?.statement || titleOf(from)}" to be ready for "${byId.get(to)?.statement || titleOf(to)}"${toKp.introduce ? ` — which begins by "${toKp.introduce}"` : ''}. If the jump is genuinely one move, reject this and keep the direct edge.`,
    suggestedFamilies: suggestFamilies(from, to),
    // The exact rewiring, with the skill left a stub — no pedagogical content asserted.
    graphEdits: {
      addSkill: { id: idHint, layer: proposedLayer, title: null, statement: null, teachingMove: null, checks: [], sourceContexts: [], prerequisites: [from], _draft: true },
      addEdges: [{ from, to: idHint }, { from: idHint, to }],
      removeEdges: [{ from, to }]
    },
    note: span >= 5 ? `A ${span}-layer jump may need more than one intermediate; this proposes one at layer ${proposedLayer}. After authoring it, re-run to decompose the two shorter edges it leaves.` : null
  };
}

// Gather target edges.
const targets = [];
for (const s of skills) for (const p of s.prerequisites || []) {
  const span = layerOf(s.id) - layerOf(p);
  if (targetEdge) { if (`${p}::${s.id}` === targetEdge) targets.push([p, s.id]); }
  else if (span >= spanThreshold) targets.push([p, s.id]);
}
targets.sort((a, b) => (layerOf(b[1]) - layerOf(b[0])) - (layerOf(a[1]) - layerOf(a[0])));

if (targetEdge && !targets.length) {
  console.error(`No prerequisite edge "${targetEdge}" in the graph. Use fromId::toId (see npm run graph:gaps).`);
  process.exit(0);
}

const proposals = targets.map(([from, to]) => propose(from, to));
const redundant = proposals.filter((p) => p.kind === 'redundant-edge').length;
const inserts = proposals.filter((p) => p.kind === 'insert-intermediate').length;

writeFileSync(new URL('../data/graph-decomposition-proposals.json', import.meta.url),
  `${JSON.stringify({ generatedBy: 'scripts/graph-decomposition-proposer.mjs', graphVersion: graph.version, params: { spanThreshold, edge: targetEdge || null }, summary: { targeted: proposals.length, redundantEdges: redundant, insertIntermediate: inserts }, proposals }, null, 2)}\n`);

const B = (t) => `\x1b[1m${t}\x1b[0m`;
console.log(B('Decomposition proposals — foundation skill graph'));
console.log(`graph ${graph.version} · targeting ${proposals.length} edge(s) spanning ≥${spanThreshold} layers${targetEdge ? ` (edge ${targetEdge})` : ''}`);
console.log(`${redundant} redundant edge(s) to drop · ${inserts} intermediate skill(s) to author\n`);
for (const p of proposals) {
  if (p.kind === 'redundant-edge') {
    console.log(`  ${B('DROP')} ${p.edge.fromTitle} (L${p.edge.fromLayer}) → ${p.edge.toTitle} (L${p.edge.toLayer}), span ${p.edge.span}`);
    console.log(`       ${p.rationale}`);
  } else {
    console.log(`  ${B('INSERT')} between ${p.edge.fromTitle} (L${p.edge.fromLayer}) → ${p.edge.toTitle} (L${p.edge.toLayer}), span ${p.edge.span}`);
    console.log(`       new skill at L${p.proposedLayer} (${p.proposedLayerTitle}) · families: ${p.suggestedFamilies.join(', ') || '—'}`);
    console.log(`       author: ${p.authoringGuidance}`);
  }
}
console.log(`\nWrote data/graph-decomposition-proposals.json. Proposals only — the graph is unchanged. Accept one by authoring the stub and rewiring; reject if the jump is truly one move.`);
