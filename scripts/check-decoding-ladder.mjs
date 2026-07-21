// Integrity + coverage checker for data/hebrew-decoding-ladder.json — the pre-Layer-1 Hebrew
// decoding ladder for Seder · The Jewish Learning Academy.
//
// Run: node scripts/check-decoding-ladder.mjs
// Exits non-zero on any structural error so it can gate CI / preflight. Prints a coverage report
// (skills per band, roots, leaves, graduation-required) either way.
//
// It is the sibling of check-foundation-graph.mjs, with two deliberate differences: skills sit in
// ordered BANDS (0.1 < 0.2 < 0.3 …) instead of layers, and there is NO source-context / canon-genre
// requirement — decoding is genre-less phonics (a letter has no Sefaria ref), which is exactly why
// this ladder is a separate dataset. Everything else — unique ids, resolvable prerequisites, no
// dependency on a higher band, no cycles, full reachability, a complete teaching contract — is
// enforced the same way.

import { readFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, resolve } from 'node:path';

export function validateLadder(ladder) {
  const errors = [];
  const warnings = [];
  const err = (m) => errors.push(m);

  const skills = ladder.skills ?? [];
  const byId = new Map();
  const bandOrder = new Map((ladder.bands ?? []).map((b) => [b.id, b.n]));
  const validTiers = new Set(Object.keys(ladder.durabilityTiers ?? {}));
  const validThresholds = new Set(Object.keys(ladder.masteryScale ?? {}));

  // --- per-skill shape + teaching contract ---
  for (const s of skills) {
    if (!s.id) { err(`skill with no id: ${JSON.stringify(s).slice(0, 80)}`); continue; }
    if (byId.has(s.id)) err(`duplicate id: ${s.id}`);
    byId.set(s.id, s);

    if (!/^dec-/.test(s.id)) err(`${s.id}: decoding skill ids must be prefixed 'dec-' (kept separate from fnd-/content ids)`);
    if (!bandOrder.has(s.band)) err(`${s.id}: band '${s.band}' is not a declared band`);
    if (!s.title) err(`${s.id}: missing title`);
    if (!s.statement) err(`${s.id}: missing learner-facing statement`);
    if (!Array.isArray(s.prerequisites)) err(`${s.id}: prerequisites must be an array`);
    if (!s.teachingMove) err(`${s.id}: missing teachingMove`);
    if (!Array.isArray(s.checks) || s.checks.length < 1) err(`${s.id}: needs at least one check`);
    if (!s.transfer) err(`${s.id}: missing transfer check`);
    if (!s.repair) err(`${s.id}: missing repair path`);
    if (!validThresholds.has(s.graduationThreshold)) err(`${s.id}: graduationThreshold '${s.graduationThreshold}' not in masteryScale`);
    if (!validTiers.has(s.durability)) err(`${s.id}: durability '${s.durability}' not a declared tier`);
  }

  // --- prerequisite resolution + band discipline (never depend on a higher band) ---
  for (const s of skills) {
    for (const p of s.prerequisites ?? []) {
      const dep = byId.get(p);
      if (!dep) { err(`${s.id}: prerequisite '${p}' does not resolve`); continue; }
      const sn = bandOrder.get(s.band), pn = bandOrder.get(dep.band);
      if (sn != null && pn != null && pn > sn) err(`${s.id} (band ${s.band}) depends on ${p} (band ${dep.band}) — a skill may not depend on a higher band`);
    }
  }

  // --- cycle detection (DFS) ---
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

  // --- reachability from roots (skills with no prerequisites) ---
  const roots = skills.filter((s) => (s.prerequisites ?? []).length === 0);
  if (roots.length === 0) err('no root skills (every skill has a prerequisite — the ladder has no entry point)');
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

  // --- graduation contract sanity ---
  for (const req of ladder.graduationContract?.requiredSkills ?? []) {
    if (!byId.has(req)) err(`graduationContract requires '${req}', which is not a skill`);
  }

  return { errors, warnings, skills, roots, dependents, bandOrder };
}

// --- CLI ---
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  const ladder = JSON.parse(readFileSync(resolve(root, 'data/hebrew-decoding-ladder.json'), 'utf8'));
  const { errors, warnings, skills, roots, dependents } = validateLadder(ladder);
  const line = (s) => console.log(s);
  line('\nSeder · Hebrew Decoding Ladder — coverage report');
  line('='.repeat(50));
  line(`version ${ladder.version}   skills ${skills.length}   bands ${(ladder.bands ?? []).length}   pronunciation ${ladder.pronunciation}`);
  line('');
  for (const b of ladder.bands ?? []) {
    const inBand = skills.filter((s) => s.band === b.id);
    line(`  Band ${b.id} ${b.title.padEnd(12)} ${String(inBand.length).padStart(2)} skills`);
  }
  line('');
  line(`  roots (entry skills):        ${roots.map((s) => s.id).join(', ')}`);
  const leaves = skills.filter((s) => !(dependents.get(s.id)?.length));
  line(`  leaves (nothing depends on): ${leaves.map((s) => s.id).join(', ')}`);
  line(`  graduation-required skills:  ${(ladder.graduationContract?.requiredSkills ?? []).join(', ')}`);
  line('');
  if (warnings.length) { line(`WARNINGS (${warnings.length}):`); for (const w of warnings) line('  ! ' + w); line(''); }
  if (errors.length) {
    line(`FAILED with ${errors.length} error(s):`);
    for (const e of errors) line('  x ' + e);
    process.exit(1);
  }
  line('OK — decoding ladder is structurally sound.');
}
