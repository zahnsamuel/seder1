const learnerId = Seder.currentLearnerId();
const params = new URLSearchParams(location.search);
const id = params.get('course') || 'shema-six';
const key = `seder-course-${id}-${learnerId}`;
const done = new Set(JSON.parse(localStorage.getItem(key) || '[]'));
const $ = (selector) => document.querySelector(selector);
let course;
let index = Number(params.get('session') || 0);
let selected;
let answered = false;
const shuffle = (items) => items.map((text, originalIndex) => ({ text, originalIndex })).sort(() => Math.random() - .5);

function render() {
  index = Math.min(Math.max(0, index), course.sessions.length - 1);
  selected = undefined;
  answered = false;
  const session = course.sessions[index];
  $('#progress').textContent = `${done.size} / ${course.sessions.length} moves demonstrated`;
  $('#nav').innerHTML = course.sessions.map((item, itemIndex) => `<button class="lab-button ${itemIndex === index ? 'active' : ''}" data-nav="${itemIndex}">Session ${itemIndex + 1}<small>${done.has(itemIndex) ? 'Demonstrated' : item.title}</small></button>`).join('');
  document.querySelectorAll('[data-nav]').forEach((button) => { button.onclick = () => { index = Number(button.dataset.nav); render(); }; });
  $('#lesson').innerHTML = `<p class="lesson-label">SESSION ${index + 1} &middot; ${session.ref}</p><h2>${session.title}</h2><article class="source"><p class="hebrew" lang="he" dir="rtl">${session.hebrew}</p><p class="translation">${session.translation}</p></article><p class="prompt">${session.prompt}</p><div class="choices">${shuffle(session.choices).map(({ text, originalIndex }) => `<button class="choice" data-choice="${originalIndex}">${text}</button>`).join('')}</div><button id="check" class="continue" disabled>Check my reading</button><div id="feedback" aria-live="polite"></div>`;
  document.querySelectorAll('[data-choice]').forEach((button) => { button.onclick = () => { selected = Number(button.dataset.choice); document.querySelectorAll('[data-choice]').forEach((choice) => choice.classList.toggle('selected', Number(choice.dataset.choice) === selected)); $('#check').disabled = false; }; });
  $('#check').onclick = async () => {
    if (answered) return;
    answered = true;
    const correct = selected === session.correct;
    document.querySelectorAll('#lesson button').forEach((button) => { button.disabled = true; });
    const finishesCourse = correct && !done.has(index) && done.size + 1 === course.sessions.length;
    const hasNextSession = index < course.sessions.length - 1;
    const nextAction = correct ? (finishesCourse ? `<a class="continue" href="canon-capstone.html?course=${course.id}">Continue to capstone &rarr;</a>` : `<button id="continue" class="continue">Continue &rarr;</button>`) : `<button id="retry" class="continue">Try this reading again</button>`;
    $('#feedback').innerHTML = `<p class="feedback">${correct ? 'Demonstrated. ' : 'Not yet. Read the source once more, then choose the strongest answer. '}${session.explanation}</p><p class="lesson-action">${nextAction}</p>`;
    if (correct && hasNextSession) $('#continue').onclick = () => { index += 1; render(); };
    if (!correct) $('#retry').onclick = () => render();
    if (correct) { done.add(index); localStorage.setItem(key, JSON.stringify([...done])); }
    try { await Seder.api(`/api/learners/${learnerId}/events`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'answer_submitted', skillId: session.skill, competency: 'sourceReasoning', sourceContext: session.ref, correct }) }); } catch (error) { console.warn(error); }
  };
}

fetch('/api/curriculum/canon-six-session-courses').then((response) => response.json()).then((data) => { course = data.courses.find((item) => item.id === id) || data.courses[0]; $('#title').textContent = course.title; $('#description').textContent = course.description; const capstone = document.querySelector('.progress a'); if (capstone) capstone.href = `canon-capstone.html?course=${course.id}`; render(); });
