const learnerId = Seder.currentLearnerId();
const key = `seder-canon-practice-lab-${learnerId}`;
const mastered = new Set(JSON.parse(localStorage.getItem(key) || '[]'));
const $ = (selector) => document.querySelector(selector);
let lab;
let index = 0;
let selected;
let answered = false;
const requestedSubject = new URLSearchParams(location.search).get('subject') || '';

function render() {
  selected = undefined;
  answered = false;
  const exercise = lab.exercises[index];
  $('#progress').textContent = `${mastered.size} / ${lab.exercises.length} moves demonstrated`;
  $('#exercise-nav').innerHTML = lab.exercises.map((item, itemIndex) => `<button class="lab-button ${itemIndex === index ? 'active' : ''}" data-exercise="${itemIndex}">${item.subject}<small>${mastered.has(item.id) ? 'Demonstrated' : item.mode}</small></button>`).join('');
  document.querySelectorAll('[data-exercise]').forEach((button) => { button.onclick = () => { index = Number(button.dataset.exercise); render(); }; });
  $('#lesson').innerHTML = `<p class="lesson-label">${exercise.subject.toUpperCase()} &middot; ${exercise.mode}</p><h2>Read the source move.</h2><article class="source"><p class="hebrew" lang="he" dir="rtl">${exercise.source}</p><p class="translation">${exercise.translation}</p></article><p class="prompt">${exercise.prompt}</p><div class="choices">${exercise.choices.map((choice, choiceIndex) => `<button class="choice" data-choice="${choiceIndex}">${choice}</button>`).join('')}</div><button id="check" class="continue" disabled>Check my reading</button><div id="feedback" aria-live="polite"></div>`;
  document.querySelectorAll('[data-choice]').forEach((button) => { button.onclick = () => { selected = Number(button.dataset.choice); document.querySelectorAll('[data-choice]').forEach((choice) => choice.classList.toggle('selected', Number(choice.dataset.choice) === selected)); $('#check').disabled = false; }; });
  $('#check').onclick = () => answer(exercise, selected === exercise.correct);
}

async function answer(exercise, correct) {
  if (answered) return;
  answered = true;
  document.querySelectorAll('#lesson button').forEach((button) => { button.disabled = true; });
  const finishedLab = correct && !mastered.has(exercise.id) && mastered.size + 1 === lab.exercises.length;
  const hasNextExercise = index < lab.exercises.length - 1;
  const action = correct ? (finishedLab ? `<a class="continue" href="canon-map.html">Continue to mastery map &rarr;</a>` : `<button id="continue" class="continue">Continue &rarr;</button>`) : `<button id="retry" class="continue">Try this reading again</button>`;
  $('#feedback').innerHTML = `<p class="feedback">${correct ? 'Demonstrated. ' : 'Not yet. Return to the source before you choose again. '}${exercise.explanation}</p><p class="lesson-action">${action}</p>`;
  if (correct && hasNextExercise) $('#continue').onclick = () => { index += 1; render(); };
  if (!correct) $('#retry').onclick = () => render();
  if (correct) { mastered.add(exercise.id); localStorage.setItem(key, JSON.stringify([...mastered])); }
  try { await Seder.api(`/api/learners/${learnerId}/events`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'canon_lab', skillId: exercise.skillId, competency: 'sourceReasoning', sourceContext: `${exercise.subject} practice lab`, correct }) }); } catch (error) { console.warn(error); }
}

fetch('/api/curriculum/non-gemara-practice-lab').then((response) => response.json()).then((data) => { lab = data; const match = data.exercises.findIndex((exercise) => exercise.subject.toLowerCase().includes(requestedSubject.toLowerCase())); if (match >= 0) index = match; $('#title').textContent = data.title; $('#description').textContent = data.description; render(); });
