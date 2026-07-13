const $ = (selector) => document.querySelector(selector);
const learnerId = Seder.currentLearnerId();
const storageKey = 'seder-language-ladder-v1';
let ladder, stageIndex = 0, itemIndex = 0, answered = false;

function progress() { try { return JSON.parse(localStorage.getItem(storageKey)) || { completed: [] }; } catch { return { completed: [] }; } }
function saveProgress(next) { localStorage.setItem(storageKey, JSON.stringify(next)); }
function shuffledAnswers(item) { return item.answers.map((text, index) => ({ text, index })).sort(() => Math.random() - 0.5); }
function renderMap() {
  const completed = progress().completed;
  $('#wordMap').innerHTML = ladder.stages.map((stage, index) => {
    const status = completed.includes(stage.id) ? 'done' : index === stageIndex ? 'active' : '';
    return `<li class="${status}">${String(index + 1).padStart(2, '0')} · ${stage.title}<small>${stage.mastery}</small></li>`;
  }).join('');
}
function record(type, payload) {
  return Seder.api(`/api/learners/${learnerId}/events`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type, ...payload }) })
    .then((response) => response.ok ? response.json() : null).then((learner) => { if (learner) $('#xp').textContent = `${learner.xp || 0} XP`; }).catch(() => {});
}
function updateXp() { Seder.api(`/api/learners/${learnerId}`).then((r) => r.ok ? r.json() : null).then((l) => { if (l) $('#xp').textContent = `${l.xp || 0} XP`; }).catch(() => {}); }
function renderComplete(stage) {
  $('#progress').textContent = 'STAGE COMPLETE'; $('#bar').style.width = '100%'; $('#kind').textContent = 'MASTERY CHECKPOINT'; $('#title').textContent = stage.title; $('#hebrew').textContent = '';
  $('#transliteration').textContent = stage.mastery; $('#source').textContent = `You have practiced this skill in ${stage.sourceForms.join(', ')}. It will return in a different source context.`;
  $('#prompt').textContent = 'Continue only when you can name the reading move, not merely the English word.'; $('#answers').innerHTML = ''; $('#feedback').textContent = 'Stage saved. A later review will test transfer.'; $('#continue').disabled = false;
  const finalStage = stageIndex === ladder.stages.length - 1; $('#continue').textContent = finalStage ? 'Continue to Gemara grammar →' : 'Begin next reading skill →';
  $('#continue').onclick = () => { if (finalStage) location.href = 'grammar.html'; else { stageIndex += 1; itemIndex = 0; render(); } };
}
function completeStage() {
  const stage = ladder.stages[stageIndex], state = progress();
  if (!state.completed.includes(stage.id)) saveProgress({ completed: [...state.completed, stage.id] });
  record('stage_mastered', { stageId: stage.id, skillId: stage.skillId }); renderMap(); renderComplete(stage);
}
function answer(button, correct) {
  if (answered) return; answered = true; document.querySelectorAll('#answers button').forEach((item) => { item.disabled = true; }); button.classList.add(correct ? 'correct' : 'incorrect');
  record('answer_submitted', { skillId: ladder.stages[stageIndex].skillId, competency: 'language-reading', sourceContext: `${ladder.stages[stageIndex].id}: ${item.source}`, correct });
  $('#feedback').textContent = correct ? 'Correct. You identified the job this language does in the source.' : 'Not yet. Read the source cue again: its job matters more than a word-for-word gloss.'; $('#continue').disabled = false;
}
function render() {
  const stage = ladder.stages[stageIndex], item = stage.items[itemIndex]; answered = false; renderMap();
  $('#progress').textContent = `${stageIndex + 1}.${itemIndex + 1} · ${stage.title.toUpperCase()}`; $('#bar').style.width = `${((itemIndex + 1) / stage.items.length) * 100}%`; $('#kind').textContent = item.kind; $('#title').textContent = stage.goal;
  $('#hebrew').textContent = item.hebrew; $('#transliteration').textContent = item.transliteration; $('#source').textContent = item.source; $('#prompt').textContent = item.prompt; $('#feedback').textContent = ''; $('#continue').disabled = true; $('#continue').textContent = itemIndex === stage.items.length - 1 ? 'Complete this reading skill →' : 'Continue →';
  $('#continue').onclick = () => { if (!answered) return; if (itemIndex === stage.items.length - 1) completeStage(); else { itemIndex += 1; render(); } };
  const answers = $('#answers'); answers.innerHTML = ''; shuffledAnswers(item).forEach(({ text, index }) => { const button = document.createElement('button'); button.type = 'button'; button.textContent = text; button.addEventListener('click', () => answer(button, index === item.correct)); answers.appendChild(button); });
}
async function init() { const response = await fetch('/api/curriculum/language-ladder'); if (!response.ok) throw new Error('The reading ladder could not load.'); ladder = await response.json(); const firstOpen = ladder.stages.findIndex((stage) => !progress().completed.includes(stage.id)); stageIndex = firstOpen === -1 ? ladder.stages.length - 1 : firstOpen; updateXp(); render(); }
init().catch((error) => { $('#feedback').textContent = error.message; });
