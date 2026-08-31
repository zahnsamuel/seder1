/* ==========================================================================
   JLA persistent app shell — priority #2 of the UI consolidation.

   Renders one consistent top bar on every surface that opts in, carrying the
   learner's live state (rhythm, capabilities secured) and the single next step,
   so the learner always knows where they are and what to do next.

   The critique it answers: today every page is a standalone document with no
   persistent chrome, and the hub greets a new learner with "0 DAY RHYTHM /
   0 CAPABILITIES" — a demotivating empty scoreboard. This shell never shows a
   dead zero: before there is progress it shows an inviting first-run state.

   Usage on a converted page:
     <link rel="stylesheet" href="jla-system.css">
     <div id="jla-shell-mount"></div>
     ... after seder-auth.js + capability-state.js ...
     <script src="jla-shell.js"></script>
   With no mount element present it injects itself as the first child of <body>.
   Depends on Seder.api / Seder.currentLearnerId / Seder.summarizeCapabilities
   (seder-auth.js + capability-state.js); degrades to a brand-only bar without them.
   ========================================================================== */
(function () {
  const Seder = window.Seder = window.Seder || {};

  function mountPoint() {
    let el = document.getElementById('jla-shell-mount');
    if (!el) {
      el = document.createElement('div');
      el.id = 'jla-shell-mount';
      document.body.insertBefore(el, document.body.firstChild);
    }
    return el;
  }

  // Static skeleton — visible instantly, before any network. Never shows a raw 0.
  function skeleton() {
    return `
      <div class="jla-shell">
        <div class="jla-shell-inner">
          <a class="jla-brand" href="seder.html">Jewish Learning <span>Academy</span></a>
          <div class="jla-stat is-fresh" data-stat="rhythm"><b>Day 1</b><small>Your rhythm</small></div>
          <div class="jla-stat is-fresh" data-stat="caps"><b>In reach</b><small>Capabilities</small></div>
          <a class="jla-shell-next" href="daily-router.html"><span class="dot"></span><span class="label">Today's step</span></a>
        </div>
      </div>`;
  }

  function setStat(root, key, { value, label, fresh }) {
    const stat = root.querySelector(`[data-stat="${key}"]`);
    if (!stat) return;
    stat.classList.toggle('is-fresh', Boolean(fresh));
    stat.querySelector('b').textContent = value;
    stat.querySelector('small').textContent = label;
  }

  function setNext(root, { text, href }) {
    const next = root.querySelector('.jla-shell-next');
    if (!next) return;
    if (href) next.href = href;
    const label = next.querySelector('.label');
    if (label) label.textContent = text;
  }

  async function hydrate(root) {
    // Hosted mode with no session yet: keep the pitch, point the one step at sign-in.
    try {
      const config = await Seder.config?.();
      const needsAuth = config && (config.mode === 'token' || (config.supabaseUrl && config.supabaseAnonKey));
      if (needsAuth && !Seder.session?.access_token) {
        setNext(root, { text: 'Start learning', href: 'sign-in.html?next=diagnostic.html' });
        return;
      }
    } catch { /* config optional — continue with best effort */ }

    const learnerId = Seder.currentLearnerId ? Seder.currentLearnerId() : 'demo';
    let learner, decision;
    try {
      [learner, decision] = await Promise.all([
        Seder.api(`/api/learners/${learnerId}`).then((r) => r.ok ? r.json() : Promise.reject()),
        Seder.api(`/api/learners/${learnerId}/recommendation`).then((r) => r.ok ? r.json() : null).catch(() => null)
      ]);
    } catch {
      return; // leave the inviting skeleton in place rather than flashing zeros
    }

    // Rhythm: a real streak reads as a number; a learner who has not begun reads
    // as "Day 1" (starting now), never "0".
    const streak = learner.dailyStreak || 0;
    setStat(root, 'rhythm', streak > 0
      ? { value: streak, label: streak === 1 ? 'Day rhythm' : 'Day rhythm', fresh: false }
      : { value: 'Day 1', label: 'Starts today', fresh: true });

    // Capabilities: count what the learner can now do on their own. Before the
    // first is secured, show "In reach", not "0".
    const evidence = learner.capabilityEvidence || [];
    const counts = Seder.summarizeCapabilities ? Seder.summarizeCapabilities(evidence) : { secure: 0, transferable: 0, durable: 0 };
    const onOwn = (counts.secure || 0) + (counts.transferable || 0) + (counts.durable || 0);
    setStat(root, 'caps', onOwn > 0
      ? { value: onOwn, label: onOwn === 1 ? 'Capability' : 'Capabilities', fresh: false }
      : { value: 'In reach', label: 'First capability', fresh: true });

    // The one next step, everywhere.
    const rec = decision?.recommendation;
    if (rec) {
      const placement = rec.kind === 'placement' || !learner.placement;
      setNext(root, { text: placement ? 'Find your start' : 'Today\'s step', href: rec.url || 'daily-router.html' });
    }
  }

  function render() {
    const root = mountPoint();
    root.innerHTML = skeleton();
    hydrate(root.querySelector('.jla-shell'));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }
})();
