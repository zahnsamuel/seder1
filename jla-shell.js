/* ==========================================================================
   JLA persistent app shell — simplified (2026-08-31, per Sam's direction).

   Shows ONLY: brand · page label · Today · Account. No live streak / capability /
   next-step chips — Today owns recommendations and Academy owns progress, so the
   global shell must not compete with them. Keeps the mount-based mechanism (it
   already covers ~50 converted pages): injects into <div id="jla-shell-mount">,
   or prepends one to <body>. The page label is derived from <title> ("… · Today"
   → "Today"). Purely presentational — touches no learner API, no next-action
   selector, no server adapter, no daily-router.js (Codex's backend layer).
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

  function render() {
    mountPoint().innerHTML = `
      <div class="jla-shell">
        <div class="jla-shell-inner">
          <a class="jla-brand" href="seder.html">Jewish Learning <span>Academy</span></a>
          <span class="jla-shell-label">${esc(pageLabel())}</span>
          <nav class="jla-shell-nav">
            <a href="daily-router.html">Today</a>
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
