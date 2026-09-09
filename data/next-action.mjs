import { readFileSync } from 'node:fs';
import { knowledgeFrontier } from './knowledge-graph.mjs';

const FALLBACK = { type: 'today', title: 'Continue today’s learning', reason: 'Your recommended next step is ready on Today.', href: 'daily-router.html', cta: 'Open Today', progress: null, skillId: null };
const PRIORITY = ['recovery', 'review', 'foundation', 'academy', 'transfer', 'frontier', 'completion', 'continuation'];
const SKILL_ID = /^[a-z][a-z0-9-]{1,80}$/;
const SECURE = 0.67;
const STARTER_SET = JSON.parse(readFileSync(new URL('./foundation-starter-set.json', import.meta.url), 'utf8'));
export const STARTER_SKILL_IDS = new Set(STARTER_SET.starterSet.map((skill) => skill.id));

// Daily teach / review / repair stay inside the frozen starter set. Pass `null` to walk the
// whole graph (diagnostics still do). A custom Set/array overrides the default slice.
export function teachableFoundationIds(override) {
  if (override === null) return null;
  if (override instanceof Set) return override;
  if (Array.isArray(override)) return new Set(override);
  return STARTER_SKILL_IDS;
}

export function foundationSessionHref(skillId) {
  if (typeof skillId !== 'string' || !SKILL_ID.test(skillId.trim())) return FALLBACK.href;
  const id = skillId.trim();
  return id.startsWith('fnd-decode-') ? 'hebrew-decoding.html' : `academy-session.html?skill=${encodeURIComponent(id)}`;
}

function skillScore(learner, skillId) {
  return Math.max(Number(learner?.foundationScores?.[skillId]) || 0, Number(learner?.mastery?.[skillId]) || 0);
}

export function pickFrontierFoundationSkill(graph, learner, options = {}) {
  if (!graph?.skills?.length) return null;
  const among = teachableFoundationIds(options.teachableIds);
  const mastered = graph.skills.map((skill) => skill.id).filter((id) => skillScore(learner, id) >= SECURE);
  const { frontier } = knowledgeFrontier(graph, mastered, among ? { among } : {});
  const byId = new Map(graph.skills.map((skill) => [skill.id, skill]));
  return frontier.map((id) => byId.get(id)).filter(Boolean).sort((a, b) => (a.layer - b.layer) || a.id.localeCompare(b.id))[0] || null;
}

export function pickContentPracticeForSkill(map, skillId, learner) {
  if (typeof skillId !== 'string' || !skillId.startsWith('fnd-')) return null;
  const rows = map?.bySkill?.[skillId];
  if (!Array.isArray(rows) || !rows.length) return null;
  const mastery = learner?.mastery || {};
  const pick = rows.find((row) => (Number(mastery[row.contentSkill]) || 0) < 0.85) || rows[0];
  if (!pick?.route) return null;
  return { unit: pick.unit, label: pick.label, href: pick.route, ref: pick.ref, genre: pick.genre, contentSkill: pick.contentSkill };
}

export function contentSkillToFoundationId(map, contentSkill) {
  if (typeof contentSkill !== 'string' || !map?.bySkill) return null;
  for (const [fnd, rows] of Object.entries(map.bySkill)) {
    if (!fnd.startsWith('fnd-') || !Array.isArray(rows)) continue;
    if (rows.some((row) => row.contentSkill === contentSkill)) return fnd;
  }
  return null;
}

export function resolveFoundationSkillId(graph, map, skillId) {
  if (typeof skillId !== 'string' || !skillId.trim()) return null;
  const id = skillId.trim();
  if (graph?.skills?.some((skill) => skill.id === id)) return id;
  return contentSkillToFoundationId(map, id);
}

export function pickRetrievalFoundationSkill(graph, map, { dueIds = [], fadedIds = [], learner = null, allowSecuredFallback = false, teachableIds } = {}) {
  if (!graph?.skills?.length) return null;
  const among = teachableFoundationIds(teachableIds);
  const allowed = (id) => !among || among.has(id);
  const resolve = (id) => resolveFoundationSkillId(graph, map, id);
  for (const id of dueIds) {
    const skillId = resolve(id);
    if (skillId && allowed(skillId)) return { skillId, sourceId: id, trigger: 'due' };
  }
  for (const id of fadedIds) {
    const skillId = resolve(id);
    if (skillId && allowed(skillId)) return { skillId, sourceId: id, trigger: 'decay' };
  }
  if (!allowSecuredFallback || !learner) return null;
  const secured = graph.skills.filter((skill) => allowed(skill.id) && skillScore(learner, skill.id) >= SECURE);
  if (!secured.length) return null;
  const updated = learner.masteryUpdatedAt || {};
  secured.sort((a, b) => {
    const newest = (Date.parse(updated[b.id] || '') || 0) - (Date.parse(updated[a.id] || '') || 0);
    return newest || (a.layer - b.layer) || a.id.localeCompare(b.id);
  });
  return { skillId: secured[0].id, sourceId: secured[0].id, trigger: 'welcome-back' };
}

