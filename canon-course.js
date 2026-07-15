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
const productionKey = `seder-course-${id}-production-${learnerId}`;
const productionDone = () => localStorage.getItem(productionKey) === 'done';
const normalizeTyped = (text) => String(text || '').trim().toLowerCase().replace(/[.,!?;:'"“”’]/g, '');

// After all six recognition sessions, one typed production check gates the capstone:
// recalling the course's anchor phrase from memory is stronger mastery evidence than
// recognizing it among choices. The expected answer is deliberately not revealed on a
// miss (the learner can retry immediately, so revealing it would let them copy it).
function renderProduction() {
  const production = course.production;
  const correct = production.acceptable[0];
  $('#progress').textContent = `${course.sessions.length} / ${course.sessions.length} moves demonstrated · one explanation check`;
  $('#nav').innerHTML = course.sessions.map((item, itemIndex) => `<button class="lab-button" data-nav="${itemIndex}">Session ${itemIndex + 1}<small>Demonstrated</small></button>`).join('');
  document.querySelectorAll('[data-nav]').forEach((button) => { button.onclick = () => { index = Number(button.dataset.nav); render(); }; });
  $('#lesson').innerHTML = `<p class="lesson-label">SOURCE EXPLANATION CHECK · ${production.ref}</p><h2>Identify the anchor phrase</h2><article class="source"><p class="hebrew" lang="he" dir="rtl">${production.hebrew}</p></article><p class="prompt">Which meaning belongs to this phrase?</p><div class="choices" id="productionChoices"></div><div id="feedback" aria-live="polite"></div>`;
  [correct, 'A question the source asks but does not answer here.', 'A final ruling not stated in this phrase.'].map((text, originalIndex) => ({ text, originalIndex })).sort(() => Math.random() - .5).forEach(({ text, originalIndex }) => { const button = document.createElement('button'); button.className = 'choice'; button.textContent = text; button.onclick = async () => { const feedback = $('#feedback'); if (originalIndex !== 0) { button.disabled = true; button.classList.add('incorrect'); feedback.innerHTML = '<p class="feedback">Not yet. Revisit the anchor source, then choose the meaning it actually carries.</p>'; return; } document.querySelectorAll('#productionChoices button').forEach((item) => item.disabled = true); button.classList.add('correct'); localStorage.setItem(productionKey, 'done'); feedback.innerHTML = `<p class="feedback">Demonstrated. You identified the phrase in its source.</p><p class="lesson-action"><a class="continue" href="canon-capstone.html?course=${course.id}">Continue to capstone →</a></p>`; try { await Seder.api(`/api/learners/${learnerId}/events`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'answer_submitted', skillId: production.skill, competency: 'translation', sourceContext: production.ref, correct: true }) }); } catch (error) { console.warn(error); } }; $('#productionChoices').append(button); });
  return;
  $('#progress').textContent = `${course.sessions.length} / ${course.sessions.length} moves demonstrated · one production check`;
  $('#nav').innerHTML = course.sessions.map((item, itemIndex) => `<button class="lab-button" data-nav="${itemIndex}">Session ${itemIndex + 1}<small>Demonstrated</small></button>`).join('');
  document.querySelectorAll('[data-nav]').forEach((button) => { button.onclick = () => { index = Number(button.dataset.nav); render(); }; });
  $('#lesson').innerHTML = `<p class="lesson-label">PRODUCTION CHECK &middot; ${production.ref}</p><h2>Recall it, don&rsquo;t just recognize it</h2><article class="source"><p class="hebrew" lang="he" dir="rtl">${production.hebrew}</p></article><p class="prompt">${production.prompt}</p><div class="choices"><input id="typedInput" type="text" autocomplete="off" spellcheck="false" placeholder="Type your answer…" aria-label="Typed answer" style="width:100%;padding:14px 15px;border:1px solid #d1d8d3;background:#fff;color:#273b43;font:500 14px Inter,Arial,sans-serif"></div><button id="typedCheck" class="continue">Check my answer</button><div id="feedback" aria-live="polite"></div>`;
  const submit = async () => {
    const value = normalizeTyped($('#typedInput').value);
    if (!value || $('#typedInput').disabled) return;
    const correct = production.acceptable.some((candidate) => normalizeTyped(candidate) === value);
    $('#typedInput').disabled = true;
    $('#typedCheck').disabled = true;
    const nextAction = correct ? `<a class="continue" href="canon-capstone.html?course=${course.id}">Continue to capstone &rarr;</a>` : `<button id="retryProduction" class="continue">Try the production check again</button>`;
    $('#feedback').innerHTML = `<p class="feedback">${correct ? `Demonstrated from memory (&ldquo;${production.translation}&rdquo;) — recognition has become recall. ` : 'Not yet. This phrase appears in the sessions above — reread it in its source, then return and type its meaning. '}Typing a meaning from memory is stronger evidence than choosing it from a list.</p><p class="lesson-action">${nextAction}</p>`;
    if (correct) localStorage.setItem(productionKey, 'done');
    else $('#retryProduction').onclick = () => renderProduction();
    try { await Seder.api(`/api/learners/${learnerId}/events`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'answer_submitted', skillId: production.skill, competency: 'translation', sourceContext: production.ref, correct }) }); } catch (error) { console.warn(error); }
  };
  $('#typedCheck').onclick = submit;
  $('#typedInput').addEventListener('keydown', (event) => { if (event.key === 'Enter') { event.preventDefault(); submit(); } });
  setTimeout(() => $('#typedInput').focus(), 0);
}

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
    const needsProduction = finishesCourse && course.production && !productionDone();
    const nextAction = correct ? (finishesCourse ? (needsProduction ? `<button id="toProduction" class="continue">One production check remains &rarr;</button>` : `<a class="continue" href="canon-capstone.html?course=${course.id}">Continue to capstone &rarr;</a>`) : `<button id="continue" class="continue">Continue &rarr;</button>`) : `<button id="retry" class="continue">Try this reading again</button>`;
    $('#feedback').innerHTML = `<p class="feedback">${correct ? 'Demonstrated. ' : 'Not yet. Read the source once more, then choose the strongest answer. '}${session.explanation}</p><p class="lesson-action">${nextAction}</p>`;
    if (correct && hasNextSession) $('#continue').onclick = () => { index += 1; render(); };
    if (needsProduction) $('#toProduction').onclick = () => renderProduction();
    if (!correct) $('#retry').onclick = () => render();
    if (correct) { done.add(index); localStorage.setItem(key, JSON.stringify([...done])); }
    try { await Seder.api(`/api/learners/${learnerId}/events`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'answer_submitted', skillId: session.skill, competency: 'sourceReasoning', sourceContext: session.ref, correct }) }); } catch (error) { console.warn(error); }
  };
}

fetch('/api/curriculum/canon-six-session-courses').then((response) => response.json()).then((data) => { course = data.courses.find((item) => item.id === id) || data.courses[0]; $('#title').textContent = course.title; $('#description').textContent = course.description; const capstone = document.querySelector('.progress a'); if (capstone) capstone.href = `canon-capstone.html?course=${course.id}`; if (course.production && !productionDone() && done.size >= course.sessions.length && !params.has('session')) renderProduction(); else render(); });
