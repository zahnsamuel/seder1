const stateKey = 'seder-demo-progress-v1';
const defaultState = {
  placed: false,
  level: 'new',
  completedLesson: false,
  completedQuestion: false,
  completedFlow: false,
  completedBerakhot: false,
  mastery: { words: 0, question: 0, flow: 0, berakhot: 0 },
  attempts: { words: 0, question: 0, flow: 0, berakhot: 0 },
};
const savedState = JSON.parse(localStorage.getItem(stateKey) || '{}');
let state = {
  ...defaultState,
  ...savedState,
  mastery: { ...defaultState.mastery, ...(savedState.mastery || {}) },
  attempts: { ...defaultState.attempts, ...(savedState.attempts || {}) },
};

const $ = (selector) => document.querySelector(selector);
const placementDialog = $('#placementDialog');
const lessonDialog = $('#lessonDialog');
const lessonContent = $('#lessonContent');

function save() { localStorage.setItem(stateKey, JSON.stringify(state)); }
function addNodeAction(node, label) {
  if (!node.querySelector('em')) node.insertAdjacentHTML('beforeend', `<em>${label}</em>`);
}
function markComplete(node) {
  node.className = node.dataset.node === 'berakhot' ? 'skill-node crown complete' : 'skill-node complete';
  const icon = node.querySelector('.node-icon');
  if (icon) icon.textContent = '\u2713';
  node.querySelector('em')?.remove();
}
function markAvailable(node, number, label) {
  node.className = node.dataset.node === 'berakhot' ? 'skill-node crown available' : 'skill-node available';
  let icon = node.querySelector('.node-icon');
  if (!icon) {
    node.insertAdjacentHTML('afterbegin', `<span class="node-icon">${number}</span>`);
    icon = node.querySelector('.node-icon');
  }
  icon.textContent = number;
  addNodeAction(node, label);
}

function updateUI() {
  const percent = state.completedBerakhot ? 100 : state.completedFlow ? 75 : state.completedQuestion ? 50 : state.completedLesson ? 25 : state.placed ? 8 : 0;
  $('#progressPercent').textContent = `${percent}%`;
  $('#progressFill').style.width = `${percent}%`;
  $('#progressText').textContent = state.completedBerakhot
    ? 'Berakhot 2a onramp complete. You are ready to continue studying.'
    : state.completedFlow
      ? 'Three reading skills mastered. Your guided reading is ready.'
      : state.completedQuestion
        ? 'Two reading skills mastered. Follow a sugya\'s flow is next.'
        : state.completedLesson
          ? 'One reading skill mastered. Your next skill is ready.'
          : state.placed ? 'Your starting point is ready. Begin your first lesson.' : 'Begin with a short placement check.';

  const words = $('[data-node="words"]');
  const question = $('[data-node="question"]');
  const flow = $('[data-node="flow"]');
  const berakhot = $('[data-node="berakhot"]');
  if (state.completedLesson) { markComplete(words); markAvailable(question, '2', 'Next'); }
  if (state.completedQuestion) { markComplete(question); markAvailable(flow, '3', 'Next'); }
  if (state.completedFlow) { markComplete(flow); markAvailable(berakhot, '4', 'Begin'); }
  if (state.completedBerakhot) markComplete(berakhot);
}

function showStep(step) {
  lessonContent.querySelectorAll('.lesson-step').forEach((el) => el.classList.toggle('active', el.dataset.step === String(step)));
  const activeStep = lessonContent.querySelector('.lesson-step.active');
  const answers = activeStep?.querySelector('.answers');
  if (answers && !answers.dataset.shuffled) {
    [...answers.querySelectorAll('button')]
      .sort(() => Math.random() - 0.5)
      .forEach((button) => answers.appendChild(button));
    answers.dataset.shuffled = 'true';
  }
  const feedback = lessonContent.querySelector('.feedback');
  if (feedback) feedback.textContent = '';
}
function setLesson(name, markup) {
  lessonContent.dataset.lesson = name;
  lessonContent.innerHTML = markup;
  lessonDialog.showModal();
}
function openWordsLesson() {
  lessonContent.dataset.lesson = 'words';
  showStep(state.completedLesson ? 4 : 1);
  lessonDialog.showModal();
}
function openQuestionLesson() { setLesson('question', state.completedQuestion ? questionMasteredMarkup() : questionLessonMarkup()); }
function openFlowLesson() { setLesson('flow', state.completedFlow ? flowMasteredMarkup() : flowLessonMarkup()); }
function openBerakhotLesson() { setLesson('berakhot', state.completedBerakhot ? berakhotMasteredMarkup() : berakhotLessonMarkup()); }
function openCurrentLesson() {
  if (!state.completedLesson) openWordsLesson();
  else if (!state.completedQuestion) openQuestionLesson();
  else if (!state.completedFlow) openFlowLesson();
  else openBerakhotLesson();
}

