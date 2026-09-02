/* ==========================================================================
   Interactive lesson component — now wired to the REAL item bank.

   The earlier version of this file scored answers in the browser from a hardcoded
   key. That is both insecure (the client must never hold the answer) and fake (not
   real items). This version consumes the production Academy-session contract:

     GET  /api/jla/academy-session/:skillId          → authored item, answer key
                                                        stripped, choices shuffled
     POST /api/jla/academy-session/:skillId/answer    → server scores {choiceId},
                                                        records the capability
                                                        evidence for the learner,
                                                        returns {correct, feedback}

   Correctness is NEVER computed here. The server is authoritative and records the
   `answer_submitted` evidence event, so a completed lesson moves the learner's real
   capability state. Rendered entirely from jla-system.css components.

   Pass ?skill=<skillId> to practice a specific skill; defaults to a source-navigation
   item. Available skills live in data/jla-academy-sessions.json (source-family-001,
   mishnah-case-001, gemara-question-001, …).
   ========================================================================== */
(function () {
  const Seder = window.Seder = window.Seder || {};
  const learnerId = Seder.currentLearnerId ? Seder.currentLearnerId() : 'demo';
  const skillId = new URLSearchParams(location.search).get('skill') || 'source-family-001';

  const esc = (v) => String(v == null ? '' : v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const el = (id) => document.getElementById(id);
  const stage = el('stage');

  const sefariaLink = (w) => w.sourceUrl || `https://www.sefaria.org/search?q=${encodeURIComponent(w.sourceRef || '')}&tab=texts`;

  function renderLesson(session) {
    el('eyebrow').textContent = session.domain ? session.domain.replace(/-/g, ' ') : 'Source practice';
    el('title').textContent = session.title || 'Read a source';
    el('teaching').textContent = session.teachingMove || '';

    const w = session.sourceWindow || {};
    stage.innerHTML = `
      <div class="jla-card source-card">
        <div class="source-ref"><b>${esc(w.sourceRef || 'Source')}</b><a href="${esc(sefariaLink(w))}" target="_blank" rel="noopener">Open at Sefaria →</a></div>
        ${w.hebrew ? `<div class="jla-source-line"><div class="jla-source-he">${esc(w.hebrew)}</div></div>` : ''}
        ${w.translation ? `<p class="source-tr">${esc(w.translation)}</p>` : ''}
        ${w.context ? `<p class="source-context">${esc(w.context)}</p>` : ''}
      </div>
      <p class="prompt">${esc(session.prompt || 'Which first move fits this source?')}</p>
      <div id="choices">
        ${(session.choices || []).map((c) => `<button class="jla-choice" data-choice-id="${esc(c.id)}">${esc(c.text)}</button>`).join('')}
      </div>
      <div id="feedback" aria-live="polite"></div>`;

    let answered = false;
    stage.querySelectorAll('.jla-choice').forEach((btn) => {
      btn.addEventListener('click', () => { if (!answered) { answered = true; submit(btn, session); } });
    });
  }

  async function submit(btn, session) {
    stage.querySelectorAll('.jla-choice').forEach((b) => { b.disabled = true; });
    const fb = el('feedback');
    fb.className = 'jla-feedback';
    fb.textContent = 'Checking…';
    let result;
    try {
      // The server scores the choice and records the evidence. The client only reports the pick.
      const res = await Seder.api(`/api/jla/academy-session/${encodeURIComponent(skillId)}/answer`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ choiceId: btn.dataset.choiceId })
      });
      result = await res.json();
    } catch {
      fb.className = 'jla-feedback is-wrong';
      fb.textContent = 'Your result is ready locally; it will sync when your account is available.';
      return;
    }

    btn.classList.add(result.correct ? 'is-correct' : 'is-wrong');
    fb.className = `jla-feedback ${result.correct ? 'is-correct' : 'is-wrong'}`;
    // The server returns authored, complete feedback — show it as-is (no client prefix,
    // which would double up on feedback that already opens with "Yes."/"Not quite.").
    fb.textContent = result.feedback || (result.correct ? 'You made the move in this source.' : 'Carry the move into the next source and try again.');

    const advance = document.createElement('div');
    advance.className = 'advance';
    advance.innerHTML = `<a class="jla-btn jla-btn-primary" href="daily-router.html">Back to today →</a>`;
    stage.appendChild(advance);

    // Reflect the capability this evidence moves, in the shared state vocabulary.
    if (result.correct && result.evidenceStatement) {
      const chip = document.createElement('div');
      chip.style.marginTop = '18px';
      chip.innerHTML = `<span class="jla-chip is-secure"><b>Evidence recorded</b> ${esc(result.evidenceStatement)}</span>`;
      stage.appendChild(chip);
    }
  }

  function renderError() {
    el('title').textContent = 'No source ready for this skill';
    el('teaching').textContent = '';
    stage.innerHTML = `<p class="lesson-error">There is no authored source session for “${esc(skillId)}” yet. <a href="daily-router.html">Back to today →</a></p>`;
  }

  fetch(`/api/jla/academy-session/${encodeURIComponent(skillId)}`)
    .then((r) => (r.ok ? r.json() : null))
    .then((session) => { if (session && session.sourceWindow) renderLesson(session); else renderError(); })
    .catch(renderError);
})();