export function foundationRetrievalRecommendation(learner, graph, map, options = {}) {
  const pick = pickRetrievalFoundationSkill(graph, map, { ...options, learner });
  if (!pick) return null;
  const skill = graph.skills.find((entry) => entry.id === pick.skillId);
  if (!skill) return null;
  const recovery = options.mode === 'recovery' || pick.trigger === 'welcome-back';
  const decay = pick.trigger === 'decay';
  return {
    kind: 'review',
    decayTriggered: decay,
    title: recovery ? `Welcome back · ${skill.title}` : decay ? `Refresh · ${skill.title}` : `Retrieve · ${skill.title}`,
    reason: recovery
      ? `One short check of ${skill.title.toLowerCase()} restarts your rhythm.`
      : decay
        ? `${skill.title} has faded below its peak. A quick retrieval restores it faster than relearning.`
        : `A short check of ${skill.title.toLowerCase()} keeps the move from fading.`,
    url: foundationSessionHref(pick.skillId),
    skillId: pick.skillId,
    practice: pickContentPracticeForSkill(map, pick.skillId, learner),
    trigger: pick.trigger
  };
}

export function foundationFrontierRecommendation(learner, graph, map, options = {}) {
  if (!learner || learner.foundationGraduated) return null;
  const next = pickFrontierFoundationSkill(graph, learner, options);
  if (!next) return null;
  const among = teachableFoundationIds(options.teachableIds);
  const byId = new Map(graph.skills.map((skill) => [skill.id, skill]));
  const prior = (next.prerequisites || []).map((id) => byId.get(id)).find(Boolean);
  const upcoming = graph.skills.find((skill) => (skill.prerequisites || []).includes(next.id) && (!among || among.has(skill.id)));
  const practice = pickContentPracticeForSkill(map, next.id, learner);
  return {
    kind: 'academy-foundation',
    title: next.title,
    reason: next.statement
      ? `${next.statement} About 15 minutes — you’ll see it, then answer a question.`
      : 'One short lesson: see it on the page, then answer a question.',
    url: foundationSessionHref(next.id),
    skillId: next.id,
    foundation: true,
    builtOn: prior && skillScore(learner, prior.id) >= SECURE ? prior.title : null,
    unlocks: upcoming ? upcoming.title : null,
    practice
  };
}

export function citedSkillId(recommendation) {
  const id = recommendation?.skillId || recommendation?.skill?.id || null;
  if (typeof id !== 'string' || !SKILL_ID.test(id.trim())) return null;
  const trimmed = id.trim();
  if (['academy-foundation', 'graph-practice', 'review', 'recovery'].includes(recommendation?.kind) && !trimmed.startsWith('fnd-')) return null;
  return trimmed;
}

export function selectNextAction(candidates = {}) {
  for (const type of PRIORITY) if (candidates[type] && typeof candidates[type] === 'object') return { type, ...candidates[type] };
  return { ...FALLBACK };
}

function safeRelativeHref(value) {
  if (typeof value !== 'string' || !value.trim()) return FALLBACK.href;
  const href = value.trim();
  if (href.startsWith('/') || href.startsWith('\\') || /^[a-z][a-z\d+.-]*:/i.test(href)) return FALLBACK.href;
  try { const parsed = new URL(href, 'https://jla.invalid/'); return parsed.origin === 'https://jla.invalid' && !parsed.username && !parsed.password ? `${parsed.pathname.replace(/^\//, '')}${parsed.search}${parsed.hash}` : FALLBACK.href; }
  catch { return FALLBACK.href; }
}

const text = (value, fallback) => typeof value === 'string' && value.trim() ? value.trim() : fallback;
const skillIdOf = (value) => typeof value === 'string' && SKILL_ID.test(value.trim()) ? value.trim() : null;
export function normalizeNextAction(action) {
  const input = action && typeof action === 'object' ? action : FALLBACK;
  const href = safeRelativeHref(input.href || input.url);
  const safe = href === FALLBACK.href && (input.href || input.url) !== FALLBACK.href ? FALLBACK : input;
  return {
    version: 1, type: text(safe.type, FALLBACK.type), title: text(safe.title, FALLBACK.title), reason: text(safe.reason, FALLBACK.reason), href,
    cta: text(safe.cta, 'Start'),
    progress: safe.progress && typeof safe.progress === 'object' && !Array.isArray(safe.progress) ? { label: text(safe.progress.label, 'Progress'), current: Math.max(0, Number(safe.progress.current) || 0), total: Math.max(0, Number(safe.progress.total) || 0) } : null,
    skillId: skillIdOf(safe.skillId)
  };
}
