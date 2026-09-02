const FALLBACK = { type: 'today', title: 'Continue today’s learning', reason: 'Your recommended next step is ready on Today.', href: 'daily-router.html', cta: 'Open Today', progress: null };
const PRIORITY = ['recovery', 'review', 'foundation', 'academy', 'transfer', 'frontier', 'completion', 'continuation'];

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
export function normalizeNextAction(action) {
  const input = action && typeof action === 'object' ? action : FALLBACK;
  const href = safeRelativeHref(input.href || input.url);
  const safe = href === FALLBACK.href && (input.href || input.url) !== FALLBACK.href ? FALLBACK : input;
  return {
    version: 1, type: text(safe.type, FALLBACK.type), title: text(safe.title, FALLBACK.title), reason: text(safe.reason, FALLBACK.reason), href,
    cta: text(safe.cta, 'Start'),
    progress: safe.progress && typeof safe.progress === 'object' && !Array.isArray(safe.progress) ? { label: text(safe.progress.label, 'Progress'), current: Math.max(0, Number(safe.progress.current) || 0), total: Math.max(0, Number(safe.progress.total) || 0) } : null
  };
}
