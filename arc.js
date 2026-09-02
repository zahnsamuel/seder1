/* Phase-4 arc template client. Fetches ONE tractate from /api/arc/:tractate (answer key stripped
   server-side) and renders it — replacing the 45 bespoke *-arc.html/.js pairs. Two shapes:
   - index (berakhot): sessions are link-outs to separate session pages.
   - interactive (the other 44): each session is a server-scored question (source + prompt + choices).
   Correctness is never computed here; POST /api/arc/:tractate/answer scores it. */
(function () {
  const Seder = window.Seder = window.Seder || {};
  const tractate = new URLSearchParams(location.search).get('tractate') || 'berakhot';
  const esc = (v) => String(v == null ? '' : v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const el = (id) => document.getElementById(id);

  fetch(`/api/arc/${encodeURIComponent(tractate)}`)
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error('no arc'))))
    .then(render)
    .catch(() => {
      el('arc-title').textContent = 'Arc not found';
      el('arc-sessions').innerHTML = `<p class="lesson-error">No arc for “${esc(tractate)}”. <a href="seder.html">Back to the Academy →</a></p>`;
    });

  function render(arc) {
    if (arc.pageTitle) document.title = arc.pageTitle;
    el('arc-kicker').textContent = arc.kicker || '';
    el('arc-title').textContent = arc.title || tractate;
    el('arc-intro').textContent = arc.intro || '';
    if (arc.outcome && arc.outcome.heading) {
      el('arc-outcome').hidden = false;
      el('arc-outcome').innerHTML = `<span class="l">Outcome</span><h2>${esc(arc.outcome.heading)}</h2>${arc.outcome.body ? `<p>${esc(arc.outcome.body)}</p>` : ''}`;
    }
    el('arc-count').textContent = `${arc.sessions.length} ${arc.shape === 'index' ? 'sessions' : 'source moves'}`;
    const target = el('arc-sessions');
    target.innerHTML = '';
    arc.sessions.forEach((s, i) => target.appendChild(arc.shape === 'index' ? indexCard(s) : lessonCard(s, i)));
  }

  // Index arc: a card that links out to the session's own page.
  function indexCard(s) {
    const card = document.createElement('article');
    card.className = 'arc-card';
    card.innerHTML = `<h3>${esc(s.title)}</h3><p class="copy">${esc(s.copy || '')}</p>` +
      (s.url ? `<a class="open" href="${esc(s.url)}">Open →</a>` : '');
    return card;
  }

  // Interactive arc: a server-scored question rendered from the design system.
  function lessonCard(s, index) {
    const card = document.createElement('article');
    card.className = 'arc-card';
    card.innerHTML = `
      ${s.mode ? `<span class="kicker">${esc(s.mode)}</span>` : ''}
      <h3>${esc(s.title || s.short || 'Source move')}</h3>
      ${s.ref || s.hebrew || s.translation ? `<div class="arc-source jla-source-line">
        ${s.ref ? `<div class="jla-eyebrow" style="margin-bottom:6px;">${esc(s.ref)}</div>` : ''}
        ${s.hebrew ? `<div class="jla-source-he">${esc(s.hebrew)}</div>` : ''}
        ${s.translation ? `<p class="tr">${esc(s.translation)}</p>` : ''}
      </div>` : ''}
      <p class="arc-prompt">${esc(s.prompt || '')}</p>
      <div class="choices">${(s.choices || []).map((c) => `<button class="jla-choice" data-choice-id="${esc(c.id)}">${esc(c.text)}</button>`).join('')}</div>
      <div class="fb" aria-live="polite"></div>`;
    let answered = false;
    card.querySelectorAll('.jla-choice').forEach((btn) => btn.addEventListener('click', () => {
      if (answered) return; answered = true;
      submit(card, btn, index);
    }));
    return card;
  }

  async function submit(card, btn, index) {
    card.querySelectorAll('.jla-choice').forEach((b) => { b.disabled = true; });
    const fb = card.querySelector('.fb');
    fb.className = 'fb jla-feedback';
    fb.textContent = 'Checking…';
    let result;
    try {
      const res = await Seder.api(`/api/arc/${encodeURIComponent(tractate)}/answer`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionIndex: index, choiceId: btn.dataset.choiceId })
      });
      result = await res.json();
    } catch {
      fb.className = 'fb jla-feedback is-wrong';
      fb.textContent = 'Your result is ready locally; it will sync when your account is available.';
      return;
    }
    btn.classList.add(result.correct ? 'is-correct' : 'is-wrong');
    fb.className = `fb jla-feedback ${result.correct ? 'is-correct' : 'is-wrong'}`;
    fb.textContent = result.feedback || (result.correct ? 'Correct.' : 'Not quite.');
  }
})();
