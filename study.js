const openingSteps = [
  { type: 'READ THE PAGE', title: 'Begin with the Mishnah', prompt: 'Before translating every word, identify what kind of statement you are reading.', quote: 'From when do we recite Shema in the evenings?', answers: ['A question about when evening Shema begins.', 'A final ruling about the latest time for Shema.', 'A story about someone reciting Shema.'], correct: 0, hebrew: 'מֵאֵימָתַי קוֹרִין אֶת שְׁמַע בְּעַרְבִין?', translation: 'From when do we recite Shema in the evenings?', reason: 'Orientation comes first: this Mishnah opens with a time-question.', focus: 'Opening Mishnah: a question about the beginning time of evening Shema.', hotspot: ['21%', '35%', '27%', '10%'] },
  { type: 'TRACE THE QUESTION', title: 'Now notice the Gemara move', prompt: 'The Gemara does not simply answer. It first asks why the Mishnah begins with this question.', quote: 'תנא היכא קאי דקתני מאימתי?', answers: ['It asks why this Mishnah starts with “From when?”', 'It gives the final answer to the Mishnah.', 'It changes the subject to prayer.'], correct: 0, hebrew: 'תנא היכא קאי דקתני מאימתי?', translation: 'What is the Mishnah addressing that it begins, “From when”?', reason: 'A sugya pauses to ask what a statement is responding to.', focus: 'Gemara question: why does the Mishnah begin with the evening recitation?', hotspot: ['32%', '35%', '27%', '10%'] },
  { type: 'FOLLOW THE ANSWER', title: 'Connect the answer back to Torah', prompt: 'The Gemara explains that the Mishnah follows the sequence of a biblical verse: “when you lie down and when you arise.”', quote: 'תנא אקרא קאי, דכתיב: בשכבך ובקומך', answers: ['It supplies a verse-based reason for beginning with the evening.', 'It introduces an unrelated proof about blessings.', 'It rejects the Mishnah’s question as mistaken.'], correct: 0, hebrew: 'תנא אקרא קאי, דכתיב: בְּשָׁכְבְּךָ וּבְקוּמֶךָ', translation: 'The Mishnah relies on the verse: “when you lie down and when you arise.”', reason: 'Gemara explains Mishnah through Torah: the first canon connection.', focus: 'Gemara answer: the sequence follows “lying down” before “rising up.”', hotspot: ['44%', '35%', '27%', '10%'] },
  { type: 'NAME THE MOVE', title: 'Read the first sugya as a sequence', prompt: 'You have now seen a complete opening movement. What is its order?', quote: 'Mishnah → Gemara question → verse-based answer', answers: ['A practical question, a question about its context, then an answer rooted in Torah.', 'A biblical verse, followed by an unrelated Mishnah.', 'A final ruling with no reasoning.'], correct: 0, hebrew: 'מִשְׁנָה · שְׁאֵלָה · תְּשׁוּבָה', translation: 'Mishnah · Question · Answer', reason: 'Recognizing structure makes a physical page readable rather than overwhelming.', focus: 'Structure in view: Mishnah, Gemara question, then a Torah-rooted answer.', hotspot: ['54%', '35%', '27%', '10%'] }
];
const nightSteps = [
  { type: 'READ THE NEXT DAF', title: 'A word opens a new problem', prompt: 'Berakhot 2b examines the phrase “and it is purified.” The Gemara asks what, exactly, becomes purified.', quote: 'וּמַאי “וְטָהֵר”?', answers: ['It asks what “and it is purified” means.', 'It states that the priest has already eaten terumah.', 'It introduces a new blessing.'], correct: 0, hebrew: 'וּמַאי “וְטָהֵר”? טְהַר יוֹמָא', translation: 'What does “and it is purified” mean? The day becomes clear.', reason: 'A single word in a verse can become the focus of Gemara investigation.', focus: 'Berakhot 2b: the Gemara slows down over the phrase “and it is purified.”' },
  { type: 'WEIGH THE EVIDENCE', title: 'Use a sign from the text', prompt: 'A baraita gives a practical sign for the time: the emergence of the stars.', quote: 'סימן לדבר: צאת הכוכבים', answers: ['The emergence of the stars marks the relevant time.', 'The first watch is the only possible marker.', 'The sun’s first light marks evening.'], correct: 0, hebrew: 'סימן לדבר: צֵאת הַכּוֹכָבִים', translation: 'A sign for the matter: the emergence of the stars.', reason: 'The discussion moves from a difficult phrase to evidence that clarifies it.', focus: 'Berakhot 2b: a textual problem is tested against a practical marker of time.' },
  { type: 'FOLLOW THE PROOF', title: 'See why the Gemara brings another verse', prompt: 'The Rabbis cite two verses from Nehemiah. The second one strengthens their claim about when day ends.', quote: 'וְאוֹמֵר: וְהָיוּ לָנוּ הַלַּיְלָה מִשְׁמָר', answers: ['It strengthens the claim that stars mark the end of day.', 'It changes the subject to military history.', 'It replaces the first verse because it was wrong.'], correct: 0, hebrew: 'וְהָיוּ לָנוּ הַלַּיְלָה מִשְׁמָר וְהַיּוֹם מְלָאכָה', translation: 'At night they were a guard for us, and by day they labored.', reason: 'You are reading an “and it says” move: a second source makes an argument firmer.', focus: 'Berakhot 2b: the Gemara builds a proof with more than one verse.' }
];
const movesSteps = [
  { type: 'GEMARA MOVE', title: 'Question, answer, proof', prompt: 'A Gemara discussion often develops in a recognizable order: a question, an answer, then a source that tests or supports the answer.', quote: 'Question → Answer → Proof', answers: ['It is a sequence for following an argument across a sugya.', 'It means every source is a final ruling.', 'It is only a way to memorize vocabulary.'], correct: 0, hebrew: 'שְׁאֵלָה · תְּשׁוּבָה · רְאָיָה', translation: 'Question · Answer · Proof', reason: 'Naming a move lets the learner keep their place in a dense page.', focus: 'Gemara moves: label what each statement is doing before deciding whether it is persuasive.' },
  { type: 'GEMARA MOVE', title: 'Learn to look for the purpose', prompt: 'When the Gemara brings a verse after an answer, ask what the verse is doing in the argument.', quote: 'What does this source add?', answers: ['It may support, clarify, or challenge the preceding claim.', 'It is included only to make the page longer.', 'It means the discussion is over.'], correct: 0, hebrew: 'מַאי קָא מַשְׁמַע לָן?', translation: 'What does this teach us?', reason: 'This question turns passive reading into active argument tracking.', focus: 'Gemara moves: every new source has a job inside the discussion.' }
];
const canonSteps = [
  { type: 'CANON CONNECTION', title: 'Follow the question back to Torah', prompt: 'The Berakhot discussion begins with Shema. Its deeper source is the Torah instruction to speak these words when lying down and rising up.', quote: 'וּבְשָׁכְבְּךָ וּבְקוּמֶךָ', answers: ['It supplies the biblical language behind the Mishnah’s order.', 'It is unrelated to the Shema discussion.', 'It ends the Gemara’s argument immediately.'], correct: 0, hebrew: 'וְדִבַּרְתָּ בָּם בְּשָׁכְבְּךָ וּבְקוּמֶךָ', translation: 'Speak of them when you lie down and when you rise up.', reason: 'The same phrase is read as Torah instruction, Mishnah timing question, and Gemara argument.', focus: 'Canon connection: trace the line from Deuteronomy to Mishnah to Gemara.' }
];

