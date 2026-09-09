import {
  FALLBACK_SKILL,
  STEP_CHROME,
  buildScaffoldSteps,
  frameJlaSession,
  isRetrievalMode,
  normalizeSessionMode,
  practiceLine,
  whyLine
} from './academy-session-lesson.mjs';

const learnerId = Seder.currentLearnerId();
const params = new URLSearchParams(location.search);
const skillId = params.get('skill') || 'fnd-orient-source-type';
const sessionMode = normalizeSessionMode(params.get('mode'));
const chromeFor = (kind) => STEP_CHROME[kind] || STEP_CHROME.introduce;
const $ = (selector) => document.querySelector(selector);
const escapeHtml = (value) => String(value || '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));

function fillSourceCard(sourceWindow = {}) {
  $('#source-ref').textContent = sourceWindow.sourceRef || 'Source';
  const hebrew = $('#source-hebrew');
  const translation = $('#source-translation');
  if (sourceWindow.hebrew) { hebrew.textContent = sourceWindow.hebrew; hebrew.hidden = false; }
  else { hebrew.textContent = ''; hebrew.hidden = true; }
  if (sourceWindow.translation) { translation.textContent = sourceWindow.translation; translation.hidden = false; }
  else { translation.textContent = ''; translation.hidden = true; }
  $('#source-setting').textContent = sourceWindow.context || 'Read this source on the page, then answer the question below.';
  const link = $('#source-link');
  const footer = $('#source-footer');
  const url = sourceWindow.sourceUrl;
  const hasUrl = Boolean(url) && url !== '#';
  link.href = hasUrl ? url : '#';
  link.hidden = !hasUrl;
  if (footer) footer.hidden = !hasUrl;
}

function renderChoices(choices, onPick) {
  $('#choices').innerHTML = choices.map((choice) =>
    `<button class="jla-choice" type="button" data-choice-id="${escapeHtml(choice.id)}">${escapeHtml(choice.text)}</button>`).join('');
  document.querySelectorAll('#choices .jla-choice').forEach((button) => {
    button.addEventListener('click', () => onPick(button));
  });
}

function fillTeach(step = {}) {
  const block = $('#teach-block');
  const copy = $('#teach-copy');
  if (!block || !copy) return;
  if (step.teach) {
    copy.textContent = step.teach;
    block.hidden = false;
  } else {
    copy.textContent = '';
    block.hidden = true;
  }
}

function showAsk(visible) {
  const panel = $('#ask-panel');
  if (panel) panel.hidden = !visible;
}

function startScaffold(skill, graph, kpLayer, ctxLayer, authoredBank, excerpts, teachBank, mode = 'introduce') {
  $('#title').textContent = skill.title;
  $('#statement').textContent = practiceLine(skill.statement);
  $('#why').textContent = whyLine(skill, graph);

  const steps = buildScaffoldSteps({ skill, graph, kpLayer, ctxLayer, authoredBank, excerpts, teachBank, mode });
  const retrieval = isRetrievalMode(mode) && steps.length === 1;
  const eyebrow = document.querySelector('.jla-main > .jla-eyebrow');
  if (eyebrow && retrieval) {
    eyebrow.textContent = mode === 'welcome-back'
      ? 'WELCOME BACK · ONE SHORT CHECK'
      : 'RETRIEVE · ONE SKILL · ONE SOURCE';
  }
  let i = 0;
  let awaitingAsk = false;
  const stepEls = [...document.querySelectorAll('#kp-steps li')];
  const advance = $('#advance');
  if (retrieval) {
    stepEls.forEach((el, n) => { if (n > 0) el.hidden = true; });
    const label = stepEls[0]?.querySelector('span');
    const small = stepEls[0]?.querySelector('small');
    if (label) label.textContent = mode === 'welcome-back' ? 'Welcome back' : 'Retrieve';
    if (small) small.textContent = 'see it';
  }

  const goNext = () => { if (i < steps.length - 1) { i += 1; renderStep(); } else finish(); };

  advance.onclick = () => {
    if (awaitingAsk) {
      awaitingAsk = false;
      revealAsk();
      return;
    }
    goNext();
  };

  function revealAsk() {
    showAsk(true);
    advance.disabled = true;
    advance.textContent = chromeFor(steps[i].kind).next;
    $('#check-title').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function renderStep() {
    const step = steps[i];
    const context = step.context;
    stepEls.forEach((el, n) => {
      el.classList.toggle('done', n < i);
      el.classList.toggle('is-done', n < i);
      el.classList.toggle('current', n === i);
      el.classList.toggle('is-current', n === i);
      el.classList.toggle('is-upcoming', n > i);
    });
    const chrome = chromeFor(step.kind);
    $('#step-label').textContent = chrome.label;
    fillSourceCard(step.sourceWindow);
    fillTeach(step);
    const guidance = $('#teaching-move');
    guidance.textContent = step.guidance || '';
    guidance.hidden = !step.guidance;
    $('#check-title').textContent = step.prompt;
    $('#feedback').className = '';
    $('#feedback').textContent = '';

    if (step.holdAsk) {
      awaitingAsk = true;
      showAsk(false);
      advance.disabled = false;
      advance.textContent = chrome.continueTeach;
    } else {
      awaitingAsk = false;
      showAsk(true);
      advance.disabled = true;
      advance.textContent = chrome.next;
    }

    let answered = false;
    renderChoices(step.choices, async (button) => {
      if (answered || awaitingAsk) return;
      answered = true;
      const correct = button.dataset.choiceId === step.correctId;
      button.classList.add(correct ? 'is-correct' : 'is-wrong');
      if (!correct) {
        const right = document.querySelector(`[data-choice-id="${step.correctId}"]`);
        if (right) right.classList.add('is-correct');
      }
      document.querySelectorAll('#choices .jla-choice').forEach((item) => { item.disabled = true; });
      $('#feedback').className = `jla-feedback ${correct ? 'is-correct' : 'is-wrong'}`;
      $('#feedback').textContent = correct ? step.feedback.correct : step.feedback.incorrect;
      advance.disabled = false;
      const knowledgePointId = step.kind === 'practice' ? `kp-${skillId}-2` : step.kind === 'transfer' ? `kp-${skillId}-3` : `kp-${skillId}-1`;
      await record(knowledgePointId, correct, context.ref);
    });
  }

  function finish() {
    $('#step').hidden = true;
    document.querySelector('#kp-steps').hidden = true;
    stepEls.forEach((el) => { el.classList.add('done', 'is-done'); el.classList.remove('current', 'is-current', 'is-upcoming'); });
    if (retrieval) {
      $('#complete-title').textContent = `You brought “${skill.title}” back into reach.`;
      $('#complete-copy').textContent = 'You saw the skill on a source, then answered. Your map has moved.';
    } else {
      $('#complete-title').textContent = `You practised “${skill.title}” across the canon.`;
      $('#complete-copy').textContent = 'You saw the skill on a source, tried it, and carried it into a new source. Your map has moved.';
    }
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

function renderJlaSession(session) {
  document.querySelector('#kp-steps').hidden = true;
  const view = frameJlaSession(session);
  const sourceWindow = view.sourceWindow;
  $('#title').textContent = view.title;
  $('#statement').textContent = view.practiceLine;
  $('#why').textContent = view.why;
  $('#step-label').textContent = view.stepLabel;
  fillSourceCard(sourceWindow);
  $('#teaching-move').textContent = view.guidance;
  $('#check-title').textContent = view.prompt;
  const advance = $('#advance');
  advance.textContent = 'Continue to Today →';
  advance.onclick = () => { location.href = 'daily-router.html'; };
  renderChoices(view.choices, (button) => chooseJla(button, session));
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
    $('#feedback').textContent = result.feedback || (result.correct ? 'Good. That reading fits this source window.' : 'Not quite — look back at the source and try the next window.');
  } catch { $('#feedback').textContent = 'Your result is ready locally; it will sync when your account is available.'; }
}

Promise.all([
  fetch(`/api/jla/academy-session/${encodeURIComponent(skillId)}`).then((response) => (response.ok ? response.json() : null)).catch(() => null),
  fetch('data/foundation-skill-graph.json').then((response) => (response.ok ? response.json() : null)).catch(() => null),
  fetch('data/foundation-knowledge-points.json').then((response) => (response.ok ? response.json() : null)).catch(() => null),
  fetch('data/foundation-content-contexts.json').then((response) => (response.ok ? response.json() : null)).catch(() => null),
  fetch('data/foundation-content-map.json').then((response) => (response.ok ? response.json() : null)).catch(() => null),
  fetch('data/foundation-authored-items.json').then((response) => (response.ok ? response.json() : null)).catch(() => null),
  fetch('data/foundation-source-excerpts.json').then((response) => (response.ok ? response.json() : null)).catch(() => null),
  fetch('data/foundation-teach.json').then((response) => (response.ok ? response.json() : null)).catch(() => null)
]).then(([jlaSession, graph, kpLayer, ctxLayer, map, authoredFile, excerpts, teachBank]) => {
  if (jlaSession && jlaSession.sourceWindow) {
    renderJlaSession(jlaSession);
  } else {
    const skill = graph?.skills.find((item) => item.id === skillId) || { ...FALLBACK_SKILL, id: skillId };
    const authoredBank = authoredFile?.items?.[skillId] || [];
    startScaffold(skill, graph, kpLayer, ctxLayer, authoredBank, excerpts, teachBank, sessionMode);
  }
  renderRealContent(map);
});
