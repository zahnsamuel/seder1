/* ==========================================================================
   Interactive lesson prototype — priority #4 of the UI consolidation.

   Proves the "learn by doing" pattern (the thing Brilliant does and JLA's lessons
   mostly don't yet): the skill "Notice when a source is asking, not telling" is
   taught by having the learner *label* real lines, not read about labelling them.
   Self-contained on purpose so it runs as a pattern reference; a production version
   would pull items from the item bank and post evidence to /api/learners.

   Built entirely from jla-system.css components (.jla-choice / .jla-feedback /
   .jla-meter), so it inherits the design system with no bespoke styling.
   ========================================================================== */
(function () {
  // Authentic Talmudic lines chosen so the asking/telling signal is legible from a
  // single word. `why` names that signal — the transferable cue, not the translation.
  const ITEMS = [
    {
      he: 'מְנָא הָנֵי מִילֵּי?',
      en: '“From where are these things derived?”',
      answer: 'question',
      why: 'מנא — “from where” — is the Gemara turning to ask for a source. A telling line never opens this way.'
    },
    {
      he: 'תָּנוּ רַבָּנַן',
      en: '“The Rabbis taught…”',
      answer: 'statement',
      why: 'תנו רבנן introduces a teaching being stated. It sets up what follows; it asks nothing.'
    },
    {
      he: 'מַאי טַעְמָא?',
      en: '“What is the reason?”',
      answer: 'question',
      why: 'מאי — “what” — is a demand for a reason. The line is asking, and expects a reason in reply.'
    },
    {
      he: 'שֶׁנֶּאֱמַר: שְׁמַע יִשְׂרָאֵל',
      en: '“…as it is stated: Hear, O Israel.”',
      answer: 'statement',
      why: 'שנאמר brings a proof-text to support a claim already made — telling, not asking.'
    }
  ];

  const stage = document.getElementById('stage');
  const meter = document.getElementById('meter');
  const count = document.getElementById('count');
  let i = 0;
  let correct = 0;

  function renderItem() {
    const item = ITEMS[i];
    count.textContent = `${i + 1} / ${ITEMS.length}`;
    meter.style.width = `${Math.round(((i) / ITEMS.length) * 100) + 12}%`;
    stage.innerHTML = `
      <div class="prompt">Line ${i + 1} — asking or telling?</div>
      <div class="jla-source-line"><div class="jla-source-he">${item.he}</div></div>
      <p class="line-en">${item.en}</p>
      <div class="choices">
        <button class="jla-choice" data-choice="question">A question — the source is asking</button>
        <button class="jla-choice" data-choice="statement">A statement — the source is telling</button>
      </div>
      <div id="fb" aria-live="polite"></div>`;
    stage.querySelectorAll('.jla-choice').forEach((btn) => {
      btn.addEventListener('click', () => choose(btn));
    });
  }

  function choose(btn) {
    const item = ITEMS[i];
    const picked = btn.dataset.choice;
    const right = picked === item.answer;
    if (right) correct += 1;
    stage.querySelectorAll('.jla-choice').forEach((b) => {
      b.disabled = true;
      if (b.dataset.choice === item.answer) b.classList.add('is-correct');
      else if (b === btn) b.classList.add('is-wrong');
    });
    const fb = document.getElementById('fb');
    fb.className = `jla-feedback ${right ? 'is-correct' : 'is-wrong'}`;
    fb.innerHTML = `<strong>${right ? 'Yes.' : 'Not quite.'}</strong> ${item.why}`;
    const advance = document.createElement('div');
    advance.className = 'advance';
    advance.innerHTML = `<button class="jla-btn jla-btn-primary" id="next">${i + 1 < ITEMS.length ? 'Next line →' : 'See what you earned →'}</button>`;
    stage.appendChild(advance);
    document.getElementById('next').addEventListener('click', () => {
      i += 1;
      if (i < ITEMS.length) renderItem();
      else finish();
    });
  }

  function finish() {
    meter.style.width = '100%';
    count.textContent = `${ITEMS.length} / ${ITEMS.length}`;
    // Report in the capability vocabulary, not a score. This is the state a demonstrated
    // move enters first; the shared shell would then surface it as a live capability.
    const secured = correct >= 3;
    stage.className = 'jla-card done-card';
    stage.innerHTML = `
      <span class="jla-eyebrow">Capability</span>
      <h2 class="jla-display" style="font-size:1.7rem;margin:8px 0 6px;">Notice when a source is asking</h2>
      <p class="line-en" style="max-width:46ch;margin:0 auto;">You labelled ${correct} of ${ITEMS.length} lines by their signal word${secured ? ' — enough to carry this move on your own.' : '. One more pass will secure it.'}</p>
      <span class="jla-chip ${secured ? 'is-secure' : 'is-emerging'}"><b>${secured ? 'Secure' : 'Emerging'}</b> ${secured ? 'can make the move on your own' : 'can make the move with support'}</span>
      <div class="advance" style="justify-content:center;margin-top:22px;">
        <a class="jla-btn jla-btn-ghost" href="jla-practice.html" style="margin-right:10px;">Practice again</a>
        <a class="jla-btn jla-btn-primary" href="daily-router.html">Back to today →</a>
      </div>`;
  }

  renderItem();
})();
