#!/usr/bin/env node
// Build the misconception layer (docs/foundation-graph-schema.md §4) from the educator audit. The
// schema's misconception model is { id, skill, description, signal, repair } — the wrong reading a
// skill exists to correct, what a learner does when they hold it, and the targeted repair. `description`
// and `signal` are educator judgments (they come from the audit, data/foundation-audit.json); `repair`
// is seeded from the skill's existing repair note. Until an audit is imported this layer is empty —
// nothing is fabricated. Run after scripts/import-audit-workbench.mjs.
//
//   node scripts/build-misconceptions.mjs   (npm run graph:misconceptions)
import { readFileSync, writeFileSync } from 'node:fs';

const read = (p) => JSON.parse(readFileSync(new URL(`../${p}`, import.meta.url), 'utf8'));
const graph = read('data/foundation-skill-graph.json');
const repairOf = new Map(graph.skills.map((s) => [s.id, s.repair || null]));
const skillIds = new Set(graph.skills.map((s) => s.id));

let audit = {};
try { audit = read('data/foundation-audit.json'); } catch { /* no audit imported yet — layer stays empty */ }

const misconceptions = [];
for (const [skill, m] of Object.entries(audit.misconceptions || {})) {
  if (!skillIds.has(skill) || !m?.description || !m?.signal) continue;
  misconceptions.push({ id: `mis-${skill}`, skill, description: m.description, signal: m.signal, repair: repairOf.get(skill) });
}

const output = {
  generatedBy: 'scripts/build-misconceptions.mjs',
  graphVersion: graph.version,
  note: 'Misconception models (§4), authored by educators in the audit and imported via '
    + 'scripts/import-audit-workbench.mjs. description + signal are educator judgments; repair is the '
    + "skill's existing repair note. Empty until an audit is imported — never fabricated.",
  coverage: { misconceptions: misconceptions.length, skillsTotal: graph.skills.length },
  misconceptions
};

writeFileSync(new URL('../data/foundation-misconceptions.json', import.meta.url), `${JSON.stringify(output, null, 2)}\n`);
console.log(`Wrote ${misconceptions.length}/${graph.skills.length} misconception models to data/foundation-misconceptions.json`);
if (!misconceptions.length) console.log('  (empty — import an educator audit with named misconceptions first: npm run graph:import -- <export.json>)');
