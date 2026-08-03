#!/usr/bin/env node
// Graph-gap analyzer: turn "scale the graph to a few hundred skills" into a concrete, prioritized
// worklist. Unlike graph-quality.mjs (an aggregate readiness scorecard) and check-foundation-graph.mjs
// (the structural integrity GATE), this hunts for the specific places the graph would grow — where a
// prerequisite jump is wide enough to want an intermediate skill, where a move branches to so many
// dependents it may need an organizing skill, where a skill leans on enough prerequisites to be worth
// decomposing, and where content/assessment coverage is thin. It fabricates nothing: every finding is
// a structural fact about the current graph plus a suggestion for a human to accept or reject. Prints a
// ranked worklist and writes data/graph-gap-report.json. Report-only — always exits 0.
//
//   node scripts/graph-gap-analyzer.mjs   (npm run graph:gaps)
import { readFileSync, writeFileSync } from 'node:fs';

const read = (p) => { try { return JSON.parse(readFileSync(new URL(`../${p}`, import.meta.url), 'utf8')); } catch { return null; } };
const graph = read('data/foundation-skill-graph.json');
const contextLayer = read('data/foundation-content-contexts.json');
const itemLayer = read('data/foundation-assessment-items.json');
const authoredLayer = read('data/foundation-authored-items.json');

// Thresholds — deliberately named so the report explains its own judgments.
const LONG_EDGE_SPAN = 2;   // a prerequisite spanning >= 2 conceptual layers is a candidate jump
const FANOUT_MIN = 5;       // a skill this many moves depend on is a wide branch point
const HIGH_PREREQ_MIN = 3;  // a skill leaning on this many prerequisites may be worth decomposing
const MIN_CONTEXTS = 3, MIN_FAMILIES = 2; // step 8
const ITEM_BANK_TARGET = (authoredLayer && authoredLayer.target) || 3;

const skills = graph.skills;
const byId = new Map(skills.map((s) => [s.id, s]));
const layerOf = (id) => byId.get(id)?.layer;
const titleOf = (id) => byId.get(id)?.title || id;
const layerTitle = (n) => (graph.layers || []).find((l) => l.n === n)?.title || `Layer ${n}`;

// Out-degree (direct dependents) and in-degree.
const dependents = new Map(skills.map((s) => [s.id, []]));
for (const s of skills) for (const p of s.prerequisites || []) dependents.get(p)?.push(s.id);

const findings = [];

// 1. Long prerequisite edges — the primary "insert an intermediate skill" signal.
for (const s of skills) for (const p of s.prerequisites || []) {
  const span = layerOf(s.id) - layerOf(p);
  if (span >= LONG_EDGE_SPAN) {
    findings.push({
      type: 'long-edge', priority: span * 2,
      skills: [p, s.id],
      detail: `${titleOf(p)} (L${layerOf(p)} ${layerTitle(layerOf(p))}) → ${titleOf(s.id)} (L${layerOf(s.id)} ${layerTitle(layerOf(s.id))}) spans ${span} layers`,
      suggestion: span >= 4
        ? 'A large jump — the dependent likely leans on moves that do not yet exist as skills between them; strong candidate for one or more intermediate skills.'
        : 'Consider whether an intermediate skill belongs between these, so the dependent builds on a nearer move.'
    });
  }
}

// 2. Fan-out hubs — a move many others branch from; as the graph scales, the branch may need organizing.
for (const [id, deps] of dependents) {
  if (deps.length >= FANOUT_MIN) {
    findings.push({
      type: 'fan-out-hub', priority: deps.length,
      skills: [id],
      detail: `${titleOf(id)} (L${layerOf(id)}) — ${deps.length} moves depend on it directly`,
      suggestion: 'A wide branch point. As the layer above grows, an organizing intermediate skill (or splitting this one) may keep prerequisites proximate.'
    });
  }
}

// 3. High-prerequisite skills — bundling many prerequisites can hint the skill is doing too much.
for (const s of skills) {
  const n = (s.prerequisites || []).length;
  if (n >= HIGH_PREREQ_MIN) {
    findings.push({
      type: 'high-prereq', priority: n,
      skills: [s.id],
      detail: `${titleOf(s.id)} (L${s.layer}) leans on ${n} prerequisites: ${(s.prerequisites || []).map(titleOf).join(', ')}`,
      suggestion: 'Check whether this is one move or several; a skill that requires this many prerequisites at once is a candidate for decomposition into scaffolded steps.'
    });
  }
}

