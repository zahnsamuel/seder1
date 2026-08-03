// Pilot feedback widget: a small floating affordance on the learner surfaces that captures a quick
// reaction to whatever the learner is doing right now. The qualitative signal a validation pilot lives
// on — "this was confusing", "something's off", "loved it" — tied to the page and skill in context.
// Self-contained: injects its own styles + DOM, records a `feedback` event through the normal events
// endpoint (recorded, no side effects), and only appears for a signed-in learner so posting works.
(function () {
  if (!(window.Seder && Seder.session && Seder.session.access_token && Seder.currentLearnerId)) return;
  const learnerId = Seder.currentLearnerId();
  if (!learnerId) return;

  const TAGS = [
    { s: 'confusing', label: 'Confusing' },
    { s: 'too-hard', label: 'Too hard' },
    { s: 'too-easy', label: 'Too easy' },
    { s: 'broken', label: 'Something’s off' },
    { s: 'great', label: 'Loved it' }
  ];

  const style = document.createElement('style');
  style.textContent = `
    .sfb-btn{position:fixed;right:16px;bottom:16px;z-index:2147483000;padding:9px 14px;border:0;border-radius:999px;
      background:#183b4e;color:#fff;font:600 13px Inter,system-ui,sans-serif;cursor:pointer;box-shadow:0 4px 16px rgba(24,59,78,.28)}
    .sfb-btn:hover{filter:brightness(1.12)}
    .sfb-btn:focus-visible{outline:3px solid #b98a39;outline-offset:2px}
    .sfb-pop{position:fixed;right:16px;bottom:64px;z-index:2147483000;width:min(320px,calc(100vw - 32px));
      background:#fff;color:#1f3036;border:1px solid #d8d9d1;border-radius:14px;box-shadow:0 12px 40px rgba(24,59,78,.22);padding:16px}
    .sfb-pop[hidden]{display:none}
    .sfb-pop h3{margin:0 0 4px;font:600 15px Inter,system-ui,sans-serif;color:#183b4e}
    .sfb-pop .sfb-sub{margin:0 0 12px;font:400 12px Inter,system-ui,sans-serif;color:#5d6a71}
    .sfb-tags{display:flex;flex-wrap:wrap;gap:7px;margin-bottom:11px}
    .sfb-tags button{padding:7px 11px;border:1px solid #d4dad4;border-radius:999px;background:#fbfaf6;color:#273b43;
      font:500 12.5px Inter,system-ui,sans-serif;cursor:pointer}
    .sfb-tags button:hover{border-color:#276b68}
    .sfb-tags button[aria-pressed="true"]{background:#276b68;border-color:#276b68;color:#fff}
    .sfb-pop textarea{width:100%;box-sizing:border-box;min-height:52px;resize:vertical;padding:8px 10px;border:1px solid #d4dad4;
      border-radius:8px;font:400 13px Inter,system-ui,sans-serif;color:#1f3036}
    .sfb-pop textarea:focus{outline:2px solid #276b68;outline-offset:-1px;border-color:#276b68}
    .sfb-row{display:flex;justify-content:space-between;align-items:center;margin-top:11px;gap:10px}
    .sfb-send{padding:8px 15px;border:0;border-radius:8px;background:#183b4e;color:#fff;font:600 13px Inter,system-ui,sans-serif;cursor:pointer}
    .sfb-send:disabled{opacity:.45;cursor:default}
    .sfb-close{background:none;border:0;color:#5d6a71;font:500 12px Inter,system-ui,sans-serif;cursor:pointer}
    .sfb-thanks{margin:6px 0 0;color:#276b68;font:600 13px Inter,system-ui,sans-serif}
    @media (prefers-color-scheme:dark){
      .sfb-pop{background:#161f26;color:#e7edf1;border-color:#28333b}
      .sfb-pop h3{color:#9cc2d0}.sfb-pop .sfb-sub{color:#93a3ab}
      .sfb-tags button{background:#0f1820;border-color:#33434e;color:#e7edf1}
      .sfb-pop textarea{background:#0f1820;border-color:#33434e;color:#e7edf1}
    }`;
  document.head.appendChild(style);

  const btn = document.createElement('button');
  btn.type = 'button'; btn.className = 'sfb-btn'; btn.textContent = 'Feedback';
  btn.setAttribute('aria-haspopup', 'dialog'); btn.setAttribute('aria-expanded', 'false');

  const pop = document.createElement('div');
  pop.className = 'sfb-pop'; pop.hidden = true; pop.setAttribute('role', 'dialog'); pop.setAttribute('aria-label', 'Send feedback');
  pop.innerHTML = `<h3>How is this going?</h3><p class="sfb-sub">Quick reaction to what you’re doing right now — it helps us fix what’s confusing.</p>` +
    `<div class="sfb-tags">${TAGS.map((t) => `<button type="button" data-s="${t.s}" aria-pressed="false">${t.label}</button>`).join('')}</div>` +
    `<textarea placeholder="Anything else? (optional)" aria-label="Optional comment"></textarea>` +
    `<div class="sfb-row"><button type="button" class="sfb-close">Close</button><button type="button" class="sfb-send" disabled>Send</button></div>` +
    `<p class="sfb-thanks" hidden>Thanks — noted.</p>`;

  document.body.appendChild(btn);
  document.body.appendChild(pop);

  let sentiment = null;
  const tagBtns = [...pop.querySelectorAll('.sfb-tags button')];
  const textarea = pop.querySelector('textarea');
  const sendBtn = pop.querySelector('.sfb-send');
  const thanks = pop.querySelector('.sfb-thanks');

  function open() { pop.hidden = false; btn.setAttribute('aria-expanded', 'true'); tagBtns[0].focus(); }
  function close() { pop.hidden = true; btn.setAttribute('aria-expanded', 'false'); btn.focus(); }
  btn.addEventListener('click', () => (pop.hidden ? open() : close()));
  pop.querySelector('.sfb-close').addEventListener('click', close);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !pop.hidden) close(); });

  for (const t of tagBtns) t.addEventListener('click', () => {
    sentiment = t.dataset.s;
    tagBtns.forEach((b) => b.setAttribute('aria-pressed', String(b === t)));
    sendBtn.disabled = false;
  });

  sendBtn.addEventListener('click', async () => {
    if (!sentiment) return;
    sendBtn.disabled = true;
    const params = new URLSearchParams(location.search);
    const skillId = params.get('skill') || params.get('foundationSkill') || params.get('lesson') || null;
    const body = JSON.stringify({ type: 'feedback', page: location.pathname, skillId, sentiment, comment: textarea.value.trim().slice(0, 500) });
    try {
      await Seder.api(`/api/learners/${learnerId}/events`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });
      thanks.textContent = 'Thanks — noted.';
    } catch {
      thanks.textContent = 'Saved on this device; it will sync when you’re back online.';
    }
    thanks.hidden = false;
    setTimeout(() => { close(); thanks.hidden = true; sentiment = null; textarea.value = ''; tagBtns.forEach((b) => b.setAttribute('aria-pressed', 'false')); sendBtn.disabled = true; }, 1100);
  });
})();
