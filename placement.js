const checks = [
  { skill: 'hebrew-decoding', label: 'HEBREW DECODING', source: 'מֵאֵימָתַי', prompt: 'Which description best fits this word in the opening Mishnah?', answers: ['A question asking from when / at what time.', 'A final ruling about prayer.', 'A name of a person.'], correct: 0 },
  { skill: 'mishnah-orientation', label: 'MISHNAH ORIENTATION', source: 'שְׁנַיִם אוֹחֲזִין בְּטַלִּית', prompt: 'What situation does this Mishnah set up?', answers: ['Two people make competing claims over an object.', 'A person prepares for Shabbat.', 'A teacher tells a historical story.'], correct: 0 },
  // A learner's placement previously never produced any signal for the `translation`
  // competency (see recommendFor in server.mjs, whose very first post-placement gate
  // checks competencies.translation), so every new learner was routed into the
  // language-foundation step regardless of whether they already knew this vocabulary.
  // This check gives that gate a real, placement-based signal instead of a hardcoded 0.
  { skill: 'language-baseline', label: 'VOCABULARY BASELINE', source: 'תַּנְיָא', prompt: 'What does this single word typically introduce in a Gemara sugya?', answers: ['A cited teaching from outside the Mishnah.', 'A final vote among the Sages.', 'The name of a tractate.'], correct: 0 },
  { skill: 'gemara-moves', label: 'GEMARA MOVES', source: 'תַּנָּא הֵיכָא קָאֵי?', prompt: 'What is the Gemara asking the reader to investigate?', answers: ['What earlier context the Mishnah is responding to.', 'Which person should receive an object.', 'How to pronounce a Hebrew word.'], correct: 0 },
  { skill: 'proof-texts', label: 'SOURCE REASONING', source: 'דִּכְתִיב: בְּשָׁכְבְּךָ וּבְקוּמֶךָ', prompt: 'What role does the verse play in an argument?', answers: ['It supplies a textual reason or support for the claim.', 'It ends the discussion without explanation.', 'It introduces an unrelated narrative.'], correct: 0 },
  // The checks below were previously missing entirely: Halakha, Chumash, and Jewish
  // Thought had zero placement signal, so every learner started those tracks at 0
  // mastery regardless of experience (see recommendFor's source-literacy gate, which
  // already routes toward chumash-arc.html but had no placement data to act on).
  // Each skill id below matches a real skill already taught in that track's course
  // lesson (halakha-arc.js / chumash-arc.js / philosophy.js), so a strong placement
  // answer here seeds real, review-covered mastery rather than an orphaned score.
  { skill: 'halakha-torah-directive', label: 'HALAKHIC SOURCE CHAIN', source: 'וְאָכַלְתָּ וְשָׂבָעְתָּ וּבֵרַכְתָּ אֶת ה׳ אֱלֹהֶיךָ', prompt: 'What does this verse provide for later halakhic study?', answers: ['A Torah directive connecting eating, satisfaction, and blessing.', 'A complete list of every later blessing.', 'A final ruling for every practical situation.'], correct: 0 },
  { skill: 'tanakh-address-claim', label: 'CHUMASH CLOSE READING', source: 'שְׁמַע יִשְׂרָאֵל ה׳ אֱלֹהֵינוּ ה׳ אֶחָד', prompt: 'What is the first close-reading task?', answers: ['Identify who is addressed and what claim the verse makes.', 'Find a later halakhic code immediately.', 'Treat the verse as a list of disconnected words.'], correct: 0 },
  { skill: 'thought-identify-claim', label: 'JEWISH THOUGHT', source: 'וְיָדַעְתָּ הַיּוֹם וַהֲשֵׁבֹתָ אֶל לְבָבֶךָ', prompt: 'What is the central claim the verse asks a learner to take seriously?', answers: ['Knowledge of God must move from awareness into the heart.', 'All questions have already been answered.', 'Only outward action matters.'], correct: 0 }
];
const learnerId = Seder.currentLearnerId();
let index = 0;
const scores = {};
const $ = (selector) => document.querySelector(selector);
function render() {
  const check = checks[index];
  $('#progress').textContent = `CHECK ${index + 1} OF ${checks.length}`;
  $('#skill-label').textContent = check.label;
  $('#source').textContent = check.source;
  $('#prompt').textContent = check.prompt;
  document.querySelectorAll('#dots li').forEach((dot, dotIndex) => dot.classList.toggle('active', dotIndex === index));
  const answers = $('#answers'); answers.innerHTML = '';
  check.answers.forEach((answer, answerIndex) => { const button = document.createElement('button'); button.type = 'button'; button.textContent = answer; button.addEventListener('click', () => { scores[check.skill] = answerIndex === check.correct ? 1 : .25; if (index < checks.length - 1) { index += 1; render(); } else complete(); }); answers.appendChild(button); });
}
function complete() {
  $('#status').textContent = 'SAVING YOUR STARTING POINT';
  Seder.api(`/api/learners/${learnerId}/events`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'placement_completed', scores }) }).then((response) => response.ok ? response.json() : Promise.reject()).then(() => { location.href = 'path.html?v=6'; }).catch(() => { $('#status').textContent = 'Placement could not be saved.'; });
}
render();
