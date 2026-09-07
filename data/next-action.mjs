import { knowledgeFrontier } from './knowledge-graph.mjs';

const FALLBACK = { type: 'today', title: 'Continue today’s learning', reason: 'Your recommended next step is ready on Today.', href: 'daily-router.html', cta: 'Open Today', progress: null, skillId: null };
const PRIORITY = ['recovery', 'review', 'foundation', 'academy', 'transfer', 'frontier', 'completion', 'continuation'];
const SKILL_ID = /^[a-z][a-z0-9-]{1,80}$/;
const SECURE = 0.67;

export function foundationSessionHref(skillId) {
  if (typeof skillId !== 'string' || !SKILL_ID.test(skillId.trim())) return FALLBACK.href;
  const id = skillId.trim();
  return id.startsWith('fnd-decode-') ? 'hebrew-decoding.html' : `academy-session.html?skill=${encodeURIComponent(id)}`;
}

function skillScore(learner, skillId) {
  return Math.max(Number(learner?.foundationScores?.[skillId]) || 0, Number(learner?.mastery?.[skillId]) || 0);
}

export function pickFrontierFoundationSkill(graph, learner) {
  if (!graph?.skills?.length) return null;
  const mastered = graph.skills.map((skill) => skill.id).filter((id) => skillScore(learner, id) >= SECURE);
  const { frontier } = knowledgeFrontier(graph, mastered);
  const byId = new Map(graph.skills.map((skill) => [skill.id, skill]));
  return frontier.map((id) => byId.get(id)).filter(Boolean).sort((a, b) => (a.layer - b.layer) || a.id.localeCompare(b.id))[0] || null;
}

export function foundationFrontierRecommendation(learner, graph) {
  if (!learner || learner.foundationGraduated) return null;
  const next = pickFrontierFoundationSkill(graph, learner);
  if (!next) return null;
  const byId = new Map(graph.skills.map((skill) => [skill.id, skill]));
  const prior = (next.prerequisites || []).map((id) => byId.get(id)).find(Boolean);
  const upcoming = graph.skills.find((skill) => (skill.prerequisites || []).includes(next.id));
  return {
    kind: 'academy-foundation',
    title: `Academy Foundation · ${next.title}`,
    reason: next.statement || next.teachingMove || 'Practice one transferable reading move.',
    url: foundationSessionHref(next.id),
    skillId: next.id,
    foundation: true,
    builtOn: prior && skillScore(learner, prior.id) >= SECURE ? prior.title : null,
    unlocks: upcoming ? upcoming.title : null
  };
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
