/* ==========================================================================
   JLA persistent app shell — simplified (2026-08-31, per Sam's direction).

   Shows: brand · page label · Today · optional contextual data-links · Account.
   No live streak / capability / next-step chips — Today owns recommendations and
   Academy owns progress, so the global shell must not compete with them.

   Keeps the mount-based mechanism (it already covers ~50 converted pages): injects
   into <div id="jla-shell-mount">, or prepends one to <body>. The page label is
   derived from <title> ("… · Today" → "Today"). Optional data-links may add
   contextual destinations (e.g. Mastery on an arc). Today, Account, and anything
   that looks like a recommendation chip are filtered out so they cannot duplicate
   or compete with the primary CTA.

   Purely presentational — touches no learner API, no next-action selector, no
   server adapter, no daily-router.js (Codex's backend layer).
   ========================================================================== */
(function () {
  const esc = (v) => String(v == null ? '' : v).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  function mountPoint() {
    let el = document.getElementById('jla-shell-mount');
    if (!el) {
      el = document.createElement('div');
      el.id = 'jla-shell-mount';
      document.body.insertBefore(el, document.body.firstChild);
    }
    return el;
  }

  // The label is the most specific part of the page title: split on any separator (·, —, –, |),
  // drop brand segments, take the last. Handles titles that use "·" or "—" alike.
  function pageLabel() {
    const parts = (document.title || '')
      .split(/[·—–|]/).map((s) => s.trim()).filter(Boolean)
      .filter((s) => !/^ס?\s*Jewish Learning Academy$/i.test(s));
    return parts[parts.length - 1] || 'Learning';
  }

  function safeHref(value) {
    try {
      const url = new URL(String(value || ''), 'https://jla.local/');
      if (url.origin !== 'https://jla.local') return '';
      const path = url.pathname.replace(/^\//, '');
      if (!path || path.startsWith('/') || path.includes('://')) return '';
      return `${path}${url.search}${url.hash}`;
    } catch {
      return '';
    }
  }

  function contextualLinks(mount) {
    let links = [];
    try { links = JSON.parse(mount.getAttribute('data-links') || '[]'); } catch { links = []; }
    if (!Array.isArray(links)) return [];
    const reservedHref = /^(daily-router\.html|today\.html|daily\.html|profile\.html|sign-in\.html)(\?|#|$)/i;
    const reservedId = /^(accountAction)$/i;
    const reservedLabel = /^(today|account|today’s study|today's study|secure sign-in|return to today|my account)$/i;
    return links.filter((link) => {
      if (!link || typeof link !== 'object') return false;
      const href = safeHref(link.href);
      const label = String(link.label || '').trim();
      if (!href || !label) return false;
      if (reservedId.test(String(link.id || ''))) return false;
      if (reservedHref.test(href)) return false;
      if (reservedLabel.test(label)) return false;
      if (link.role === 'next' || link.chip) return false;
      if (/next step|recommend/i.test(label)) return false;
      return true;
    }).map((link) => ({ href: safeHref(link.href), label: String(link.label).trim(), id: link.id ? String(link.id) : '' }));
  }

  function render() {
    const mount = mountPoint();
    const extras = contextualLinks(mount).map((link) => (
      `<a${link.id ? ` id="${esc(link.id)}"` : ''} href="${esc(link.href)}">${esc(link.label)}</a>`
    )).join('');
    mount.innerHTML = `
      <div class="jla-shell">
        <div class="jla-shell-inner">
          <a class="jla-brand" href="seder.html">Jewish Learning <span>Academy</span></a>
          <span class="jla-shell-label">${esc(pageLabel())}</span>
          <nav class="jla-shell-nav">
            <a href="daily-router.html">Today</a>
            ${extras}
            <a id="accountAction" href="profile.html">Account</a>
          </nav>
        </div>
      </div>`;
    // hosted-sign-in-front-door.js may retarget #accountAction (sign-in vs. My account); it
    // early-returns when absent, so nothing breaks if it is not loaded.
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', render);
  else render();
})();
