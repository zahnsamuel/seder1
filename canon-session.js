const id = new URLSearchParams(location.search).get('id');
const learnerId = Seder.currentLearnerId();
let session, learner, index = 0, answered = false, showingPractice = false;
const $ = (selector) => document.querySelector(selector);
$('#translationToggle').addEventListener('click', () => { const translation = $('#translation'); translation.hidden = !translation.hidden; $('#translationToggle').textContent = translation.hidden ? 'Show translation' : 'Hide translation'; });

function shuffledChoices(question) {
  return question.choices.map((text, originalIndex) => ({ text, originalIndex })).sort(() => Math.random() - .5);
}

function renderQuestion() {
  const question = session.questions[index];
  answered = false;
  showingPractice = false;
  $('#practice').hidden = true;
  $('#questionCount').textContent = `SOURCE MOVE ${index + 1} OF ${session.questions.length}`;
  $('#prompt').textContent = question.prompt;
  $('#feedback').textContent = '';
  $('#continue').disabled = true;
  $('#continue').textContent = index === session.questions.length - 1 ? 'Complete this canon moment →' : 'Continue →';
  $('#answers').innerHTML = shuffledChoices(question).map(({ text, originalIndex }) => `<button type="button" data-choice="${originalIndex}">${text}</button>`).join('');
  $('#answers').querySelectorAll('button').forEach((button) => button.addEventListener('click', () => answer(button, Number(button.dataset.choice))));
}

async function answer(button, choice) {
  if (answered) return;
  answered = true;
  const question = session.questions[index];
  const correct = choice === question.correct;
  $('#answers').querySelectorAll('button').forEach((item) => item.disabled = true);
  button.classList.add(correct ? 'correct' : 'incorrect');
  if (!correct) $('#answers').querySelector(`[data-choice="${question.correct}"]`).classList.add('correct');
  $('#feedback').textContent = correct ? `+10 XP. ${question.explanation}` : `+5 XP. ${question.explanation} This will return in review.`;
  const response = await Seder.api(`/api/learners/${learnerId}/events`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'answer_submitted', skillId: question.skillId, competency: question.competency, sourceContext: question.sourceContext, correct }) });
  if (response.ok) { learner = await response.json(); $('#xp').textContent = `${learner.xp || 0} XP`; }
  $('#continue').disabled = false;
}

$('#continue').addEventListener('click', async () => {
  if (!answered) return;
  if (index < session.questions.length - 1) { index++; renderQuestion(); return; }
  if (session.practice && !showingPractice) { showPractice(); return; }
  if (showingPractice) await savePractice();
  const completion = await Seder.api(`/api/learners/${learnerId}/events`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'stage_mastered', stageId: session.stageId }) });
  if (completion.ok) { location.href = 'journey.html'; return; }
  index = 0;
  renderQuestion();
  $('#feedback').textContent = 'One source move still needs stronger evidence. Work through this short session once more; the next try counts as new retrieval evidence.';
});

function showPractice() {
  showingPractice = true;
  const practice = session.practice;
  $('#practice').hidden = false;
  $('#practicePrompt').textContent = practice.prompt;
  $('#practiceHint').textContent = practice.hint;
  $('#practiceNote').value = localStorage.getItem(`seder:source-map:${learnerId}:${session.id}`) || '';
  $('#continue').textContent = 'Save source map and complete →';
  const ready = () => { $('#continue').disabled = $('#practiceNote').value.trim().length < practice.minLength; };
  $('#practiceNote').oninput = ready;
  ready();
  $('#practiceNote').focus();
}

async function savePractice() {
  const note = $('#practiceNote').value.trim();
  if (note.length < session.practice.minLength) return;
  localStorage.setItem(`seder:source-map:${learnerId}:${session.id}`, note);
  await Seder.api(`/api/learners/${learnerId}/events`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'journey_artifact_saved', artifactType: 'source-maps', artifactId: session.id, note })
  });
}

Promise.all([Seder.api('/api/curriculum/canon-journey').then((r) => r.json()), Seder.api(`/api/learners/${learnerId}`).then((r) => r.json()), Seder.api('/api/source-glossary').then((r) => r.ok ? r.json() : { terms: [] })]).then(([curriculum, currentLearner, glossary]) => {
  learner = currentLearner;
  session = curriculum.sessions.find((item) => item.id === id) || curriculum.sessions[0];
  $('#xp').textContent = `${learner.xp || 0} XP`;
  $('#lens').textContent = session.lens.toUpperCase();
  $('#kicker').textContent = `${session.lens.toUpperCase()} · CONNECTED CANON`;
  $('#title').textContent = session.title;
  $('#summary').textContent = session.summary;
  $('#citation').textContent = session.source.citation;
  $('#hebrew').textContent = session.source.hebrew;
  $('#translation').textContent = session.source.translation;
  $('#note').textContent = `${session.source.note} Study translation is provided for learning; keep the cited source and its wider context in view.`;
  const matches = glossary.terms.filter((item) => session.source.hebrew.includes(item.term));
  $('#glossary').innerHTML = matches.length ? `<b>WORDS IN FOCUS</b>${matches.map((item) => `<details><summary>${item.term} · ${item.meaning}</summary><p><i>${item.transliteration}</i> — ${item.job}</p></details>`).join('')}` : '';
  if (session.id === 'independent-map') $('#glossary').insertAdjacentHTML('beforeend', '<p><a href="sugya-map.html">Practice mapping a full opening sugya →</a></p>');
  renderQuestion();
}).catch(() => { $('#title').textContent = 'This session could not load.'; });
