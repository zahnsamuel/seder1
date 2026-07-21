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
    await Seder.api(`/api/learners/${learnerId}/events`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ type:'answer_submitted', skillId, foundationSkillId:skillId, correct, sourceContext:(skill.sourceContexts?.[0]?.ref || 'academy-foundation'), competency:'sourceReasoning' }) });
  } catch { $('#feedback').textContent += ' Your result is ready locally; it will sync when your account is available.'; }
}

$('#continue').addEventListener('click', () => { location.href = 'daily-router.html'; });
fetch('data/foundation-skill-graph.json').then((response) => response.json()).then((graph) => { skill = graph.skills.find((item) => item.id === skillId) || fallback; render(); }).catch(render);
