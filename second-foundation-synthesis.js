const learnerId = Seder.currentLearnerId();
const $ = (selector) => document.querySelector(selector);

const steps = [
  { tractate: 'KETUBOT · FIXED DETAIL AND REASON', title: 'A schedule is not yet its explanation.', citation: 'Mishnah Ketubot 1:1', hebrew: 'בְּתוּלָה נִשֵּׂאת לְיוֹם הָרְבִיעִי', translation: 'A virgin is married on Wednesday.', sourceUrl: 'https://www.sefaria.org/Mishnah_Ketubot.1.1', prompt: 'What is the first reading move this fixed detail asks of you?', answers: ['Ask what practical or institutional concern the schedule is designed to serve.', 'Choose the weekday that sounds most meaningful today.', 'Treat the date as a rule without asking why it appears.'], correct: 0, skillId: 'foundation-synthesis-ketubot-reason', feedback: 'Yes. A fixed detail often carries an institutional reason that the discussion will uncover.' },
  { tractate: 'CHULLIN · RULE, LIMIT, AND SCOPE', title: 'An exception can teach the rule’s boundary.', citation: 'Mishnah Chullin 1:1', hebrew: 'הַכֹּל שׁוֹחֲטִין וּשְׁחִיטָתָן כְּשֵׁרָה', translation: 'Everyone may slaughter, and their slaughter is valid.', sourceUrl: 'https://www.sefaria.org/Mishnah_Chullin.1.1', prompt: 'When the source goes on to name qualifications, what is the responsible first move?', answers: ['State the broad rule, identify the qualifying case, and ask how it defines the rule’s scope.', 'Treat a qualification as proof that the broad rule was meaningless.', 'Memorize only the exception and ignore the rule it modifies.'], correct: 0, skillId: 'foundation-synthesis-chullin-scope', feedback: 'Right. A condition can clarify a rule’s reach without cancelling the rule.' },
  { tractate: 'NIDDAH · PRESERVING DISTINCT VOICES', title: 'Do not resolve a disagreement before reading it.', citation: 'Mishnah Niddah 1:1', hebrew: 'שַׁמַּאי אוֹמֵר כָּל הַנָּשִׁים דַּיָּן שְׁעָתָן · הִלֵּל אוֹמֵר מִפְּקִידָה לִפְקִידָה · וַחֲכָמִים אוֹמְרִים', translation: 'Shammai, Hillel, and the Sages give distinct measures for the case.', sourceUrl: 'https://www.sefaria.org/Mishnah_Niddah.1.1', prompt: 'What must a careful learner do before comparing these positions?', answers: ['State what each voice claims and keep the positions distinct before drawing comparisons.', 'Choose the easiest position and use it to summarize all three.', 'Apply a position directly to a personal question.'], correct: 0, skillId: 'foundation-synthesis-niddah-voices', feedback: 'Exactly. Accuracy about each voice comes before reconciliation or application.' },
  { tractate: 'SANHEDRIN · CATEGORY AND SPECIFICATION', title: 'A list of cases puts pressure on a category.', citation: 'Mishnah Sanhedrin 1:1', hebrew: 'דִּינֵי מָמוֹנוֹת בִּשְׁלֹשָׁה · גְּזֵלוֹת וַחֲבָלוֹת בִּשְׁלֹשָׁה', translation: 'Monetary cases are judged by three; cases of theft and injury are judged by three.', sourceUrl: 'https://www.sefaria.org/Mishnah_Sanhedrin.1.1', prompt: 'What question does this move from category to named cases invite?', answers: ['Ask why named cases are specified and what the examples reveal about the category.', 'Assume every named example adds no information to the category.', 'Treat court structure as personal legal advice.'], correct: 0, skillId: 'foundation-synthesis-sanhedrin-category', feedback: 'Yes. Specification is often a clue: it can expose how a category is being organized or limited.' },
  { tractate: 'WIDER CANON · JUDGMENT WITHOUT FLATTENING', title: 'Charitable judgment still requires accurate reading.', citation: 'Pirkei Avot 1:6', hebrew: 'וֶהֱוֵי דָן אֶת כָּל הָאָדָם לְכַף זְכוּת', translation: 'Judge every person favorably.', sourceUrl: 'https://www.sefaria.org/Pirkei_Avot.1.6', prompt: 'How does this teaching sharpen—rather than replace—the four source-reading moves?', answers: ['It supports patient, charitable interpretation where ambiguity remains, while preserving each source’s categories, evidence, and distinct claims.', 'It means every source and position says the same thing.', 'It removes the need to distinguish rules, cases, or voices.'], correct: 0, skillId: 'foundation-synthesis-charitable-reading', feedback: 'Well read. Generosity does not flatten difference; it makes careful interpretation more responsible.' }
];

let index = 0;
let answered = false;
function shuffle(answers) { return answers.map((text, originalIndex) => ({ text, originalIndex })).sort(() => Math.random() - 0.5); }
function render() {
  const step = steps[index]; answered = false;
  $('#count').textContent = `SOURCE ${index + 1} OF ${steps.length}`;
  $('#tractate').textContent = step.tractate; $('#title').textContent = step.title; $('#citation').textContent = step.citation;
  $('#hebrew').textContent = step.hebrew; $('#translation').textContent = step.translation; $('#sefaria').href = step.sourceUrl;
  $('#prompt').textContent = step.prompt; $('#feedback').textContent = ''; $('#continue').disabled = true;
  $('#continue').textContent = index === steps.length - 1 ? 'Complete Foundation Synthesis →' : 'Continue →';
  $('#choices').innerHTML = '';
  shuffle(step.answers).forEach(({ text, originalIndex }) => {
    const button = document.createElement('button'); button.type = 'button'; button.className = 'choice'; button.textContent = text;
    button.addEventListener('click', () => answer(button, originalIndex === step.correct, step)); $('#choices').append(button);
  });
}
async function answer(button, correct, step) {
  if (answered) return; answered = true;
  document.querySelectorAll('#choices button').forEach((item) => { item.disabled = true; });
  button.classList.add(correct ? 'good' : 'bad'); $('#feedback').textContent = `${correct ? '+10 XP. ' : '+5 XP. '}${step.feedback}`; $('#continue').disabled = false;
  const response = await Seder.api(`/api/learners/${learnerId}/events`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'answer_submitted', skillId: step.skillId, competency: 'sourceReasoning', sourceContext: `Foundation Synthesis: ${step.citation}`, correct }) }).catch(() => null);
  if (response?.ok) $('#xp').textContent = `${(await response.json()).xp} XP`;
}
$('#continue').addEventListener('click', async () => {
  if (!answered) return;
  if (index < steps.length - 1) { index += 1; render(); return; }
  await Seder.api(`/api/learners/${learnerId}/events`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'stage_mastered', stageId: 'second-foundation-synthesis' }) }).catch(() => null);
  $('.lesson').innerHTML = '<p class="lesson-label">FOUNDATION SYNTHESIS EARNED</p><h2>You can select a reading habit from the source in front of you.</h2><p>You distinguished reason, scope, voices, and category—and carried the discipline of careful judgment into the wider canon.</p><a class="continue" href="gemara-continuation.html">Enter the next Gemara source trail →</a>';
});
Seder.api(`/api/learners/${learnerId}`).then((response) => response.ok ? response.json() : null).then((learner) => { $('#xp').textContent = `${learner?.xp || 0} XP`; });
render();
