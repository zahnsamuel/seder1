const learnerId = Seder.currentLearnerId();
const params = new URLSearchParams(location.search);
const skillId = params.get('skill') || 'fnd-orient-source-type';
const $ = (selector) => document.querySelector(selector);
const escapeHtml = (value) => String(value || '').replace(/[&<>"']/g, (char) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[char]));
const fallback = { id: skillId, title: 'Make one transferable learning move', statement: 'You can make the move described by the source skill.', sourceContexts: [{ ref: 'A short Jewish source', genre: 'source' }], teachingMove: 'Name what you notice before trying to solve the whole text.', checks: ['Name the move and point to the part of the source that supports it.'], transfer: 'Carry the same move into a second genre.' };
let skill = fallback;
let answered = false;

function render() {
  $('#title').textContent = skill.title;
  $('#statement').textContent = skill.statement;
  $('#why').textContent = skill.transfer;
  const context = skill.sourceContexts?.[0] || fallback.sourceContexts[0];
  $('#source-ref').textContent = context.ref;
  $('#source-setting').textContent = `Genre: ${context.genre}. Read this source window for the shape of the move, not for total mastery.`;
  $('#teaching-move').textContent = skill.teachingMove;
  $('#source-link').href = `https://www.sefaria.org/search?q=${encodeURIComponent(context.ref)}&tab=texts`;
  const check = skill.checks?.[0] || fallback.checks[0];
  $('#check-title').textContent = check;
  const choices = [
    `Make the move described: ${skill.statement}`,
    'Skip the source and memorize its title instead.',
    'Give a practical answer before identifying what the source is doing.'
  ];
  $('#choices').innerHTML = choices.map((choice, index) => `<button class="choice" type="button" data-choice="${index}">${escapeHtml(choice)}</button>`).join('');
  $('#steps').innerHTML = [
    ['3 min', 'Retrieve', 'Bring back a familiar source signal.'],
    ['7 min', 'Encounter', `Read ${escapeHtml(context.ref)} in its setting.`],
    ['5 min', 'Demonstrate', 'Choose the learner move that fits the skill.'],
    ['3 min', 'Transfer', escapeHtml(skill.transfer)],
    ['2 min', 'Orient', 'Notice what changed and choose the next move.']
  ].map(([time, label, copy]) => `<li><strong>${time} · ${label}</strong><br>${copy}</li>`).join('');
  document.querySelectorAll('.choice').forEach((button) => button.addEventListener('click', () => choose(button)));
}

async function choose(button) {
  if (answered) return;
  answered = true;
  const correct = button.dataset.choice === '0';
  button.classList.add(correct ? 'correct' : 'incorrect');
  if (!correct) document.querySelector('[data-choice="0"]').classList.add('correct');
  $('#feedback').textContent = correct ? 'Good. You made the skill visible in one source window.' : 'The first choice shows the transferable move. Notice it, then carry it into the next source.';
  document.querySelectorAll('.choice').forEach((item) => { item.disabled = true; });
  $('#continue').disabled = false;
  try {
    // This graded question is the skill's `check` — its "practice" knowledge point (kp-<skill>-2).
    // Tagging the event lets remediation track struggle per knowledge point, not only per skill.
    await Seder.api(`/api/learners/${learnerId}/events`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ type:'answer_submitted', skillId, foundationSkillId:skillId, knowledgePointId:`kp-${skillId}-2`, correct, sourceContext:(skill.sourceContexts?.[0]?.ref || 'academy-foundation'), competency:'sourceReasoning' }) });
  } catch { $('#feedback').textContent += ' Your result is ready locally; it will sync when your account is available.'; }
}

$('#continue').addEventListener('click', () => { location.href = 'daily-router.html'; });

// Surface real content that exercises this foundational skill (from the generated
// foundation-content map), so the graph routes the learner to actual sources — not only the
// synthetic session. Prefers distinct genres; stays hidden when the skill has no content yet.
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

// A JLA graduation-slice session (fetched from the server with the answer key stripped): renders
// the designed source window and real, pre-shuffled choices. Answers go to the server, which
// scores them and records the graduation evidence — see chooseJla.
function renderJlaSession(session) {
  const sourceWindow = session.sourceWindow;
  $('#title').textContent = session.title;
  $('#statement').textContent = session.evidencePreview;
  $('#why').textContent = session.teachingMove;
  $('#source-ref').textContent = sourceWindow.sourceRef;
  if (sourceWindow.hebrew) { const el = $('#source-hebrew'); el.textContent = sourceWindow.hebrew; el.hidden = false; }
  if (sourceWindow.translation) { const el = $('#source-translation'); el.textContent = sourceWindow.translation; el.hidden = false; }
  $('#source-setting').textContent = sourceWindow.context || 'Read this source window for the shape of the move, not for total mastery.';
  $('#teaching-move').textContent = session.teachingMove;
  $('#source-link').href = sourceWindow.sourceUrl;
  $('#check-title').textContent = session.prompt;
  $('#steps').innerHTML = [
    ['3 min', 'Retrieve', 'Bring back a familiar source signal.'],
    ['7 min', 'Encounter', `Read ${escapeHtml(sourceWindow.sourceRef)} in its setting.`],
    ['5 min', 'Demonstrate', 'Choose the learner move that fits the skill.'],
    ['3 min', 'Transfer', 'Carry this move into another source family.'],
    ['2 min', 'Orient', 'Notice what changed and choose the next move.']
  ].map(([time, label, copy]) => `<li><strong>${time} · ${label}</strong><br>${copy}</li>`).join('');
  // Choices arrive already shuffled from the server, with the answer key stripped.
  $('#choices').innerHTML = session.choices.map((choice) =>
    `<button class="choice" type="button" data-choice-id="${escapeHtml(choice.id)}">${escapeHtml(choice.text)}</button>`).join('');
  document.querySelectorAll('.choice').forEach((button) => button.addEventListener('click', () => chooseJla(button, session)));
}

async function chooseJla(button, session) {
  if (answered) return;
  answered = true;
  document.querySelectorAll('.choice').forEach((item) => { item.disabled = true; });
  $('#continue').disabled = false;
  try {
    // The server scores the choice, records the graduation evidence, and returns the feedback —
    // correctness is never computed or asserted by the client.
    const response = await Seder.api(`/api/jla/academy-session/${encodeURIComponent(session.skillId)}/answer`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ choiceId: button.dataset.choiceId }) });
    const result = await response.json();
    button.classList.add(result.correct ? 'correct' : 'incorrect');
    $('#feedback').textContent = result.feedback || (result.correct ? 'Good. You made the move visible in one source window.' : 'Not quite — carry the move into the next source and try again.');
  } catch { $('#feedback').textContent = 'Your result is ready locally; it will sync when your account is available.'; }
}

// Ask the server for the JLA academy session (answer key stripped, choices pre-shuffled). If this
// skill has one, render it and let the server score answers; otherwise fall back to the
// foundation-graph render.
Promise.all([
  fetch(`/api/jla/academy-session/${encodeURIComponent(skillId)}`).then((response) => (response.ok ? response.json() : null)).catch(() => null),
  fetch('data/foundation-skill-graph.json').then((response) => (response.ok ? response.json() : null)).catch(() => null),
  fetch('data/foundation-content-map.json').then((response) => (response.ok ? response.json() : null)).catch(() => null)
]).then(([jlaSession, graph, map]) => {
  if (jlaSession && jlaSession.sourceWindow) {
    renderJlaSession(jlaSession);
  } else {
    skill = graph?.skills.find((item) => item.id === skillId) || fallback;
    render();
  }
  renderRealContent(map);
});
