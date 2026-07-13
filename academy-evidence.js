const learnerId = Seder.currentLearnerId();
const day = Number(new URLSearchParams(location.search).get('day'));
const $ = (selector) => document.querySelector(selector);
const bank = [
  { citation: 'Mishnah Berakhot 1:1', hebrew: 'מֵאֵימָתַי קוֹרִין אֶת שְׁמַע בְּעַרְבִית', skill: 'mishnah-orientation', prompt: 'What must a reader identify first?', answer: 'The practice, its boundary, and the concrete case.' },
  { citation: 'Shabbat 2a', hebrew: 'יְצִיאוֹת הַשַּׁבָּת שְׁתַּיִם שֶׁהֵן אַרְבַּע', skill: 'shabbat-independent-map', prompt: 'What makes this opening case readable?', answer: 'The people, domains, actions, and categories behind the count.' },
  { citation: 'Eruvin 2a', hebrew: 'מָבוֹי שֶׁהוּא גָבוֹהַּ לְמַעְלָה מֵעֶשְׂרִים אַמָּה יְמַעֵט', skill: 'eruvin-independent-map', prompt: 'What gives a stated measure its meaning?', answer: 'Its object, condition, response, and the reason the threshold matters.' },
  { citation: 'Bava Metzia 2a', hebrew: 'שְׁנַיִם אוֹחֲזִין בְּטַלִּית', skill: 'bava-metzia-independent-map', prompt: 'What must remain distinct in this case?', answer: 'The shared object, each claimant’s assertion, and later evidence or procedure.' },
  { citation: 'Pesachim 2a', hebrew: 'מַאי אוֹר', skill: 'pesachim-independent-map', prompt: 'What does a contested word require?', answer: 'Ask how its possible meanings change the time and structure of the case.' },
  { citation: 'Deuteronomy 8:10', hebrew: 'וְאָכַלְתָּ וְשָׂבָעְתָּ וּבֵרַכְתָּ', skill: 'canonical-reception', prompt: 'What should a reader preserve in a later source chain?', answer: 'The verse’s original setting and the role each later source gives it.' },
  { citation: 'Jeremiah 29:7', hebrew: 'וְדִרְשׁוּ אֶת שְׁלוֹם הָעִיר', skill: 'historical-context', prompt: 'What context belongs in a responsible reading?', answer: 'Speaker, audience, setting, purpose, and the community addressed.' },
  { citation: 'Shemoneh Perakim, introduction', hebrew: 'קַבֵּל אֶת הָאֱמֶת מִמִּי שֶׁאֲמָרוֹ', skill: 'comparative-reading', prompt: 'What begins an accountable comparison?', answer: 'A shared question, each source’s context, and a precise difference.' },
  { citation: 'Cairo Geniza study protocol', hebrew: 'זִכָּרוֹן · עֵדוּת · רְאָיָה', skill: 'history-context', prompt: 'What question should an archive raise first?', answer: 'What it is evidence for, whose voice it preserves, and what remains uncertain.' },
  { citation: 'Independent reading protocol', hebrew: 'שְׁאֵלָה · רְאָיָה · קֻשְׁיָא · תֵּרוּץ', skill: 'independent-sugya-reading', prompt: 'What belongs in an accountable source map?', answer: 'The case or claim, each line’s job, textual evidence, and one uncertainty.' },
  { citation: 'Bava Kamma 2a', hebrew: 'לֹא הֲרֵי הַשּׁוֹר כַּהֲרֵי הַמַּבְעֶה', skill: 'bava-kamma-independent-map', prompt: 'Why state a difference before a shared principle?', answer: 'To preserve a relevant difference while finding a common legal structure.' },
  { citation: 'Independent study protocol', hebrew: 'חֲזָרָה · בֵּירוּר · הַשְׁוָאָה · הַדְרָכָה', skill: 'independent-sugya-reading', prompt: 'How should a learner choose the next move?', answer: 'Use evidence to choose retrieval, a new source, repair, or further guidance.' }
];
const weeklyTransfer = { prompt: 'You meet a new source in a different genre. What proves a reading habit has transferred?', answer: 'Use the same reading move while naming what is genuinely different in the new source.' };
const item = bank[(day - 1) % bank.length];
const questions = day % 7 === 0 ? [item, { ...item, ...weeklyTransfer, skill: 'independent-sugya-reading' }] : [item, { ...item, prompt: `Before drawing a conclusion from ${item.citation}, what must you do?`, answer: item.answer }];
let index = 0;
const shuffle = (choices) => choices.map((text, originalIndex) => ({ text, originalIndex })).sort(() => Math.random() - .5);
function render() {
  const question = questions[index];
  $('#card').innerHTML = `<p class="count">CHECK ${index + 1} OF 2 · ${question.citation}</p><p class="hebrew" dir="rtl">${question.hebrew}</p><h2>${question.prompt}</h2><div class="answers">${shuffle([question.answer, 'Skip the source context and choose the quickest conclusion.', 'Treat recognition of one word as a complete reading.']).map(({ text, originalIndex }) => `<button data-choice="${originalIndex}">${text}</button>`).join('')}</div><p id="feedback" aria-live="polite"></p>`;
  $('.answers').querySelectorAll('button').forEach((button) => button.addEventListener('click', () => answer(button, question)));
}
async function answer(button, question) {
  const correct = Number(button.dataset.choice) === 0;
  $('.answers').querySelectorAll('button').forEach((choice) => choice.disabled = true);
  button.classList.add(correct ? 'correct' : 'incorrect');
  if (!correct) $('.answers').querySelector('[data-choice="0"]').classList.add('correct');
  $('#feedback').textContent = correct ? 'Evidence recorded. Continue to the next check.' : 'Review the highlighted answer. This move will return in spaced retrieval.';
  const response = await Seder.api(`/api/learners/${learnerId}/events`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'answer_submitted', skillId: question.skill, competency: 'sourceReasoning', sourceContext: `academy day ${day} check ${index + 1}`, correct }) });
  if (response.ok) $('#xp').textContent = `${(await response.json()).xp || 0} XP`;
  if (!correct) { setTimeout(render, 900); return; }
  setTimeout(() => { index++; if (index < questions.length) render(); else if (day % 7 === 0) showMap(); else completeDay(); }, 800);
}
function showMap() {
  const map = $('#map'), note = $('#mapNote'), save = $('#saveMap');
  map.hidden = false;
  note.value = localStorage.getItem(`seder:academy-map:${learnerId}:${day}`) || '';
  const ready = () => { save.disabled = note.value.trim().length < 28; };
  note.addEventListener('input', ready); ready(); note.focus();
  save.addEventListener('click', async () => {
    const text = note.value.trim(); if (text.length < 28) return;
    localStorage.setItem(`seder:academy-map:${learnerId}:${day}`, text);
    const saved = await Seder.api(`/api/learners/${learnerId}/events`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'journey_artifact_saved', artifactType: 'academy-source-maps', artifactId: `academy-day-${day}`, note: text }) });
    if (saved.ok) completeDay();
  }, { once: true });
}
async function completeDay() {
  const completion = await Seder.api(`/api/learners/${learnerId}/events`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'stage_mastered', stageId: `academy-day-${day}` }) });
  if (completion.ok) { $('#map').hidden = true; $('#card').innerHTML = '<p class="count">DAY MASTERED</p><h2>Tomorrow is now available.</h2><p>You demonstrated the day’s reading move with source evidence. Your review rhythm will bring it back when it needs strengthening.</p>'; $('#return').hidden = false; } else $('#feedback').textContent = 'The evidence for this day is incomplete. Review the source, then try again.';
}
if (!Number.isInteger(day) || day < 1 || day > 90) location.href = 'academy.html'; else Seder.api(`/api/learners/${learnerId}`).then((response) => response.ok ? response.json() : Promise.reject()).then((learner) => { $('#xp').textContent = `${learner.xp || 0} XP`; $('#title').textContent = `Day ${day}: demonstrate today’s reading move.`; render(); }).catch(() => { location.href = 'academy.html'; });
