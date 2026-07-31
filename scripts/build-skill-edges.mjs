#!/usr/bin/env node
// Build the typed-edge layer of the foundation knowledge graph (docs/foundation-graph-schema.md §3).
//
// Today the graph carries adjacency as bare prerequisite id strings (0/74 typed). The schema asks
// for typed, first-class edges { from, to, type, rationale }. This script MATERIALIZES the edges we
// already have evidence for, from the existing data — and deliberately does NOT invent the parts
// that require human judgment:
//   - prerequisite  : the graph adjacency, typed. rationale is null — a rationale is an educator's
//                     pedagogical claim (§3), authored during the audit, never fabricated here.
//   - assessed-by   : a graph skill -> an authored, server-scored academy item, via Migration 001
//                     (data/graduation-skill-map.json). Carries the map's confidence so an
//                     "approximate" pairing is never read as authoritative.
// Intentionally absent until the educator audit: the judgment edges supports / transfers-to /
// misconception-of / repaired-by. The taught-by relation (skill -> content) is already first-class
// as data/foundation-content-map.json (the content graph, §2.2) and is not duplicated here.
//
//   node scripts/build-skill-edges.mjs   (npm run graph:edges)
import { readFileSync, writeFileSync } from 'node:fs';

const read = (p) => JSON.parse(readFileSync(new URL(`../${p}`, import.meta.url), 'utf8'));
const graph = read('data/foundation-skill-graph.json');
const gradMap = read('data/graduation-skill-map.json').map;
const authoredSliceSkills = new Set(read('data/jla-academy-sessions.json').map((a) => a.skillId));
const skillIds = new Set(graph.skills.map((s) => s.id));

const edges = [];

// prerequisite: from = the prerequisite skill, to = the skill that depends on it. Per §3, "to cannot
// be learned before from is at least secure." This is exactly the graph adjacency, now typed.
for (const skill of graph.skills) {
  for (const prerequisite of skill.prerequisites || []) {
    edges.push({
      from: prerequisite, to: skill.id, type: 'prerequisite', rationale: null,
      // Encompassing (The Math Academy Way): practicing `to` (the advanced skill) implicitly reviews
      // `from` (the simpler prerequisite). MA sets encompassing weights ALONG direct prerequisites and
      // lets repetition flow propagate the rest; a full weight (1) along the direct edge is the
      // proposed first pass, refined by a domain expert in the audit — asserted-pending, like the
      // rationale. The FIRe review engine (data/knowledge-graph.mjs) reads these weights.
      encompassing: { weight: 1, basis: 'default-full-along-direct-prerequisite', status: 'pending-expert' }
    });
  }
}

// assessed-by: graph skill -> authored academy item (slice id space), only where Migration 001 links
// the skill AND an academy session actually exists for it. This is what makes a graph skill scorable.
for (const [sliceId, entry] of Object.entries(gradMap)) {
  if (entry.graphSkill && skillIds.has(entry.graphSkill) && authoredSliceSkills.has(sliceId)) {
    edges.push({ from: entry.graphSkill, to: sliceId, type: 'assessed-by', confidence: entry.confidence, rationale: null });
  }
}

const counts = edges.reduce((acc, e) => ({ ...acc, [e.type]: (acc[e.type] || 0) + 1 }), {});

const output = {
  generatedBy: 'scripts/build-skill-edges.mjs',
  graphVersion: graph.version,
  note: 'Typed edges (docs/foundation-graph-schema.md §3), derived from existing data — never fabricated. '
    + 'prerequisite = the graph adjacency, typed; rationale is null pending the educator audit '
    + '(rationales are educator-written pedagogical claims). assessed-by = a graph skill linked to an '
    + 'authored, server-scored academy item via data/graduation-skill-map.json (confidence carried '
    + 'through). Judgment edges (supports/transfers-to/misconception-of/repaired-by) are intentionally '
    + 'absent until the audit; taught-by lives in data/foundation-content-map.json (§2.2).',
  edgeTypes: ['prerequisite', 'assessed-by'],
  counts,
  edges
};

writeFileSync(new URL('../data/foundation-skill-edges.json', import.meta.url), `${JSON.stringify(output, null, 2)}\n`);
console.log(`Wrote ${edges.length} typed edges to data/foundation-skill-edges.json`);
console.log(`  ${counts.prerequisite || 0} prerequisite · ${counts['assessed-by'] || 0} assessed-by`);
console.log('  rationale: 0 (pending educator audit — §3, not fabricated)');