let current = 0;
let answered = false;
let activeSteps = openingSteps;
let activeUnit = 'opening';
const $ = (selector) => document.querySelector(selector);
const courseKey = 'seder-course-progress-v1';
const savedCourse = JSON.parse(localStorage.getItem(courseKey) || '{}');
const learnerId = Seder.currentLearnerId();
const courseState = { xp: savedCourse.xp || 0, unlocked: { night: Boolean(savedCourse.unlocked?.night), moves: Boolean(savedCourse.unlocked?.moves), canon: Boolean(savedCourse.unlocked?.canon) } };
function saveCourse() { localStorage.setItem(courseKey, JSON.stringify(courseState)); }
function updateXp() { $('#xpLabel').textContent = `${courseState.xp} XP`; }
function applyUnlocks() { if (courseState.unlocked.night) $('[data-unit="night"]')?.classList.remove('locked'); if (courseState.unlocked.moves) $('[data-unit="moves"]')?.classList.remove('locked'); if (courseState.unlocked.canon) $('[data-unit="canon"]')?.classList.remove('locked'); }
function applyLearner(learner) {
  courseState.xp = learner.xp || 0;
  courseState.unlocked.night = courseState.unlocked.night || learner.completedStages?.includes('opening');
  courseState.unlocked.moves = courseState.unlocked.moves || learner.completedStages?.includes('night');
  courseState.unlocked.canon = courseState.unlocked.canon || learner.completedStages?.includes('moves');
  saveCourse(); updateXp(); applyUnlocks();
}
async function recordLearningEvent(event) {
  try {
    const response = await Seder.api(`/api/learners/${learnerId}/events`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(event) });
    if (!response.ok) throw new Error('Learning service unavailable');
    applyLearner(await response.json());
  } catch (_) { saveCourse(); }
}
async function loadLearner() {
  try {
    const response = await Seder.api(`/api/learners/${learnerId}`);
    if (!response.ok) throw new Error('Learning service unavailable');
    applyLearner(await response.json());
  } catch (_) { updateXp(); applyUnlocks(); }
}
function shuffledAnswers(step) { return step.answers.map((text, index) => ({ text, index })).sort(() => Math.random() - 0.5); }
function renderStep() {
  const step = activeSteps[current];
  answered = false;
  updateXp(); applyUnlocks();
  $('#stepType').textContent = step.type;
  $('#masteryStatus').textContent = current === 0 ? 'IN PROGRESS' : `MOVE ${current + 1}`;
  $('#progressLabel').textContent = `MOVE ${current + 1} OF ${activeSteps.length}`;
  $('#progressBar').style.width = `${((current + 1) / activeSteps.length) * 100}%`;
  $('#promptContent').innerHTML = `<h2>${step.title}</h2><p class="prompt">${step.prompt}</p><div class="prompt-source">${step.quote}</div>`;
  $('#sourceHebrew').textContent = step.hebrew;
  $('#sourceTranslation').textContent = step.translation;
  $('#liveTranslation').textContent = step.translation;
  $('#sourceReason').textContent = step.reason;
  $('#readerFocus').innerHTML = `<span>FOCUS IN THE DAF</span><strong>${step.focus}</strong>`;
  const focus = $('#pageFocus');
  if (focus && step.hotspot) { const [top, left, width, height] = step.hotspot; focus.style.top = top; focus.style.left = left; focus.style.width = width; focus.style.height = height; }
  const answers = $('#answerList'); answers.innerHTML = '';
  shuffledAnswers(step).forEach(({ text, index }) => { const button = document.createElement('button'); button.type = 'button'; button.textContent = text; button.dataset.correct = String(index === step.correct); answers.appendChild(button); });
  $('#answerFeedback').textContent = ''; $('#nextMove').disabled = false;
  $('#nextMove').innerHTML = 'Continue <span>→</span>';
}
$('#answerList').addEventListener('click', (event) => {
  const answer = event.target.closest('button'); if (!answer || answered) return;
  answered = true; $('#answerList').querySelectorAll('button').forEach((button) => { button.disabled = true; });
  const correct = answer.dataset.correct === 'true';
  if (correct) { answer.classList.add('correct'); courseState.xp += 10; $('#answerFeedback').textContent = '+10 XP. You identified the move on the page, not just a fact about it.'; }
  else { answer.classList.add('incorrect'); courseState.xp += 5; $('#answerFeedback').textContent = '+5 XP for the attempt. You can continue to see the explanation, then meet this move again in review.'; }
  saveCourse(); updateXp(); $('#nextMove').focus();
  recordLearningEvent({ type: 'answer_submitted', skillId: `${activeUnit}-${current + 1}`, correct });
});
$('#nextMove').addEventListener('click', () => {
  if (!answered) { $('#answerFeedback').textContent = 'Choose an answer first, then continue.'; return; }
  if (current < activeSteps.length - 1) { current += 1; renderStep(); return; }
  const title = activeUnit === 'opening' ? 'Berakhot 2a' : activeUnit === 'night' ? 'Berakhot 2b' : activeUnit === 'moves' ? 'Gemara moves' : 'Canon connections';
  $('#promptContent').innerHTML = `<div class="course-complete">You completed this guided reading of ${title}. The next unit is now ready in your course sequence.</div>`;
  $('#answerList').innerHTML = ''; $('#answerFeedback').textContent = 'The same source-first method now carries into the next unit.'; $('#nextMove').disabled = true; $('#masteryStatus').textContent = 'MASTERY EARNED';
  if (activeUnit === 'opening') courseState.unlocked.night = true;
  if (activeUnit === 'night') courseState.unlocked.moves = true;
  if (activeUnit === 'moves') courseState.unlocked.canon = true;
  saveCourse(); applyUnlocks();
  recordLearningEvent({ type: 'stage_mastered', stageId: activeUnit });
});
$('#dafStage').addEventListener('click', (event) => { if (event.target.closest('#pageFocus')) $('#readerFocus').scrollIntoView({ behavior: 'smooth', block: 'nearest' }); });
function showTextualDaf() { $('#dafStage').classList.remove('is-zoomed'); $('#zoomDaf').hidden = true; $('#dafStage').innerHTML = `<article class="textual-daf" lang="he" dir="rtl"><h2>ברכות ב׳ ב</h2><p class="textual-highlight">וּמַאי “וְטָהֵר”? טְהַר יוֹמָא.</p><p>סימן לדבר: צֵאת הַכּוֹכָבִים.</p><p>וְאוֹמֵר: וְהָיוּ לָנוּ הַלַּיְלָה מִשְׁמָר וְהַיּוֹם מְלָאכָה.</p></article>`; }
function showMovesDaf() { $('#dafStage').classList.remove('is-zoomed'); $('#zoomDaf').hidden = true; $('#dafStage').innerHTML = `<article class="textual-daf" lang="he" dir="rtl"><h2>כלי קריאה בגמרא</h2><p class="textual-highlight">שאלה · תשובה · ראיה</p><p>לכל משפט בסוגיה יש תפקיד. חפשו את התפקיד לפני שמחליטים מה הוא מוכיח.</p></article>`; }
function showCanonDaf() { $('#dafStage').classList.remove('is-zoomed'); $('#zoomDaf').hidden = true; $('#dafStage').innerHTML = `<article class="textual-daf" lang="he" dir="rtl"><h2>דברים ו׳:ז׳</h2><p class="textual-highlight">וְדִבַּרְתָּ בָּם בְּשָׁכְבְּךָ וּבְקוּמֶךָ</p><p>תורה → משנה → גמרא</p></article>`; }
document.querySelectorAll('.unit').forEach((unit) => unit.addEventListener('click', () => {
  if (unit.classList.contains('locked')) return;
  document.querySelectorAll('.unit').forEach((item) => item.classList.toggle('active', item === unit));
  if (unit.dataset.unit === 'opening') { activeUnit = 'opening'; activeSteps = openingSteps; current = 0; $('#reader-title').textContent = 'Berakhot 2a'; $('#readerLink').href = 'https://www.sefaria.org/Berakhot.2a'; showScannedDaf(); renderStep(); }
  if (unit.dataset.unit === 'night') { activeUnit = 'night'; activeSteps = nightSteps; current = 0; $('#reader-title').textContent = 'Berakhot 2b'; $('#readerLink').href = 'https://www.sefaria.org/Berakhot.2b'; showTextualDaf(); renderStep(); }
  if (unit.dataset.unit === 'moves') { activeUnit = 'moves'; activeSteps = movesSteps; current = 0; $('#reader-title').textContent = 'Gemara moves'; $('#readerLink').href = 'https://www.sefaria.org/Berakhot.2a'; showMovesDaf(); renderStep(); }
  if (unit.dataset.unit === 'canon') { activeUnit = 'canon'; activeSteps = canonSteps; current = 0; $('#reader-title').textContent = 'Canon connections'; $('#readerLink').href = 'https://www.sefaria.org/Deuteronomy.6.7'; showCanonDaf(); renderStep(); }
}));
$('#zoomDaf').addEventListener('click', () => { const stage = $('#dafStage'); stage.classList.toggle('is-zoomed'); $('#zoomDaf').textContent = stage.classList.contains('is-zoomed') ? 'Fit daf' : 'Zoom daf'; });
$('#continueDirect').addEventListener('click', () => $('#nextMove').click());
$('#translateToggle').addEventListener('click', () => { const panel = $('#translationPanel'); panel.hidden = !panel.hidden; $('#translateToggle').textContent = panel.hidden ? 'Translate passage' : 'Hide translation'; });
applyUnlocks(); updateXp(); renderStep(); loadLearner();

// The opening source is a working text page: a learner can select any line before answering about it.
function showScannedDaf() {
  $('#dafStage').classList.remove('is-zoomed');
  $('#zoomDaf').hidden = true;
  $('#dafStage').innerHTML = `<article class="working-daf" lang="he" dir="rtl"><h2>ברכות ב ע״א</h2><p class="daf-instruction" dir="ltr">Click a line to place it in the guided reader.</p><button type="button" data-daf-step="0">מֵאֵימָתַי קוֹרִין אֶת שְׁמַע בְּעַרְבִין?</button><button type="button" data-daf-step="1">תַּנָּא הֵיכָא קָאֵי דְּקָתָנֵי מֵאֵימָתַי?</button><button type="button" data-daf-step="2">תַּנָא אַקְרָא קָאֵי, דִּכְתִיב: בְּשָׁכְבְּךָ וּבְקוּמֶךָ</button><button type="button" data-daf-step="3">מִשְׁנָה · שְׁאֵלָה · תְּשׁוּבָה</button></article><div class="folio-mark">ב</div>`;
}
$('#dafStage').addEventListener('click', (event) => {
  const line = event.target.closest('[data-daf-step]');
  if (!line) return;
  current = Number(line.dataset.dafStep);
  renderStep();
});
