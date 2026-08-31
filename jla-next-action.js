(function () {
  const root = document.querySelector('[data-jla-next-action]');
  if (!root || !window.Seder) return;
  const fallback = { title: 'Continue today’s learning', reason: 'Open Today to continue with one clear step.', href: 'daily-router.html', cta: 'Open Today' };
  const safeHref = (value) => { try { const url = new URL(value, location.origin); return url.origin === location.origin && !String(value).startsWith('//') ? `${url.pathname.replace(/^\//, '')}${url.search}${url.hash}` : fallback.href; } catch { return fallback.href; } };
  const render = (action) => {
    const item = action && typeof action === 'object' ? action : fallback;
    const heading = document.createElement('h1'), reason = document.createElement('p'), link = document.createElement('a');
    heading.textContent = item.title || fallback.title; reason.textContent = item.reason || fallback.reason;
    link.textContent = `${item.cta || fallback.cta} →`; link.href = safeHref(item.href || fallback.href); link.className = 'jla-next-action__cta';
    link.addEventListener('click', () => Seder.api(`/api/learners/${Seder.currentLearnerId()}/events`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'next_action_started', actionType: item.type || 'today', actionHref: link.getAttribute('href') }) }).catch(() => {}));
    root.replaceChildren(heading, reason, link);
  };
  Seder.api(`/api/learners/${Seder.currentLearnerId()}/next-action`).then((response) => response.ok ? response.json() : Promise.reject(new Error('unavailable'))).then(render).catch(() => render(fallback));
}());
