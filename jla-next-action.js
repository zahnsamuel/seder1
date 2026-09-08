(function () {
  const requestedSkill = (() => {
    try {
      const value = new URLSearchParams(location.search).get('skill') || new URLSearchParams(location.search).get('foundationSkill');
      return typeof value === 'string' && /^[a-z][a-z0-9-]{1,80}$/.test(value.trim()) ? value.trim() : null;
    } catch { return null; }
  })();
  if (requestedSkill) {
    location.replace(requestedSkill.startsWith('fnd-decode-') ? 'hebrew-decoding.html' : `academy-session.html?skill=${encodeURIComponent(requestedSkill)}`);
    return;
  }
  const root = document.querySelector('[data-jla-next-action]');
  if (!root || !window.Seder) return;
  const fallback = { title: 'Continue today’s learning', reason: 'One clear next step is waiting.', href: 'daily-router.html', cta: 'Open Today' };
  const safeHref = (value) => { try { const url = new URL(value, location.origin); return url.origin === location.origin && !String(value).startsWith('//') ? `${url.pathname.replace(/^\//, '')}${url.search}${url.hash}` : fallback.href; } catch { return fallback.href; } };
  const render = (action) => {
    const item = action && typeof action === 'object' ? action : fallback;
    const heading = document.createElement('h1'), reason = document.createElement('p'), link = document.createElement('a');
    heading.textContent = item.title || fallback.title; reason.textContent = item.reason || fallback.reason;
    link.textContent = `${item.cta || fallback.cta} →`; link.href = safeHref(item.href || fallback.href); link.className = 'jla-next-action__cta';
    if (item.skillId) root.setAttribute('data-skill-id', item.skillId); else root.removeAttribute('data-skill-id');
    link.addEventListener('click', () => Seder.api(`/api/learners/${Seder.currentLearnerId()}/events`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'next_action_started', actionType: item.type || 'today', actionHref: link.getAttribute('href'), skillId: item.skillId || null }) }).catch(() => {}));
    const hint = document.createElement('p');
    hint.className = 'jla-next-action__hint';
    hint.textContent = 'This is the only thing to do right now.';
    root.replaceChildren(heading, reason, link, hint);
  };
  Seder.api(`/api/learners/${Seder.currentLearnerId()}/next-action`).then((response) => response.ok ? response.json() : Promise.reject(new Error('unavailable'))).then(render).catch(() => render(fallback));
}());