function questionLessonMarkup() {
  return `<div class="lesson-step active" data-step="1">
    <span class="step-count">BERAKHOT ONRAMP - SKILL 2</span>
    <h2>Gemara keeps the conversation moving with questions.</h2>
    <p>After the Mishnah asks when evening Shema begins, the Gemara asks a new question: why does the Mishnah begin with this topic at all?</p>
    <blockquote class="source-quote"><p class="hebrew" lang="he" dir="rtl">תנא היכא קאי דקתני מאימתי?</p><strong>What is the Mishnah addressing that it begins, "From when"?</strong></blockquote>
    <p>Even before every word is familiar, you can spot the question mark: the Gemara is asking for the context behind a teaching.</p>
    <button class="button primary next-step">Continue <span>-&gt;</span></button>
  </div><div class="lesson-step" data-step="2">
    <span class="step-count">MASTERY CHECK</span><h2>What kind of move is the Gemara making?</h2>
    <p class="question-prompt">What is the Mishnah addressing that it begins, "From when"?</p>
    <div class="answers"><button data-correct="false">It gives the final rule for when to say Shema.</button><button data-correct="true">It asks why the Mishnah begins with this particular question.</button><button data-correct="false">It changes the topic from Shema to prayer.</button></div>
    <div class="feedback" aria-live="polite"></div>
  </div>`;
}
function questionMasteredMarkup() {
  return `<div class="lesson-step active" data-step="1"><span class="step-count">MASTERY EARNED</span><h2>You can now recognize a Gemara question.</h2><p>You saw the Gemara pause to ask what a Mishnah is responding to. That habit is the beginning of following a sugya.</p><div class="mastery-card"><span>UNLOCKED</span><strong>Follow a sugya's flow</strong><p>This skill is now available on your path.</p></div><button class="button primary" data-action="return-path">Return to my path <span>-&gt;</span></button></div>`;
}
function flowLessonMarkup() {
  return `<div class="lesson-step active" data-step="1">
    <span class="step-count">BERAKHOT ONRAMP - SKILL 3</span><h2>A sugya moves forward: question, then answer.</h2>
    <p>After asking why the Mishnah begins with evening Shema, the Gemara answers by connecting it to a verse from the Torah.</p>
    <div class="word-card"><span class="node-icon">?</span><div><strong>Question</strong><p>Why does the Mishnah start with the evening?</p></div></div>
    <div class="word-card"><span class="node-icon">A</span><div><strong>Answer</strong><p>Because the verse says, "when you lie down and when you arise."</p></div></div>
    <p>Do not read each statement alone. Ask what it is responding to.</p><button class="button primary next-step">Try a mastery check <span>-&gt;</span></button>
  </div><div class="lesson-step" data-step="2">
    <span class="step-count">MASTERY CHECK</span><h2>What does the Gemara do after its question?</h2>
    <p class="question-prompt">It explains the Mishnah's opening by connecting it to "when you lie down and when you arise."</p>
    <div class="answers"><button data-correct="false">It starts an unrelated topic.</button><button data-correct="true">It gives an answer that explains the Mishnah's order.</button><button data-correct="false">It repeats the question without adding anything.</button></div><div class="feedback" aria-live="polite"></div>
  </div>`;
}
function flowMasteredMarkup() {
  return `<div class="lesson-step active" data-step="1"><span class="step-count">MASTERY EARNED</span><h2>You can follow the first move of a sugya.</h2><p>You identified a Gemara question and the answer that responds to it. You are now ready to read the opening of Berakhot with those moves marked clearly.</p><div class="mastery-card"><span>UNLOCKED</span><strong>Read Berakhot 2a with guidance</strong><p>Your first guided page encounter is ready.</p></div><button class="button primary" data-action="return-path">Return to my path <span>-&gt;</span></button></div>`;
}
function berakhotLessonMarkup() {
  return `<div class="lesson-step active" data-step="1">
    <span class="step-count">GUIDED READING - BERAKHOT 2A</span><h2>Read the opening move with a guide beside you.</h2>
    <blockquote class="source-quote"><p class="hebrew" lang="he" dir="rtl">מֵאֵימָתַי קוֹרִין אֶת שְׁמַע בְּעַרְבִין?</p><strong>From when do we recite Shema in the evenings?</strong></blockquote>
    <div class="word-card"><span class="node-icon">?</span><div><strong>The Mishnah's question</strong><p>It asks for the beginning time of the evening recitation.</p></div></div>
    <p>You do not need to know every word to begin reading responsibly. First identify what the text is asking; then trace how the Gemara develops its answer.</p><button class="button primary next-step">Show mastery <span>-&gt;</span></button>
  </div><div class="lesson-step" data-step="2">
    <span class="step-count">GUIDED READING CHECK</span><h2>What can you now see in the opening line?</h2>
    <div class="answers"><button data-correct="false">A final decision about the exact time of Shema.</button><button data-correct="true">A question asking when the evening recitation begins.</button><button data-correct="false">A story about a person who recited Shema.</button></div><div class="feedback" aria-live="polite"></div>
  </div>`;
}
function berakhotMasteredMarkup() {
  return `<div class="lesson-step active" data-step="1"><span class="step-count">ONRAMP COMPLETE</span><h2>You have opened your first Gemara text skillfully.</h2><p>You can identify an opening question, distinguish a question from an answer, and read the first line of Berakhot with a clear purpose. This is a beginning, not a shortcut around the text.</p><div class="mastery-card"><span>FOUNDATION COMPLETE</span><strong>Berakhot 2a: first guided reading</strong><p>Return tomorrow to review these skills, then continue to the next move.</p></div><button class="button primary" data-action="return-path">Return to my path <span>-&gt;</span></button></div>`;
}

