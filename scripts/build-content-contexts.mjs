#!/usr/bin/env node
// Build the content-context layer of the foundation knowledge graph (docs/foundation-graph-schema.md
// §2.2, step 8). The schema asks for content contexts as a first-class node class, promoted OUT of
// the skill object: { id, skill, ref, genre, family }, with the requirement that every foundational
// skill has >=3 contexts spanning >=2 source families.
//
// This MATERIALIZES that layer by merging the two real context sources we already have — the curated
// inline `sourceContexts` on each skill (family-diverse) and `data/foundation-content-map.json` (the
// reverse index derived from real units) — deduped by source reference. It invents no references:
// every context traces to one or both existing sources (recorded in `sources`). Skills that still
// fall short of >=3/>=2 after the merge are reported honestly, not padded.
//
//   node scripts/build-content-contexts.mjs   (npm run graph:contexts)
import { readFileSync, writeFileSync } from 'node:fs';

const read = (p) => JSON.parse(readFileSync(new URL(`../${p}`, import.meta.url), 'utf8'));
const graph = read('data/foundation-skill-graph.json');
const contentMap = read('data/foundation-content-map.json');

// One source family per genre — the unit of "spanning >=2 families" (matches scripts/graph-quality).
const FAMILY = { torah: 'tanakh', mishnah: 'rabbinic', gemara: 'rabbinic', halakha: 'halakhic', tefillah: 'liturgical', thought: 'thought', mussar: 'thought', chassidus: 'thought', history: 'historical' };
const familyOf = (genre) => FAMILY[genre] || genre;

const slug = (ref) => ref.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const contexts = [];
const perSkill = {};
for (const skill of graph.skills) {
  const byRef = new Map(); // ref -> { genre, sources:Set, unit? }
  for (const c of skill.sourceContexts || []) {
    byRef.set(c.ref, { genre: c.genre, sources: new Set(['inline']), unit: undefined });
  }
  for (const c of contentMap.bySkill?.[skill.id] || []) {
    const prior = byRef.get(c.ref);
    if (prior) { prior.sources.add('content-map'); prior.unit = prior.unit || c.unit; }
    else byRef.set(c.ref, { genre: c.genre, sources: new Set(['content-map']), unit: c.unit });
  }
  let n = 0;
  const families = new Set();
  for (const [ref, info] of byRef) {
    n += 1;
    const family = familyOf(info.genre);
    families.add(family);
    const context = { id: `ctx-${skill.id}-${slug(ref)}`.slice(0, 90), skill: skill.id, ref, genre: info.genre, family, sources: [...info.sources].sort() };
    if (info.unit) context.unit = info.unit;
    contexts.push(context);
  }
  perSkill[skill.id] = { contexts: n, families: families.size, meetsStep8: n >= 3 && families.size >= 2 };
}

const skillsMeetingStep8 = Object.values(perSkill).filter((p) => p.meetsStep8).length;
const shortfall = Object.entries(perSkill).filter(([, p]) => !p.meetsStep8).map(([id, p]) => ({ skill: id, contexts: p.contexts, families: p.families }));

const output = {
  generatedBy: 'scripts/build-content-contexts.mjs',
  graphVersion: graph.version,
  note: 'Content-context layer (docs/foundation-graph-schema.md §2.2, step 8): every content context '
    + 'as a first-class node { id, skill, ref, genre, family }, promoted out of the skill object. '
    + 'Merged from the curated inline sourceContexts and data/foundation-content-map.json (deduped by '
    + 'ref); `sources` records provenance. No references are invented — skills still short of '
    + '>=3 contexts / >=2 families after the merge are listed in `shortfall`, to be filled with real '
    + 'sources (content authoring / educator audit), never padded.',
  step8Requirement: '>=3 contexts spanning >=2 source families per skill',
  skillsMeetingStep8: `${skillsMeetingStep8}/${graph.skills.length}`,
  shortfall,
  perSkill,
  contexts
};

writeFileSync(new URL('../data/foundation-content-contexts.json', import.meta.url), `${JSON.stringify(output, null, 2)}\n`);
console.log(`Wrote ${contexts.length} content contexts across ${graph.skills.length} skills to data/foundation-content-contexts.json`);
console.log(`  step 8 (>=3 contexts, >=2 families): ${skillsMeetingStep8}/${graph.skills.length} skills`);
console.log(`  ${shortfall.length} skills still short (real sources needed, not padded): ${shortfall.map((s) => s.skill).join(', ') || 'none'}`);
