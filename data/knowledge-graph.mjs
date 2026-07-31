// Math-Academy-Way graph engine for the JLA foundation skill graph (docs/math-academy-way-graph.md).
// Pure functions over the prerequisite DAG — no fabrication, no I/O. They implement the three graph
// operations the Math Academy Way turns a knowledge graph into a learning engine with:
//
//   1. Knowledge frontier — "the edge of the knowledge profile": the skills a learner is ready to
//      learn now (every prerequisite mastered, the skill itself not yet). New lessons always sit on
//      the frontier (The Math Academy Way, ch. 4 & ch. on the frontier).
//   2. Learning path — the ordered set of not-yet-mastered prerequisites to reach a goal skill.
//   3. FIRe review set — "serve the smallest set of learning tasks that encompasses all the due
//      review." Advanced skills implicitly practice ("encompass") the simpler skills below them, so a
//      due simpler skill needs no separate review if a due advanced skill fully encompasses it.
//
// A "mastered" skill here = capability state secure or better (see capability-state / graph masteryScale).

// Skill id -> its direct prerequisite ids.
function prereqMap(graph) {
  return new Map(graph.skills.map((s) => [s.id, s.prerequisites || []]));
}

// The knowledge frontier for a learner who has mastered `masteredIds`.
//   mastered : ids the learner is at/above secure on
//   frontier : ready to learn now — not mastered, every direct prerequisite mastered
//   blocked  : not masterable yet — lists which prerequisites are still missing
export function knowledgeFrontier(graph, masteredIds) {
  const mastered = new Set(masteredIds);
  const prereqs = prereqMap(graph);
  const frontier = [];
  const blocked = [];
  for (const skill of graph.skills) {
    if (mastered.has(skill.id)) continue;
    const missing = (prereqs.get(skill.id) || []).filter((p) => !mastered.has(p));
    if (missing.length === 0) frontier.push(skill.id);
    else blocked.push({ skill: skill.id, missing });
  }
  return { mastered: [...mastered].filter((id) => prereqs.has(id)), frontier, blocked };
}

// The ordered learning path to `goalId`: every not-yet-mastered ancestor (transitive prerequisite)
// plus the goal, in an order where each skill's prerequisites come before it (topological). Empty if
// the goal is already mastered. Throws if the goal is unknown.
export function learningPath(graph, goalId, masteredIds) {
  const prereqs = prereqMap(graph);
  if (!prereqs.has(goalId)) throw new Error(`Unknown goal skill: ${goalId}`);
  const mastered = new Set(masteredIds);
  if (mastered.has(goalId)) return [];
  const needed = new Set();
  (function collect(id) {
    if (mastered.has(id) || needed.has(id)) return;
    for (const p of prereqs.get(id) || []) collect(p);
    needed.add(id);
  })(goalId);
  // `needed` was built post-order (prerequisites added before dependents), so it is already a valid
  // learning order.
  return [...needed];
}

// Build the full-encompassing relation from the typed-edge layer. An encompassing runs opposite a
// prerequisite: the dependent (advanced) skill encompasses its prerequisite (simpler) one. Following
// the Math Academy Way, weights are set along prerequisite edges (default: full) and flow through
// chains of full encompassings. `edges` is data/foundation-skill-edges.json's `edges`.
function fullEncompassingMap(edges) {
  const encompasses = new Map(); // advanced id -> Set of ids it fully encompasses (direct)
  for (const e of edges) {
    if (e.type !== 'prerequisite') continue;
    // Default full encompassing along a direct prerequisite unless a weight says otherwise.
    const weight = e.encompassing?.weight ?? 1;
    if (weight >= 1) {
      if (!encompasses.has(e.to)) encompasses.set(e.to, new Set());
      encompasses.get(e.to).add(e.from); // e.to (dependent/advanced) encompasses e.from (prerequisite)
    }
  }
  return encompasses;
}

// Does `advanced` fully encompass `simpler` through a chain of full encompassings?
function encompassesTransitively(encompasses, advanced, simpler) {
  const seen = new Set();
  const stack = [advanced];
  while (stack.length) {
    const cur = stack.pop();
    for (const enc of encompasses.get(cur) || []) {
      if (enc === simpler) return true;
      if (!seen.has(enc)) { seen.add(enc); stack.push(enc); }
    }
  }
  return false;
}

// Math-Academy-Way targeted remediation: "If a student ever fails a lesson twice at the same
// knowledge point, we automatically provide remedial reviews on the key prerequisites." With only
// skill-level struggle tracking available, a struggled skill stands in for its failed practice KP;
// remediation targets that KP's KEY PREREQUISITE (the foundation the move leans on most) rather than
// re-drilling the skill. Skips a foundation the learner already holds strongly (reviewing it wouldn't
// help — the difficulty is elsewhere) and falls through. Pure; the server builds the recommendation.
//   knowledgePoints : data/foundation-knowledge-points.json's `knowledgePoints`
//   struggles       : learner.struggles (skillId -> count)
//   mastery         : learner.mastery (skillId -> 0..1)
export function keyPrerequisiteRemediation({ knowledgePoints, struggles = {}, mastery = {}, threshold = 2, strongMastery = 0.85 }) {
  const struggling = Object.entries(struggles).filter(([, n]) => n >= threshold).sort((a, b) => b[1] - a[1]);
  for (const [skillId, count] of struggling) {
    // The practice KP's key prerequisite is the proximate move the skill most directly uses.
    const practiceKp = knowledgePoints.find((k) => k.skill === skillId && k.kind === 'practice');
    const keyPrerequisite = practiceKp?.keyPrerequisite;
    if (keyPrerequisite && (mastery[keyPrerequisite] || 0) < strongMastery) {
      return { strugglingSkill: skillId, count, keyPrerequisite };
    }
  }
  return null;
}

// FIRe: the smallest set of skills to actually practice so that every due-for-review skill is either
// practiced directly or implicitly reviewed by a fully-encompassing advanced skill that is also due.
// Returns { practice, covered } where `covered` maps each dropped due skill to the skill that
// encompasses it — so the saving is auditable, never silent.
export function encompassingReviewSet(dueIds, edges) {
  const due = [...new Set(dueIds)];
  const encompasses = fullEncompassingMap(edges);
  const covered = {};
  const practice = [];
  for (const skill of due) {
    const encloser = due.find((other) => other !== skill && encompassesTransitively(encompasses, other, skill));
    if (encloser) covered[skill] = encloser;
    else practice.push(skill);
  }
  return { practice, covered };
}