function completeDynamicLesson(name, feedback) {
  if (name === 'question') { state.completedQuestion = true; setTimeout(() => { lessonContent.innerHTML = questionMasteredMarkup(); }, 1100); }
  if (name === 'flow') { state.completedFlow = true; setTimeout(() => { lessonContent.innerHTML = flowMasteredMarkup(); }, 1100); }
  if (name === 'berakhot') { state.completedBerakhot = true; setTimeout(() => { lessonContent.innerHTML = berakhotMasteredMarkup(); }, 1100); }
  save(); updateUI();
  return feedback;
}

$('#startPlacement').addEventListener('click', () => placementDialog.showModal());
$('#finishPlacement').addEventListener('click', () => { state.placed = true; state.level = document.querySelector('input[name="level"]:checked').value; save(); updateUI(); });
if ($('#resumeLesson')?.tagName === 'BUTTON') $('#resumeLesson').addEventListener('click', openCurrentLesson);
if ($('#beginLesson')?.tagName === 'BUTTON') $('#beginLesson').addEventListener('click', openCurrentLesson);
$('.learning-map').addEventListener('click', (event) => {
  const node = event.target.closest('.skill-node.available');
  if (!node) return;
  if (node.dataset.node === 'words') openWordsLesson();
  if (node.dataset.node === 'question') openQuestionLesson();
  if (node.dataset.node === 'flow') openFlowLesson();
  if (node.dataset.node === 'berakhot') openBerakhotLesson();
});
$('#closeLesson').addEventListener('click', () => lessonDialog.close());
lessonContent.addEventListener('click', (event) => {
  const next = event.target.closest('.next-step');
  if (next) { const active = Number(lessonContent.querySelector('.lesson-step.active').dataset.step); showStep(active + 1); return; }
  if (event.target.closest('[data-action="return-path"], #finishLesson')) { lessonDialog.close(); return; }
  const button = event.target.closest('button[data-correct]');
  if (!button) return;
  const answers = button.closest('.answers');
  const feedback = answers.nextElementSibling;
  answers.querySelectorAll('button').forEach((item) => { item.disabled = true; });
  const name = lessonContent.dataset.lesson;
  state.attempts[name] = (state.attempts[name] || 0) + 1;
  if (button.dataset.correct === 'true') {
    button.classList.add('correct');
    state.mastery[name] = 1;
    if (name === 'words') {
      feedback.textContent = 'Exactly. You identified the time-question that opens the discussion.';
      state.placed = true; state.completedLesson = true; save(); updateUI();
      setTimeout(() => showStep(4), 1100);
    } else if (name === 'question') {
      feedback.textContent = completeDynamicLesson(name, 'Exactly. The Gemara is asking why the Mishnah starts with that question.');
    } else if (name === 'flow') {
      feedback.textContent = completeDynamicLesson(name, 'Exactly. The Gemara answers the question by explaining the Mishnah\'s order.');
    } else {
      feedback.textContent = completeDynamicLesson(name, 'Exactly. You recognized the opening question and its purpose.');
    }
  } else {
    button.classList.add('incorrect');
    save();
    feedback.textContent = name === 'question' ? 'Look for the new question: it asks why the Mishnah begins this way.' : name === 'flow' ? 'The second statement explains the first question; that is an answer.' : 'Look again at "From when?" It is asking about the starting time.';
    setTimeout(() => answers.querySelectorAll('button').forEach((item) => { item.disabled = false; item.classList.remove('incorrect'); }), 850);
  }
});
const curriculumDetails = {
  decode: { kicker: 'BEGINNER FOUNDATION', title: 'Decode Hebrew', text: 'Strengthen accurate sound-to-letter recognition, so a learner can approach a line of text without fear.', evidence: 'Read an unfamiliar short phrase aloud accurately.', source: 'Shema, Deuteronomy 6:4' },
  vocabulary: { kicker: 'BEGINNER FOUNDATION', title: '250 core words', text: 'Learn the high-frequency Hebrew and Aramaic words that recur across the canon and reduce the feeling of a blank page.', evidence: 'Recognize core question words, connectors, and common verbs in context.', source: 'Mishnah Berakhot 1:1' },
  mishnah: { kicker: 'BEGINNER FOUNDATION', title: 'Read a Mishnah', text: 'Learn to recognize a teaching, its speakers, its alternatives, and the practical question it is trying to settle.', evidence: 'State the question and positions in a short Mishnah.', source: 'Mishnah Berakhot 1:1' },
  entry: { kicker: 'GEMARA THRESHOLD', title: 'Enter Gemara', text: 'Bring sound, vocabulary, and Mishnah structure together to begin a daf with a calm, source-first method.', evidence: 'Identify the Mishnah, the Gemara question, and the first answer.', source: 'Berakhot 2a' },
  moves: { kicker: 'GEMARA CORE', title: 'Question and answer', text: 'See a sugya as a conversation with a purpose: one statement raises a problem and the next responds to it.', evidence: 'Label a question and its answer in a short passage.', source: 'Berakhot 2a' },
  proof: { kicker: 'GEMARA CORE', title: 'Proof and challenge', text: 'Trace how the Gemara brings a source as evidence, then tests whether that evidence truly proves the point.', evidence: 'Explain what a cited source is trying to establish.', source: 'Berakhot 2a-3a' },
  sugya: { kicker: 'GEMARA CORE', title: 'Follow a sugya', text: 'Track the sequence of claims, questions, proof texts, and conclusions without mistaking a temporary proposal for the final position.', evidence: 'Create a plain-English map of a short sugya.', source: 'Berakhot 2a' },
  independent: { kicker: 'GEMARA THRESHOLD', title: 'Independent daf study', text: 'Use the skill graph as scaffolding while reading an unfamiliar passage directly, with the text always in view.', evidence: 'Study a short daf segment, flag uncertainty, and cite the lines behind an explanation.', source: 'Learner-selected tractate' },
  torah: { kicker: 'CANON CONNECTION', title: 'Torah source', text: 'Start with the biblical language that gives the later discussion its vocabulary and stakes.', evidence: 'Locate and paraphrase the verse behind the discussion.', source: 'Deuteronomy 6:7' },
  mishnahsource: { kicker: 'CANON CONNECTION', title: 'Mishnah reframes it', text: 'See how the Mishnah turns a biblical phrase into a concrete question of practice and timing.', evidence: 'Explain what practical issue the Mishnah draws from the verse.', source: 'Mishnah Berakhot 1:1' },
  gemarasource: { kicker: 'CANON CONNECTION', title: 'Gemara investigates it', text: 'Trace how the Gemara asks why the Mishnah starts where it does and connects it back to Torah.', evidence: 'Identify the question and the verse-based answer.', source: 'Berakhot 2a' },
  later: { kicker: 'CANON CONNECTION', title: 'Later tradition responds', text: 'Follow how later commentators and halakhic works receive, clarify, or apply the discussion.', evidence: 'Compare a later formulation with its earlier source chain.', source: 'Rambam, Kriat Shema 1:9' },
};
function renderCurriculumDetail(key) {
  const detail = curriculumDetails[key];
  const panel = $('#curriculumDetail');
  panel.innerHTML = `<div class="detail-kicker">${detail.kicker}</div><h3>${detail.title}</h3><p>${detail.text}</p><div class="detail-outcome"><span>MASTERY EVIDENCE</span><strong>${detail.evidence}</strong></div><div class="detail-source"><span>TEXT CONNECTION</span><strong>${detail.source}</strong><small>Primary source remains visible in the lesson.</small></div>`;
}
function openCurriculumPreview(key) {
  const detail = curriculumDetails[key];
  const preview = $('#curriculumPreviewContent');
  preview.innerHTML = `<div class="preview-kicker">${detail.kicker}</div><h2>${detail.title}</h2><p>${detail.text}</p><div class="preview-source"><span>WHAT THE LEARNER PRACTICES</span><strong>${detail.evidence}</strong><small>Source anchor: ${detail.source}</small></div><p class="preview-dialog-note">This preview shows the mastery target and source connection. The Berakhot onramp is the first fully interactive lesson sequence.</p><div class="preview-actions"><button class="button primary" id="previewOpenOnramp">Open the interactive onramp <span>-&gt;</span></button><button class="button text-button" id="previewClose">Return to curriculum</button></div>`;
  $('#curriculumDialog').showModal();
}
document.querySelectorAll('.curriculum-tab').forEach((tab) => tab.addEventListener('click', () => {
  document.querySelectorAll('.curriculum-tab').forEach((item) => { item.classList.toggle('is-selected', item === tab); item.setAttribute('aria-selected', String(item === tab)); });
  document.querySelectorAll('.curriculum-lane').forEach((lane) => lane.classList.toggle('hidden', lane.dataset.lane !== tab.dataset.view));
  const firstNode = document.querySelector(`.curriculum-lane[data-lane="${tab.dataset.view}"] .curriculum-node`);
  document.querySelectorAll('.curriculum-node').forEach((node) => node.classList.toggle('selected', node === firstNode));
  renderCurriculumDetail(firstNode.dataset.curriculumNode);
}));
$('#curriculumMap').addEventListener('click', (event) => {
  const node = event.target.closest('.curriculum-node');
  if (!node) return;
  document.querySelectorAll('.curriculum-node').forEach((item) => item.classList.toggle('selected', item === node));
  renderCurriculumDetail(node.dataset.curriculumNode);
  openCurriculumPreview(node.dataset.curriculumNode);
});
$('#closeCurriculumPreview').addEventListener('click', () => $('#curriculumDialog').close());
$('#curriculumPreviewContent').addEventListener('click', (event) => {
  if (event.target.closest('#previewClose')) { $('#curriculumDialog').close(); return; }
  if (event.target.closest('#previewOpenOnramp')) { $('#curriculumDialog').close(); openCurrentLesson(); }
});
$('#resetProgress').addEventListener('click', () => { if (confirm('Reset this prototype\'s saved progress?')) { state = { ...defaultState }; save(); location.reload(); } });
updateUI();