// 4. Thin content coverage — a skill that cannot be taught/transferred across families yet.
const perSkill = (contextLayer && contextLayer.perSkill) || {};
for (const s of skills) {
  const p = perSkill[s.id] || { contexts: 0, families: 0 };
  if (p.contexts < MIN_CONTEXTS || p.families < MIN_FAMILIES) {
    findings.push({
      type: 'thin-coverage', priority: (MIN_CONTEXTS - Math.min(p.contexts, MIN_CONTEXTS)) + (MIN_FAMILIES - Math.min(p.families, MIN_FAMILIES)) * 2,
      skills: [s.id],
      detail: `${titleOf(s.id)} (L${s.layer}) has ${p.contexts} context(s) across ${p.families} source famil${p.families === 1 ? 'y' : 'ies'} (step 8 wants ≥${MIN_CONTEXTS} / ≥${MIN_FAMILIES})`,
      suggestion: 'Add real sources — ideally from a second family — so the skill can be practised and transferred, not just defined.'
    });
  }
}

findings.sort((a, b) => b.priority - a.priority || a.type.localeCompare(b.type) || a.skills[0].localeCompare(b.skills[0]));

// Coverage gauges (assessment presence combines authored banks + the linked academy items).
const authoredItems = (authoredLayer && authoredLayer.items) || {};
const academyPerSkill = (itemLayer && itemLayer.perGraphSkill) || {};
const itemCount = (id) => (authoredItems[id]?.length || 0) + (academyPerSkill[id] || 0);
const banksComplete = skills.filter((s) => (authoredItems[s.id]?.length || 0) >= ITEM_BANK_TARGET).length;
const withAnyItem = skills.filter((s) => itemCount(s.id) > 0).length;
const step8 = skills.filter((s) => { const p = perSkill[s.id] || { contexts: 0, families: 0 }; return p.contexts >= MIN_CONTEXTS && p.families >= MIN_FAMILIES; }).length;

const layerSizes = {};
for (const s of skills) layerSizes[s.layer] = (layerSizes[s.layer] || 0) + 1;

const byType = (t) => findings.filter((f) => f.type === t).length;
const summary = {
  skills: skills.length, edges: skills.reduce((n, s) => n + (s.prerequisites || []).length, 0), layers: (graph.layers || []).length,
  longEdges: byType('long-edge'), fanOutHubs: byType('fan-out-hub'), highPrereq: byType('high-prereq'), thinCoverage: byType('thin-coverage'),
  step8Coverage: `${step8}/${skills.length}`, authoredItemBanks: `${banksComplete}/${skills.length}`, skillsWithAnyItem: `${withAnyItem}/${skills.length}`,
  scaleNote: `${skills.length} skills now; the schema targets ~150 then ~300. Long edges below are the first places intermediate skills belong.`
};

writeFileSync(new URL('../data/graph-gap-report.json', import.meta.url), `${JSON.stringify({ generatedBy: 'scripts/graph-gap-analyzer.mjs', graphVersion: graph.version, thresholds: { LONG_EDGE_SPAN, FANOUT_MIN, HIGH_PREREQ_MIN, MIN_CONTEXTS, MIN_FAMILIES, ITEM_BANK_TARGET }, summary, findings }, null, 2)}\n`);

// ---- console report ----
const B = (t) => `\x1b[1m${t}\x1b[0m`;
console.log(B('Graph gap analysis — foundation skill graph'));
console.log(`graph ${graph.version} · ${summary.skills} skills · ${summary.edges} edges · ${summary.layers} layers`);
console.log(summary.scaleNote);
console.log(`\nlayer density: ${Object.keys(layerSizes).sort((a, b) => a - b).map((n) => `L${n}:${layerSizes[n]}`).join('  ')}`);
console.log(B('\nCoverage gauges'));
console.log(`  step-8 content (≥${MIN_CONTEXTS} ctx, ≥${MIN_FAMILIES} fam) .. ${summary.step8Coverage}`);
console.log(`  authored item banks (≥${ITEM_BANK_TARGET}) ......... ${summary.authoredItemBanks}  (author via docs/item-authoring-workbench.html · npm run graph:authoring)`);
console.log(`  skills with ≥1 authored/academy item .. ${summary.skillsWithAnyItem}`);
console.log(B(`\nPrioritized worklist — ${findings.length} finding(s): ${summary.longEdges} long edges, ${summary.fanOutHubs} fan-out hubs, ${summary.highPrereq} high-prereq, ${summary.thinCoverage} thin-coverage`));
const shown = findings.slice(0, 20);
for (const f of shown) {
  console.log(`  [${String(f.priority).padStart(2)}] ${f.type.padEnd(13)} ${f.detail}`);
  console.log(`       → ${f.suggestion}`);
}
if (findings.length > shown.length) console.log(`  … and ${findings.length - shown.length} more in data/graph-gap-report.json`);
console.log(`\nWrote data/graph-gap-report.json (${findings.length} findings). Report only — nothing changed. Each finding is a candidate for a human to accept or reject.`);
