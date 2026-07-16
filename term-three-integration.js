const learnerId = Seder.currentLearnerId();
const $ = (selector) => document.querySelector(selector);

const steps = [
  { title: 'Begin with the positions themselves', citation: 'Mishnah Niddah 1:1', hebrew: 'שַׁמַּאי · הִלֵּל · חֲכָמִים', translation: 'Shammai · Hillel · the Sages.', sourceUrl: 'https://www.sefaria.org/Mishnah_Niddah.1.1', prompt: 'What does the opening Niddah dispute ask a careful learner to do before drawing any conclusion?', answers: ['State what each position measures and keep the three claims distinct before comparing them.', 'Choose the easiest position and treat the other voices as background.', 'Apply one position directly to a personal question.'], correct: 0, skillId: 'term-three-preserve-positions', sourceContext: 'term three Niddah positions', feedback: 'Yes. The first achievement is accuracy about each voice, not a rushed reconciliation.' },
  { title: 'A disagreement can be preserved without being flattened', citation: 'Eruvin 13b', hebrew: 'אֵלּוּ וָאֵלּוּ דִּבְרֵי אֱלֹהִים חַיִּים', translation: 'These and those are the words of the living God.', sourceUrl: 'https://www.sefaria.org/Eruvin.13b', prompt: 'What is the most responsible use of this line alongside a recorded disagreement?', answers: ['It strengthens the discipline of representing each side faithfully before discussing how a decision or later reading relates to it.', 'It means every position says exactly the same thing.', 'It removes any need to read the details of a dispute.'], correct: 0, skillId: 'term-three-preserve-voices', sourceContext: 'term three Eruvin voices', feedback: 'Right. Respect for multiple voices is not permission to blur their real differences.' },
  { title: 'Learning begins by receiving a source on its own terms', citation: 'Pirkei Avot 4:1', hebrew: 'אֵיזֶהוּ חָכָם? הַלּוֹמֵד מִכָּל אָדָם', translation: 'Who is wise? One who learns from every person.', sourceUrl: 'https://www.sefaria.org/Pirkei_Avot.4.1', prompt: 'How does this ethical teaching sharpen the reading habit from Niddah?', answers: ['A learner begins by listening for what another voice actually claims, rather than reducing it to a slogan or a caricature.', 'Wisdom means accepting every claim without examining its reasons.', 'The teaching applies only to sources with which a learner already agrees.'], correct: 0, skillId: 'term-three-learn-from-voices', sourceContext: 'term three Pirkei Avot learning', feedback: 'Exactly. Serious learning combines openness with close, discriminating reading.' },
  { title: 'Transfer: comparison comes after accurate mapping', citation: 'Niddah 1:1 · Eruvin 13b · Pirkei Avot 4:1', hebrew: 'מָקוֹר · קוֹל · הַבְחָנָה', translation: 'Source · voice · distinction.', sourceUrl: 'https://www.sefaria.org/Eruvin.13b', prompt: 'You meet two sources that appear to disagree. What is the next best first move?', answers: ['Map each source’s setting and claim, name the precise point of difference, and only then ask whether they can be compared.', 'Decide which source feels more modern before reading either one closely.', 'Assume that any difference proves one source is irrelevant.'], correct: 0, skillId: 'term-three-disagreement-transfer', sourceContext: 'term three disagreement transfer', feedback: 'You have carried a concrete Gemara habit into Jewish ethical and intellectual reading.' }
];

let index = 0;
let answered = false;
function shuffle(answers) { return answers.map((text, originalIndex) => ({ text, originalIndex })).sort(() => Math.random() - 0.5); }
function render() {
  const step = steps[index]; answered = false;
  $('#count').textContent = `SOURCE ${index + 1} OF ${steps.length}`;
  $('#title').textContent = step.title; $('#citation').textContent = step.citation;
  $('#hebrew').textContent = step.hebrew; $('#translation').textContent = step.translation;
  $('#sefaria').href = step.sourceUrl; $('#prompt').textContent = step.prompt;
  $('#feedback').textContent = ''; $('#continue').disabled = true;
  $('#continue').textContent = index === steps.length - 1 ? 'Complete integration →' : 'Continue →';
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
  const response = await Seder.api(`/api/learners/${learnerId}/events`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'answer_submitted', skillId: step.skillId, competency: 'sourceReasoning', sourceContext: step.sourceContext, correct }) }).catch(() => null);
  if (response?.ok) $('#xp').textContent = `${(await response.json()).xp} XP`;
}
$('#continue').addEventListener('click', async () => {
  if (!answered) return;
  if (index < steps.length - 1) { index += 1; render(); return; }
  await Seder.api(`/api/learners/${learnerId}/events`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'stage_mastered', stageId: 'term-three-disagreement-integration' }) }).catch(() => null);
  $('.lesson').innerHTML = '<p class="lesson-label">INTEGRATION EARNED</p><h2>You can preserve disagreement without flattening it.</h2><p>You moved from a concrete Mishnah to a wider discipline of reading: source first, voice second, precise distinction before comparison.</p><a class="continue" href="niddah-transfer.html">Practice the transfer →</a>';
});
Seder.api(`/api/learners/${learnerId}`).then((response) => response.ok ? response.json() : null).then((learner) => { $('#xp').textContent = `${learner?.xp || 0} XP`; });
render();
