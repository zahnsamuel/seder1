// Integrity + coverage checker for data/foundation-skill-graph.json — the capability-first
// foundational skill graph for Seder · The Jewish Learning Academy.
//
// Run: node scripts/check-foundation-graph.mjs
// Exits non-zero on any structural error so it can gate CI / preflight. Prints a coverage
// report (skills per layer, roots, graduation-eligible leaves, canon-genre breadth) either way.
//
// This is the safety rail that lets Claude and Codex extend the graph without breaking it:
// unique IDs, resolvable prerequisites, no cycles, full reachability, layer discipline
// (a prerequisite may reach back several layers but must never sit in a higher layer than
// its dependent), and a complete
// teaching contract on every skill (>=2 source contexts, a check, a transfer, a repair,
// a graduation threshold, a durability tier).

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const graph = JSON.parse(readFileSync(resolve(root, 'data/foundation-skill-graph.json'), 'utf8'));

const errors = [];
const warnings = [];
const err = (m) => errors.push(m);
const warn = (m) => warnings.push(m);

const skills = graph.skills ?? [];
const byId = new Map();
const validLayers = new Set((graph.layers ?? []).map((l) => l.n));
const validGenres = new Set(graph.genres ?? []);
const validTiers = new Set(Object.keys(graph.durabilityTiers ?? {}));
const validThresholds = new Set(Object.keys(graph.masteryScale ?? {}));

// --- per-skill shape + teaching contract ---
for (const s of skills) {
  if (!s.id) { err(`skill with no id: ${JSON.stringify(s).slice(0, 80)}`); continue; }
  if (byId.has(s.id)) err(`duplicate id: ${s.id}`);
  byId.set(s.id, s);

  if (!/^fnd-/.test(s.id)) err(`${s.id}: foundational skill ids must be prefixed 'fnd-' (kept separate from content ids)`);
  if (!validLayers.has(s.layer)) err(`${s.id}: layer ${s.layer} is not a declared layer`);
  if (!s.title) err(`${s.id}: missing title`);
  if (!s.statement) err(`${s.id}: missing learner-facing statement`);
  if (!Array.isArray(s.prerequisites)) err(`${s.id}: prerequisites must be an array`);
  if (!s.teachingMove) err(`${s.id}: missing teachingMove`);
  if (!Array.isArray(s.checks) || s.checks.length < 1) err(`${s.id}: needs at least one check`);
  if (!s.transfer) err(`${s.id}: missing transfer check`);
  if (!s.repair) err(`${s.id}: missing repair path`);
  if (!validThresholds.has(s.graduationThreshold)) err(`${s.id}: graduationThreshold '${s.graduationThreshold}' not in masteryScale`);
  if (!validTiers.has(s.durability)) err(`${s.id}: durability '${s.durability}' not a declared tier`);

  const contexts = s.sourceContexts ?? [];
  if (contexts.length < 2) err(`${s.id}: needs >=2 source contexts (has ${contexts.length}) — a skill must be teachable in more than one place`);
  for (const c of contexts) {
    if (!c.ref) err(`${s.id}: a source context is missing a ref`);
    if (!validGenres.has(c.genre)) err(`${s.id}: source context genre '${c.genre}' not in declared genres`);
  }
  const genres = new Set(contexts.map((c) => c.genre));
  if (genres.size < 2) warn(`${s.id}: all source contexts are one genre (${[...genres][0]}) — transfer is stronger when a skill spans genres`);
}

// --- prerequisite resolution, layer discipline, cycles, reachability ---
for (const s of skills) {
  for (const p of s.prerequisites ?? []) {
    const dep = byId.get(p);
    if (!dep) { err(`${s.id}: prerequisite '${p}' does not resolve`); continue; }
    // Layers are thematic groupings, not strict rungs: a later capability may legitimately
    // reach back several layers (argument tracking builds on text signals). The only hard
    // rule is that a skill must never depend on a *higher* layer than itself.
    if (dep.layer > s.layer) err(`${s.id} (layer ${s.layer}) depends on ${p} (layer ${dep.layer}) — a skill may not depend on a higher layer`);
  }
}

// cycle detection (DFS)
const WHITE = 0, GRAY = 1, BLACK = 2;
const color = new Map(skills.map((s) => [s.id, WHITE]));
const stack = [];
const visit = (id) => {
  color.set(id, GRAY); stack.push(id);
  for (const p of byId.get(id)?.prerequisites ?? []) {
    if (!byId.has(p)) continue;
    if (color.get(p) === GRAY) err(`cycle detected: ${[...stack.slice(stack.indexOf(p)), p].join(' -> ')}`);
    else if (color.get(p) === WHITE) visit(p);
  }
  color.set(id, BLACK); stack.pop();
};
for (const s of skills) if (color.get(s.id) === WHITE) visit(s.id);

// reachability from roots (skills with no prerequisites)
const roots = skills.filter((s) => (s.prerequisites ?? []).length === 0);
if (roots.length === 0) err('no root skills (every skill has a prerequisite — the graph has no entry point)');
const dependents = new Map();
for (const s of skills) for (const p of s.prerequisites ?? []) {
  if (!dependents.has(p)) dependents.set(p, []);
  dependents.get(p).push(s.id);
}
const reachable = new Set();
const queue = roots.map((s) => s.id);
while (queue.length) {
  const id = queue.shift();
  if (reachable.has(id)) continue;
  reachable.add(id);
  for (const d of dependents.get(id) ?? []) queue.push(d);
}
for (const s of skills) if (!reachable.has(s.id)) err(`${s.id}: unreachable from any root skill`);

// graduation contract sanity
for (const req of graph.graduationContract?.requiredSkills ?? []) {
  if (!byId.has(req)) err(`graduationContract requires '${req}', which is not a skill`);
}

// --- report ---
const line = (s) => console.log(s);
line('\nSeder · Foundational Skill Graph — coverage report');
line('='.repeat(52));
line(`version ${graph.version}   skills ${skills.length}   layers ${validLayers.size}   genres ${validGenres.size}`);
line('');
for (const l of graph.layers ?? []) {
  const inLayer = skills.filter((s) => s.layer === l.n);
  line(`  L${l.n} ${l.title.padEnd(24)} ${String(inLayer.length).padStart(2)} skills`);
}
line('');
line(`  roots (entry skills):        ${roots.map((s) => s.id).join(', ')}`);
const leaves = skills.filter((s) => !(dependents.get(s.id)?.length));
line(`  leaves (nothing depends on): ${leaves.map((s) => s.id).join(', ')}`);
const gradReq = graph.graduationContract?.requiredSkills ?? [];
line(`  graduation-required skills:  ${gradReq.join(', ')}`);
line('');
const genreCount = new Map([...validGenres].map((g) => [g, 0]));
for (const s of skills) for (const g of new Set((s.sourceContexts ?? []).map((c) => c.genre))) genreCount.set(g, (genreCount.get(g) ?? 0) + 1);
line('  canon-genre reach (skills that touch each genre):');
for (const [g, n] of [...genreCount].sort((a, b) => b[1] - a[1])) line(`    ${g.padEnd(12)} ${n}`);

line('');
if (warnings.length) { line(`WARNINGS (${warnings.length}):`); for (const w of warnings) line('  ! ' + w); line(''); }
if (errors.length) {
  line(`FAILED with ${errors.length} error(s):`);
  for (const e of errors) line('  x ' + e);
  process.exit(1);
}
line(`OK — graph is structurally sound (${warnings.length} warning(s)).`);
