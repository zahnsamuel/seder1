#!/usr/bin/env node
// Build the knowledge-point (KP) layer of the JLA knowledge graph, the Math Academy Way
// (docs/math-academy-way-graph.md; The Math Academy Way, ch. 4 "Scaffolded Mastery Learning").
//
// MA: "Each topic involves a lesson that is broken down into several key pieces of learning called
// knowledge points … the first knowledge point covers the most basic idea or skill of the lesson,
// and later knowledge points gently introduce more advanced cases." Each KP is linked to the KEY
// prerequisite it most directly uses, so failing a KP twice triggers targeted remedial review of
// that prerequisite.
//
// A real, deep KP decomposition is pedagogical authoring for the educator audit. This builds an
// HONEST first scaffold instead of fabricating one: it recasts each skill's OWN existing fields into
// MA's basic -> advanced progression —
//     teachingMove -> KP1 "introduce"   (the basic move)
//     check        -> KP2 "practice"    (apply it in a familiar source)
//     transfer     -> KP3 "transfer"    (the advanced case: an unfamiliar source)
// No KP text is invented; each is a field the skill already carries. The KEY PREREQUISITE per KP is
// proposed from the skill's real prerequisites by layer (introduce leans on the most foundational
// prerequisite; practice/transfer on the most proximate one) and marked pending-expert.
//
//   node scripts/build-knowledge-points.mjs   (npm run graph:kp)
import { readFileSync, writeFileSync } from 'node:fs';

const graph = JSON.parse(readFileSync(new URL('../data/foundation-skill-graph.json', import.meta.url), 'utf8'));
const layerOf = new Map(graph.skills.map((s) => [s.id, s.layer]));

// The key prerequisite a KP most directly uses, chosen from the skill's own prerequisites:
//   'foundational' = lowest-layer prerequisite (the base the move is built on)
//   'proximate'    = highest-layer prerequisite (the immediately prior skill)
function keyPrerequisite(skill, which) {
  const prereqs = [...(skill.prerequisites || [])];
  if (!prereqs.length) return null;
  prereqs.sort((a, b) => (layerOf.get(a) || 0) - (layerOf.get(b) || 0));
  return which === 'foundational' ? prereqs[0] : prereqs[prereqs.length - 1];
}

const STEPS = [
  { kind: 'introduce', field: 'teachingMove', key: 'foundational' },
  { kind: 'practice', field: 'checks', key: 'proximate' },
  { kind: 'transfer', field: 'transfer', key: 'proximate' }
];

const knowledgePoints = [];
const perSkill = {};
for (const skill of graph.skills) {
  let index = 0;
  for (const step of STEPS) {
    const statement = step.field === 'checks' ? (skill.checks || [])[0] : skill[step.field];
    if (!statement) continue;
    index += 1;
    const key = keyPrerequisite(skill, step.key);
    knowledgePoints.push({
      id: `kp-${skill.id}-${index}`,
      skill: skill.id,
      index,
      kind: step.kind,
      statement,
      source: step.field === 'checks' ? 'check' : step.field,
      keyPrerequisite: key,
      keyPrerequisiteStatus: key ? 'proposed-pending-expert' : 'none-root-skill',
      repair: skill.repair || null // KP-level remedial move (targeted at the key prerequisite)
    });
  }
  perSkill[skill.id] = index;
}

const withKey = knowledgePoints.filter((k) => k.keyPrerequisite).length;
const output = {
  generatedBy: 'scripts/build-knowledge-points.mjs',
  graphVersion: graph.version,
  note: 'Knowledge-point layer (Math Academy Way, scaffolded mastery learning). A first scaffold: each '
    + 'skill is decomposed into introduce -> practice -> transfer KPs recast from its OWN teachingMove / '
    + 'check / transfer — no KP text is invented. Each KP proposes the KEY PREREQUISITE it most directly '
    + 'uses (introduce -> most foundational prerequisite, practice/transfer -> most proximate), marked '
    + 'pending-expert. Deeper per-skill decomposition (more advanced-case KPs) and confirmed key '
    + 'prerequisites are the educator audit’s job. The key-prerequisite link is the hook for MA-style '
    + 'targeted remediation: fail a KP twice -> remedial review of its key prerequisite.',
  kpTemplate: STEPS.map((s) => s.kind),
  coverage: {
    knowledgePoints: knowledgePoints.length,
    skills: Object.keys(perSkill).length,
    keyPrerequisitesProposed: withKey
  },
  perSkill,
  knowledgePoints
};

writeFileSync(new URL('../data/foundation-knowledge-points.json', import.meta.url), `${JSON.stringify(output, null, 2)}\n`);
console.log(`Wrote ${knowledgePoints.length} knowledge points across ${Object.keys(perSkill).length} skills to data/foundation-knowledge-points.json`);
console.log(`  template: ${STEPS.map((s) => s.kind).join(' -> ')} (recast from each skill's own fields, nothing invented)`);
console.log(`  ${withKey}/${knowledgePoints.length} KPs carry a proposed key prerequisite (pending expert; root-skill KPs have none)`);
