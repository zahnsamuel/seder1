#!/usr/bin/env node
// Skill-shape gate for the foundation knowledge graph.
//
// JLA's graph must be SKILL-based (Math-Academy style: each node a discrete learnable move with
// prerequisites), NOT content-based (Yochai's corpus graph answers "where is this text?"; the app
// calls it via search_corpus — that is the content layer, a different job). As the ontology scales
// toward a few hundred skills, the failure mode is drift: nodes that name a source, tractate, or
// topic ("Berakhot 2a", "the Oven of Akhnai") instead of a capability ("you can separate a question
// from its answer"). This gate makes that drift a hard error, and reports the interlocking density
// that a Math-Academy-style graph depends on.
//
//   node scripts/check-skill-shaped.mjs   (npm run graph:skills)
import { readFileSync } from 'node:fs';

const graph = JSON.parse(readFileSync(new URL('../data/foundation-skill-graph.json', import.meta.url), 'utf8'));
const skills = graph.skills;

// A specific source/text named in a node's TITLE is the tell of a content node. Generic genre words
// are fine in statements ("a Gemara debate"); a title built around a named source is not a skill.
const NAMED_SOURCE = /\b(berakhot|shabbat|eruvin|pesachim|sukkah|yoma|bava|ketubot|sanhedrin|chullin|niddah|nedarim|nazir|megillah|taanit|chagigah|zevachim|arakhin|genesis|exodus|leviticus|numbers|deuteronomy|psalms?|rashi|akhnai|\d+[ab]\b)/i;

const problems = [];
for (const s of skills) {
  // 1. Every node is a capability: its statement describes what the LEARNER can do.
  if (!/^you can\b/i.test((s.statement || '').trim())) {
    problems.push(`${s.id}: statement is not a "You can …" capability ("${(s.statement || '').slice(0, 50)}…")`);
  }
  // 2. No node is named after a specific source (that would be a content node, not a skill).
  if (NAMED_SOURCE.test(s.title || '')) {
    problems.push(`${s.id}: title names a specific source — content-shaped, not skill-shaped ("${s.title}")`);
  }
  if (NAMED_SOURCE.test(s.id)) {
    problems.push(`${s.id}: id names a specific source — content-shaped`);
  }
}

// --- Interlocking metrics (informational): a skill graph earns its adaptivity from density ---
const outdeg = new Map(skills.map((s) => [s.id, 0]));
let edges = 0;
for (const s of skills) for (const p of s.prerequisites || []) { edges += 1; outdeg.set(p, (outdeg.get(p) || 0) + 1); }
const roots = skills.filter((s) => (s.prerequisites || []).length === 0);
const leaves = skills.filter((s) => outdeg.get(s.id) === 0);
const orphans = skills.filter((s) => (s.prerequisites || []).length === 0 && outdeg.get(s.id) === 0);

console.log('\x1b[1mSkill-shape gate\x1b[0m');
console.log(`  skills ................ ${skills.length}`);
console.log(`  every node a capability (§skill-based) ${problems.length ? '\x1b[31mNO\x1b[0m' : '\x1b[32myes\x1b[0m'}  (${skills.length - new Set(problems.map((p) => p.split(':')[0])).size}/${skills.length} clean)`);
console.log('\n\x1b[1mInterlocking density (toward a Math-Academy-style graph)\x1b[0m');
console.log(`  edges ................. ${edges}   (${(edges / skills.length).toFixed(2)} per skill)`);
console.log(`  roots (no prerequisite) ${roots.length}${roots.length ? `  (${roots.map((s) => s.id).join(', ')})` : ''}`);
console.log(`  leaves (nothing depends on them) ${leaves.length}`);
console.log(`  orphans (isolated) .... ${orphans.length}${orphans.length ? `  \x1b[31m${orphans.map((s) => s.id).join(', ')}\x1b[0m` : ''}`);

if (problems.length) {
  console.error('\n\x1b[31mSkill-shape violations (the graph is drifting content-ward):\x1b[0m');
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}
console.log('\n\x1b[32mAll nodes are skill-shaped.\x1b[0m Keep it this way as the graph scales — content lives in Yochai / the content map, not in a skill node.');
