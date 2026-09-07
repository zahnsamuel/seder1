import { estimateFrontierFromDiagnostic } from './data/knowledge-graph.mjs';
import { foundationSessionHref, pickFrontierFoundationSkill } from './data/next-action.mjs';

const SECURE = 0.67;
const SECURE_SEED = 0.8;

export function foundationIdFor(id, graduationMap = {}) {
  if (typeof id !== 'string' || !id.trim()) return null;
  const trimmed = id.trim();
  if (trimmed.startsWith('fnd-')) return trimmed;
  return graduationMap[trimmed]?.graphSkill || null;
}

export function translateScoreMap(scoreMap, graduationMap = {}, graphIds = null) {
  const out = {};
  for (const [id, value] of Object.entries(scoreMap || {})) {
    const fnd = foundationIdFor(id, graduationMap);
    if (!fnd || (graphIds && !graphIds.has(fnd))) continue;
    const n = Number(value);
    if (!Number.isFinite(n)) continue;
    out[fnd] = Math.max(out[fnd] || 0, n);
  }
  return out;
}

function stripSliceIds(scoreMap, graduationMap = {}) {
  const out = {};
  for (const [id, value] of Object.entries(scoreMap || {})) {
    if (graduationMap[id]) continue;
    out[id] = value;
  }
  return out;
}

export function foundationScoresFromDomainScores({ domainScores = {}, sliceSkills = [], graduationMap = {} } = {}) {
  const scores = {};
  for (const skill of sliceSkills) {
    const domainScore = Number(domainScores[skill.domain] || 0);
    if (domainScore < SECURE) continue;
    const mapped = foundationIdFor(skill.id, graduationMap);
    if (!mapped) continue;
    scores[mapped] = Math.max(scores[mapped] || 0, SECURE_SEED);
  }
  return scores;
}

function clampRhythm(rhythm = {}) {
  return {
    daysPerWeek: Math.min(7, Math.max(1, Number(rhythm.daysPerWeek) || 3)),
    minutesPerSession: Math.min(45, Math.max(10, Number(rhythm.minutesPerSession) || 20))
  };
}

function layerProfile(graph, knownSet) {
  return (graph.layers || []).map((layer) => {
    const inLayer = (graph.skills || []).filter((skill) => skill.layer === layer.n);
    const secured = inLayer.filter((skill) => knownSet.has(skill.id)).length;
    const state = inLayer.length && secured === inLayer.length ? 'secure' : 'emerging';
    return { layer: layer.n, title: layer.title, state, secured, total: inLayer.length };
  });
}

// One placement result: a capability profile on fnd- skills plus the same frontier start Today uses.
// Graduation-slice ids and domain scores are optional translation input only — they never leave as
// the learner's "start here" id.
export function buildJlaPlacementResult({
  graph,
  known = [],
  foundationScores = {},
  domainScores = {},
  sliceSkills = [],
  graduationMap = {},
  rhythm = { daysPerWeek: 3, minutesPerSession: 20 }
} = {}) {
  if (!graph?.skills?.length) {
    throw new Error('JLA placement requires the foundation skill graph.');
  }

  const graphIds = new Set(graph.skills.map((skill) => skill.id));
  const fromDomains = foundationScoresFromDomainScores({ domainScores, sliceSkills, graduationMap });
  const seededScores = { ...fromDomains, ...translateScoreMap(foundationScores, graduationMap, graphIds) };
  const demonstrated = {};
  for (const id of known) {
    const fnd = foundationIdFor(id, graduationMap);
    if (fnd && graphIds.has(fnd)) demonstrated[fnd] = true;
  }
  for (const [id, value] of Object.entries(seededScores)) {
    if (Number(value) >= SECURE) demonstrated[id] = true;
  }

  const estimate = estimateFrontierFromDiagnostic(graph, demonstrated);
  const knownSet = new Set(estimate.known);
  const learner = {
    placement: { completedAt: true },
    foundationScores: Object.fromEntries(estimate.known.map((id) => [id, Math.max(seededScores[id] || 0, SECURE_SEED)]))
  };
  const next = pickFrontierFoundationSkill(graph, learner);

  return {
    headline: 'Starting point, not a test.',
    summary: next
      ? `The Academy will begin with one useful capability — ${next.title} — and adjust from evidence.`
      : 'Every foundational move is already in place. Carry them into an unfamiliar source to make them durable.',
    firstUsefulSkill: next ? { id: next.id, title: next.title, layer: next.layer } : null,
    skillId: next?.id || null,
    firstSession: next ? foundationSessionHref(next.id) : 'my-graph.html',
    profile: layerProfile(graph, knownSet),
    known: estimate.known,
    frontier: estimate.frontier,
    recommendedRhythm: clampRhythm(rhythm)
  };
}

// Server-side placement enrichment: rewrite slice ids onto fnd- scores, seed inferred prerequisites,
// and name the one next start Today will also recommend.
export function resolvePlacementStart({
  graph,
  scores = {},
  foundationScores = {},
  recommendedSkill = null,
  domainScores = {},
  sliceSkills = [],
  graduationMap = {}
} = {}) {
  const graphIds = new Set((graph?.skills || []).map((skill) => skill.id));
  const translated = {
    ...translateScoreMap(scores, graduationMap, graphIds),
    ...translateScoreMap(foundationScores, graduationMap, graphIds)
  };
  const result = buildJlaPlacementResult({
    graph,
    foundationScores: translated,
    domainScores,
    sliceSkills,
    graduationMap
  });
  const seeded = {};
  for (const id of result.known) seeded[id] = Math.max(translated[id] || 0, SECURE_SEED);
  const mappedRecommended = foundationIdFor(recommendedSkill, graduationMap);
  return {
    scores: stripSliceIds({ ...scores, ...seeded }, graduationMap),
    foundationScores: stripSliceIds({ ...foundationScores, ...seeded }, graduationMap),
    recommendedSkill: result.skillId || (mappedRecommended && graphIds.has(mappedRecommended) ? mappedRecommended : null),
    firstSession: result.firstSession,
    profile: result.profile,
    known: result.known
  };
}
