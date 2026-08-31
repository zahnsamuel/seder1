const learnerId = Seder.currentLearnerId();
const params = new URLSearchParams(location.search);
const skillId = params.get('skill') || 'fnd-orient-source-type';
const $ = (selector) => document.querySelector(selector);
const escapeHtml = (value) => String(value || '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const fallback = { id: skillId, title: 'Make one transferable learning move', statement: 'You can make the move described by the source skill.', sourceContexts: [{ ref: 'A short Jewish source', genre: 'source' }], teachingMove: 'Name what you notice before trying to solve the whole text.', checks: ['Name the move and point to the part of the source that supports it.'], transfer: 'Carry the same move into a second genre.' };

const sourceLinkFor = (context) => context.url || `https://www.sefaria.org/search?q=${encodeURIComponent(context.ref)}&tab=texts`;

// ---- Scaffolded knowledge-point lesson (Math Academy Way): a skill's lesson is its knowledge points
// walked in order — introduce (see the move on a source), practice (make it, graded), transfer (carry
// it into a DIFFERENT source family). Per-KP answers are recorded (kp-<skill>-<n>) so remediation and
// mastery track the specific step, and the sources span families so "one literacy, many voices" is felt.
const KP = {
  introduce: { label: 'INTRODUCE · SEE THE MOVE', next: 'I can see it — practice →' },
  practice: { label: 'PRACTICE · MAKE THE MOVE', next: 'Transfer it →' },
  transfer: { label: 'TRANSFER · A NEW SOURCE', next: 'Finish →' }
};

function whyLine(skill, graph) {
  const skills = graph?.skills || [];
  const prereq = (skill.prerequisites || []).map((id) => skills.find((s) => s.id === id)?.title).filter(Boolean)[0];
  const unlock = skills.filter((s) => (s.prerequisites || []).includes(skill.id)).map((s) => s.title)[0];
  return `${prereq ? `Builds on ${prereq}` : 'A foundational move'}${unlock ? `, and unlocks ${unlock}.` : '.'}`;
}

function startScaffold(skill, graph, kpLayer, ctxLayer) {
  $('#title').textContent = skill.title;
  $('#statement').textContent = skill.statement;
  $('#why').textContent = whyLine(skill, graph);

  const kpByKind = Object.fromEntries((kpLayer?.knowledgePoints || []).filter((k) => k.skill === skill.id).map((k) => [k.kind, k]));
  const contexts = (ctxLayer?.contexts || []).filter((c) => c.skill === skill.id);
  const first = contexts[0] || { ref: skill.sourceContexts?.[0]?.ref || fallback.sourceContexts[0].ref, genre: skill.sourceContexts?.[0]?.genre || 'source', family: 'source' };
  // Transfer lands in a genuinely different source family when the skill has one.
  const transferCtx = contexts.find((c) => c.family !== first.family) || contexts[1] || first;

  const steps = [
    { kind: 'introduce', context: first, guidance: kpByKind.introduce?.statement || skill.teachingMove },
    { kind: 'practice', context: first, guidance: kpByKind.practice?.statement || skill.checks?.[0] || fallback.checks[0] },
    { kind: 'transfer', context: transferCtx, guidance: kpByKind.transfer?.statement || skill.transfer }
  ];

  let i = 0;
  const stepEls = [...document.querySelectorAll('#kp-steps li')];
  const advance = $('#advance');
  advance.onclick = () => { if (i < steps.length - 1) { i += 1; renderStep(); } else finish(); };

  function renderStep() {
    const step = steps[i];
    const context = step.context;
    stepEls.forEach((el, n) => { el.classList.toggle('done', n < i); el.classList.toggle('current', n === i); });
    $('#step-label').textContent = KP[step.kind].label;
    $('#source-ref').textContent = context.ref;
    $('#source-setting').textContent = `${context.genre} · ${context.family} family. Read this window for the shape of the move, not for total mastery.`;
    $('#source-link').href = sourceLinkFor(context);
    $('#source-hebrew').hidden = true; $('#source-translation').hidden = true;
    $('#feedback').className = ''; $('#feedback').textContent = '';
    advance.disabled = true; advance.textContent = KP[step.kind].next;

    if (step.kind === 'introduce') {
      $('#teaching-move').textContent = '';
      $('#check-title').textContent = 'See how the move works before you make it yourself.';
      $('#choices').innerHTML = `<button class="jla-choice reveal" type="button">Show me the move on ${escapeHtml(context.ref)}</button>`;
      $('#choices .jla-choice').addEventListener('click', (e) => {
        e.target.disabled = true;
        $('#teaching-move').textContent = step.guidance;
        $('#feedback').textContent = 'That is the move. Now make it yourself.';
        advance.disabled = false;
      });
    } else if (step.kind === 'practice') {
      $('#teaching-move').textContent = skill.teachingMove;
      $('#check-title').textContent = step.guidance;
      const choices = [`Make the move: ${skill.statement}`, 'Skip the source and memorise its title instead.', 'Give a practical verdict before reading what the source is doing.'];
      $('#choices').innerHTML = choices.map((choice, index) => `<button class="jla-choice" type="button" data-choice="${index}">${escapeHtml(choice)}</button>`).join('');
      let answered = false;
      document.querySelectorAll('#choices .jla-choice').forEach((button) => button.addEventListener('click', async () => {
        if (answered) return; answered = true;
        const correct = button.dataset.choice === '0';
        button.classList.add(correct ? 'is-correct' : 'is-wrong');
        if (!correct) document.querySelector('[data-choice="0"]').classList.add('is-correct');
        document.querySelectorAll('#choices .jla-choice').forEach((b) => { b.disabled = true; });
        $('#feedback').className = `jla-feedback ${correct ? 'is-correct' : 'is-wrong'}`;
        $('#feedback').textContent = correct ? 'Yes — that is the move made visible in this source.' : 'The highlighted choice is the move. Notice it, then carry it on.';
        advance.disabled = false;
        await record(`kp-${skillId}-2`, correct, context.ref);
      }));
    } else {
      $('#teaching-move').textContent = `Carry the same move into a different source family (${escapeHtml(context.family)}).`;
      $('#check-title').textContent = `In ${context.ref} — can you make the move here too?`;
      const choices = ['Yes — I made the move in this new source', 'Not yet — show me how it carries over'];
      $('#choices').innerHTML = choices.map((choice, index) => `<button class="jla-choice" type="button" data-choice="${index}">${escapeHtml(choice)}</button>`).join('');
      let answered = false;
      document.querySelectorAll('#choices .jla-choice').forEach((button) => button.addEventListener('click', async () => {
        if (answered) return; answered = true;
        const correct = button.dataset.choice === '0';
        button.classList.add(correct ? 'is-correct' : 'is-wrong');
        document.querySelectorAll('#choices .jla-choice').forEach((b) => { b.disabled = true; });
        $('#feedback').className = `jla-feedback ${correct ? 'is-correct' : 'is-wrong'}`;
        $('#feedback').textContent = correct ? 'That is transfer — the move held in an unfamiliar family.' : `Here is how it carries over: ${skill.transfer}`;
        advance.disabled = false;
        await record(`kp-${skillId}-3`, correct, context.ref);
      }));
    }
  }

  function finish() {
    $('#step').hidden = true;
    document.querySelector('#kp-steps').hidden = true;
    stepEls.forEach((el) => el.classList.add('done'));
    $('#complete-title').textContent = `You practised “${skill.title}” across the canon.`;
    $('#complete-copy').textContent = 'Introduce, practice, transfer — you saw the move, made it, and carried it into a new source family. Your map has moved.';
    $('#complete').hidden = false;
    $('#complete').scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  renderStep();
}

async function record(knowledgePointId, correct, sourceContext) {
  try {
    // Per-knowledge-point answer: updates the skill's mastery and tracks struggle at THIS knowledge
    // point, so remediation can target the specific step's key prerequisite.
    await Seder.api(`/api/learners/${learnerId}/events`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'answer_submitted', skillId, foundationSkillId: skillId, knowledgePointId, correct, sourceContext, competency: 'sourceReasoning' }) });
  } catch { $('#feedback').textContent += ' Your result is ready locally; it will sync when your account is available.'; }
}

