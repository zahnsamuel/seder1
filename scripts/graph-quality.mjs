#!/usr/bin/env node
// Adaptive-graph readiness report for the foundation skill graph. This is NOT the structural
// integrity gate (that is scripts/check-foundation-graph.mjs: ids/cycles/reachability/contract).
// This measures how far the v0.1 ontology is from a Math-Academy-style adaptive learning graph —
// the five layers in docs/foundation-graph-schema.md: skill ontology, content graph, assessment
// graph, learner model, sequencing policy. It is a gap tracker, so it prints a scorecard and
// exits 0; the point is to make the vision-status honest and computable, not to pass/fail.
//
//   node scripts/graph-quality.mjs
import { readFileSync } from 'node:fs';

const read = (p) => JSON.parse(readFileSync(new URL(`../${p}`, import.meta.url), 'utf8'));
const graph = read('data/foundation-skill-graph.json');
const contentMap = read('data/foundation-content-map.json');
const academySessions = read('data/jla-academy-sessions.json');
const slice = read('data/jla-foundation-skill-slice.json');
const gradMap = read('data/graduation-skill-map.json').map;

const skills = graph.skills;
const byId = new Map(skills.map((s) => [s.id, s]));
const pct = (n, d) => (d ? Math.round((n / d) * 100) : 0);
const bar = (n, d) => { const p = pct(n, d); const filled = Math.round(p / 10); return `[${'#'.repeat(filled)}${'.'.repeat(10 - filled)}] ${p}%`; };

// --- Edges ---
let edgeTotal = 0, edgesTyped = 0, edgesWithRationale = 0;
for (const s of skills) for (const p of s.prerequisites || []) {
  edgeTotal += 1;
  // A typed edge would be an object { from/type/rationale }; the current graph uses bare id strings.
  if (typeof p === 'object' && p.type) edgesTyped += 1;
  if (typeof p === 'object' && p.rationale) edgesWithRationale += 1;
}

// --- Out-degree (dependents) for hub detection ---
const dependents = new Map(skills.map((s) => [s.id, 0]));
for (const s of skills) for (const p of s.prerequisites || []) if (dependents.has(p)) dependents.set(p, dependents.get(p) + 1);
const HUB = 5;
const hubs = [...dependents.entries()].filter(([, d]) => d > HUB).sort((a, b) => b[1] - a[1]);

// --- Content contexts per skill (step 8: >=3 contexts spanning >=2 source families) ---
const family = (genre) => ({ torah: 'tanakh', mishnah: 'rabbinic', gemara: 'rabbinic', halakha: 'halakhic', tefillah: 'liturgical', thought: 'thought', mussar: 'thought', chassidus: 'thought', history: 'historical' }[genre] || genre);
let ctx3 = 0, ctx2fam = 0;
for (const s of skills) {
  const contexts = s.sourceContexts || [];
  if (contexts.length >= 3) ctx3 += 1;
  if (new Set(contexts.map((c) => family(c.genre))).size >= 2) ctx2fam += 1;
}

// --- Assessment items per skill (step 10: an item bank, not one canonical check) ---
let items3 = 0, items1 = 0;
for (const s of skills) { const n = (s.checks || []).length; if (n >= 3) items3 += 1; if (n >= 1) items1 += 1; }

// Authored assessment items live in jla-academy-sessions.json on the SLICE id space
// (source-family-001…). The graduation-skill map (data/graduation-skill-map.json) links those to
// fnd-* graph skills, so we can now measure how many GRAPH skills have an authored, scorable item.
const authoredSliceSkills = new Set(academySessions.map((a) => a.skillId));
const coveredGraphSkills = new Set();
let linkedGrad = 0, unmappedGrad = 0;
for (const [gradId, entry] of Object.entries(gradMap)) {
  if (entry.graphSkill) { linkedGrad += 1; if (authoredSliceSkills.has(gradId) && byId.has(entry.graphSkill)) coveredGraphSkills.add(entry.graphSkill); }
  else unmappedGrad += 1;
}
const academyForGraphSkill = coveredGraphSkills.size;

// --- Misconception models (step: named misconceptions, not a single repair string) ---
const withRepairString = skills.filter((s) => typeof s.repair === 'string' && s.repair.trim()).length;
const withNamedMisconceptions = skills.filter((s) => Array.isArray(s.misconceptions) && s.misconceptions.length).length;

// --- Transfer language vs authored transfer assessment (step 9) ---
const withTransferString = skills.filter((s) => typeof s.transfer === 'string' && s.transfer.trim()).length;
const withTransferItem = skills.filter((s) => Array.isArray(s.transferItems) && s.transferItems.length).length;
const gradCritical = new Set([...(graph.graduationContract?.requiredSkills || [])]);