// ---- Real content links (from the content map): actual sources that exercise this skill. ----
function renderRealContent(map) {
  const rows = map?.bySkill?.[skillId] || [];
  if (!rows.length) return;
  const seenUnit = new Set();
  const units = rows.filter((row) => !seenUnit.has(row.unit) && seenUnit.add(row.unit));
  const picks = [];
  const genres = new Set();
  for (const row of units) { if (!genres.has(row.genre)) { genres.add(row.genre); picks.push(row); } if (picks.length >= 3) break; }
  for (const row of units) { if (picks.length >= 3) break; if (!picks.includes(row)) picks.push(row); }
  $('#real-content-list').innerHTML = picks.map((row) =>
    `<li><a href="${escapeHtml(row.route)}">${escapeHtml(row.label)}</a><span>${escapeHtml(row.genre)} · ${escapeHtml(row.ref)}</span></li>`).join('');
  $('#real-content').hidden = false;
}

// ---- JLA graduation-slice session (server-scored, answer key stripped): a single designed source
// window + real, pre-shuffled choices. Kept intact for the graduation/capability loop; shown without
// the 3-step scaffold (it is one authored question, not a foundation-skill lesson). ----
function renderJlaSession(session) {
  document.querySelector('#kp-steps').hidden = true;
  const sourceWindow = session.sourceWindow;
  $('#title').textContent = session.title;
  $('#statement').textContent = session.evidencePreview;
  $('#why').textContent = session.teachingMove;
  $('#step-label').textContent = 'TODAY’S SOURCE WINDOW';
  $('#source-ref').textContent = sourceWindow.sourceRef;
  if (sourceWindow.hebrew) { const el = $('#source-hebrew'); el.textContent = sourceWindow.hebrew; el.hidden = false; }
  if (sourceWindow.translation) { const el = $('#source-translation'); el.textContent = sourceWindow.translation; el.hidden = false; }
  $('#source-setting').textContent = sourceWindow.context || 'Read this source window for the shape of the move, not for total mastery.';
  $('#teaching-move').textContent = session.teachingMove;
  $('#source-link').href = sourceWindow.sourceUrl;
  $('#check-title').textContent = session.prompt;
  $('#choices').innerHTML = session.choices.map((choice) =>
    `<button class="jla-choice" type="button" data-choice-id="${escapeHtml(choice.id)}">${escapeHtml(choice.text)}</button>`).join('');
  const advance = $('#advance');
  advance.textContent = 'Continue to Today →';
  advance.onclick = () => { location.href = 'daily-router.html'; };
  document.querySelectorAll('.jla-choice').forEach((button) => button.addEventListener('click', () => chooseJla(button, session)));
}

let jlaAnswered = false;
async function chooseJla(button, session) {
  if (jlaAnswered) return;
  jlaAnswered = true;
  document.querySelectorAll('.jla-choice').forEach((item) => { item.disabled = true; });
  $('#advance').disabled = false;
  try {
    // The server scores the choice, records the graduation evidence, and returns the feedback —
    // correctness is never computed or asserted by the client.
    const response = await Seder.api(`/api/jla/academy-session/${encodeURIComponent(session.skillId)}/answer`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ choiceId: button.dataset.choiceId }) });
    const result = await response.json();
    button.classList.add(result.correct ? 'is-correct' : 'is-wrong');
    $('#feedback').className = `jla-feedback ${result.correct ? 'is-correct' : 'is-wrong'}`;
    $('#feedback').textContent = result.feedback || (result.correct ? 'Good. You made the move visible in one source window.' : 'Not quite — carry the move into the next source and try again.');
  } catch { $('#feedback').textContent = 'Your result is ready locally; it will sync when your account is available.'; }
}

// A JLA slice session (source-family-001…) is one authored, server-scored question; anything else is a
// foundation-graph skill (fnd-*) — the scaffolded knowledge-point lesson.
Promise.all([
  fetch(`/api/jla/academy-session/${encodeURIComponent(skillId)}`).then((response) => (response.ok ? response.json() : null)).catch(() => null),
  fetch('data/foundation-skill-graph.json').then((response) => (response.ok ? response.json() : null)).catch(() => null),
  fetch('data/foundation-knowledge-points.json').then((response) => (response.ok ? response.json() : null)).catch(() => null),
  fetch('data/foundation-content-contexts.json').then((response) => (response.ok ? response.json() : null)).catch(() => null),
  fetch('data/foundation-content-map.json').then((response) => (response.ok ? response.json() : null)).catch(() => null)
]).then(([jlaSession, graph, kpLayer, ctxLayer, map]) => {
  if (jlaSession && jlaSession.sourceWindow) {
    renderJlaSession(jlaSession);
  } else {
    const skill = graph?.skills.find((item) => item.id === skillId) || fallback;
    startScaffold(skill, graph, kpLayer, ctxLayer);
  }
  renderRealContent(map);
});