// --- Content mapping ---
const mappedSkillIds = new Set(Object.keys(contentMap.bySkill || {}));
const skillsWithContent = skills.filter((s) => mappedSkillIds.has(s.id)).length;

// --- Report ---
const H = (t) => console.log(`\n\x1b[1m${t}\x1b[0m`);
console.log('\x1b[1mFoundation graph — adaptive-readiness report\x1b[0m');
console.log(`graph ${graph.version} · ${skills.length} skills · ${edgeTotal} edges · ${(graph.layers || []).length} layers · ${(graph.genres || []).length} genres`);

H('Layer 1 — Skill ontology (what can be learned)');
console.log(`  skills defined ..................... ${skills.length}   (target for v1: ~150 before ~300)`);
console.log(`  every skill has capability states .. ${graph.masteryScale ? 'yes (emerging/secure/transfer)' : 'no'}`);

H('Edge semantics (step 4 — typed edges + rationale)');
console.log(`  edges typed ........................ ${bar(edgesTyped, edgeTotal)}  (${edgesTyped}/${edgeTotal})`);
console.log(`  edges with pedagogical rationale ... ${bar(edgesWithRationale, edgeTotal)}  (${edgesWithRationale}/${edgeTotal})`);
console.log(`  over-connected hubs (>${HUB} dependents) ${hubs.length ? hubs.map(([id, d]) => `${id}(${d})`).join(', ') : 'none'}`);

H('Layer 2 — Content graph (step 8 — >=3 contexts, >=2 source families)');
console.log(`  skills with >=3 source contexts .... ${bar(ctx3, skills.length)}  (${ctx3}/${skills.length})`);
console.log(`  skills spanning >=2 source families  ${bar(ctx2fam, skills.length)}  (${ctx2fam}/${skills.length})`);
console.log(`  skills with mapped real content .... ${bar(skillsWithContent, skills.length)}  (${skillsWithContent}/${skills.length})`);

H('Layer 3 — Assessment graph (steps 9, 10 — item bank + transfer)');
console.log(`  skills with an authored item bank (>=3) ${bar(items3, skills.length)}  (${items3}/${skills.length})`);
console.log(`  skills with >=1 canonical check .... ${bar(items1, skills.length)}  (${items1}/${skills.length})`);
console.log(`  GRAPH skills with a scorable authored item ${bar(academyForGraphSkill, skills.length)}  (${academyForGraphSkill}/${skills.length}, via the graduation-skill map)`);
console.log(`  graduation skills linked to the graph  ${bar(linkedGrad, linkedGrad + unmappedGrad)}  (${linkedGrad}/${linkedGrad + unmappedGrad}; ${unmappedGrad} unmapped = graph audit/expansion candidates)`);
console.log(`  skills with named misconception models  ${bar(withNamedMisconceptions, skills.length)}  (${withNamedMisconceptions}/${skills.length}; ${withRepairString}/${skills.length} have a single repair string)`);
console.log(`  skills with an authored transfer item .. ${bar(withTransferItem, skills.length)}  (${withTransferItem}/${skills.length}; ${withTransferString}/${skills.length} have transfer language)`);

H('Layers 4-5 — Learner model + sequencing (not in the static graph)');
console.log('  probabilistic knowledge estimates .. none (mastery is a running score in the repository)');
console.log('  item difficulty / discrimination ... none (needs pilot response data)');
console.log('  empirical edge validation .......... none (needs pilot data: do prereqs predict learning?)');
console.log('  explainable next-step (step 13) .... not surfaced (recommendation logic exists; no A->B->C reason shown)');

H('Readiness scorecard (v0.1 -> adaptive graph)');
const layerReady = { 'Skill ontology': 'PROTOTYPE (49/~150)', 'Content graph': `PARTIAL (${ctx2fam}/${skills.length} span >=2 families)`, 'Assessment graph': `EARLY (${items3}/${skills.length} item banks, ${withNamedMisconceptions} misconception models)`, 'Learner model': 'ELEMENTARY (running score, no probabilities)', 'Sequencing policy': 'ELEMENTARY (rules; not explainable/adaptive)' };
for (const [k, v] of Object.entries(layerReady)) console.log(`  ${k.padEnd(18)} ${v}`);
console.log('\nThis is a v0.1 prototype by design. Freeze, formalize (docs/foundation-graph-schema.md),');
console.log('educator-audit, then expand — see the schema doc for the governance sequence.');
