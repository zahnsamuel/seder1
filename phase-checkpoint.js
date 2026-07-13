const learnerId = Seder.currentLearnerId();
const phaseId = new URLSearchParams(location.search).get('phase');
const prompts = {
  'phase-1': [
    ['A new source begins with a short unfamiliar Hebrew word. What is your first responsible move?', ['Look for signals, source type, and the shape of the question before guessing a conclusion.', 'Skip the source and find a final ruling.', 'Memorize the word without context.'], 0],
    ['Why does a Mishnah’s concrete case matter before the Gemara begins?', ['It gives the practical situation and category that the later argument investigates.', 'It is only an illustration with no legal role.', 'It replaces the need to read the Gemara.'], 0]
  ],
  'phase-2': [
    ['A Torah verse appears later in prayer or halakha. What should a careful reader preserve?', ['Both its original setting and the role it takes in later reception.', 'Only the newest use of the verse.', 'Only an English paraphrase.'], 0],
    ['What makes a comparison between two Jewish sources useful?', ['A shared question, a precise difference, and attention to context.', 'Treating different genres as interchangeable.', 'Choosing the more familiar source.'], 0]
  ],
  'phase-3': [
    ['An objection enters a sugya. What do you identify first?', ['The earlier claim or case that the objection pressures.', 'The final ruling before reading the response.', 'A random familiar word.'], 0],
    ['A response distinguishes two cases. What has it usually done?', ['Shown why the objection does not apply in exactly the same way.', 'Changed the subject entirely.', 'Proven that sources never conflict.'], 0]
  ],
  'phase-4': [
    ['You meet an unfamiliar Jewish source. What is the strongest reading sequence?', ['Name the genre and context, read its language, map its claim or move, then trace connections.', 'Start by choosing a practical ruling.', 'Treat every source as a Gemara argument.'], 0],
    ['What does independent learning mean in Seder?', ['Responsible source navigation, including knowing when further guidance and community matter.', 'Never asking another reader for help.', 'Having a final answer immediately.'], 0]
  ],
  'phase-5': [
    ['A source quotes a verse or another authority. What should a careful reader do first?', ['Identify what kind of source has entered and the argumentative job it is being asked to do.', 'Assume the discussion is over.', 'Skip directly to a personal conclusion.'], 0],
    ['Why return to a Torah line after meeting it in a later source?', ['To preserve both the earlier setting and the later question or reception.', 'To prove only the later source matters.', 'To avoid reading the original words.'], 0]
  ],
  'phase-6': [
    ['A new Gemara opening presents a compact case. What is the strongest first map?', ['Name the object or parties, the condition, the question, and what remains to be established.', 'Memorize the first number you see.', 'Choose a ruling before mapping the case.'], 0],
    ['Why compare two tractates that use a similar category or measurement?', ['To ask what each structure, purpose, and distinction reveals—not merely to match vocabulary.', 'To assume the cases are automatically identical.', 'To skip the source-specific reasoning.'], 0]
  ],
  'phase-7': [
    ['Two Jewish sources seem to address a shared question differently. What comes first?', ['State the shared question and each source’s claim, terms, and context before judging the difference.', 'Reduce both views to a slogan.', 'Choose the more familiar source without evidence.'], 0],
    ['What keeps a comparison with another intellectual tradition responsible?', ['Read each source in context, name a real shared question, and preserve meaningful differences.', 'Assume a resemblance proves everything.', 'Treat one tradition as a stereotype.'], 0]
  ],
  'phase-8': [
    ['You meet an unfamiliar sugya and cannot yet translate every word. What should you do?', ['Map the case and likely moves, use supports to verify, and name what remains uncertain.', 'Guess the final ruling immediately.', 'Discard the page until every word is known.'], 0],
    ['When a source raises practical or personal stakes, what is responsible independence?', ['Recognize the limits of the study exercise and seek appropriate qualified guidance or community.', 'Treat the lesson as a personal ruling.', 'Avoid every serious question.'], 0]
  ]
};
const advancedCheckpoint = [
  ['What is the evidence of a durable reading habit?', ['You can use it on a new source while naming what the new source changes.', 'You remember one familiar answer.', 'You skip the source after recognizing its topic.'], 0],
  ['What makes independent source study responsible?', ['A clear map, evidence from the text, honest uncertainty, and an appropriate next question or resource.', 'A final conclusion without reading.', 'Treating study support as personal guidance.'], 0]
];
let phase, answered = 0, correct = 0;
const checkpointSkills = { 'phase-1': 'mishnah-orientation', 'phase-2': 'canonical-reception', 'phase-3': 'challenge-and-answer', 'phase-4': 'independent-sugya-reading', 'phase-5': 'canonical-reception', 'phase-6': 'bava-kamma-independent-map', 'phase-7': 'comparative-reading', 'phase-8': 'independent-sugya-reading' };
const shuffle = (items) => items.map((text, originalIndex) => ({ text, originalIndex })).sort(() => Math.random() - .5);
Promise.all([Seder.api(`/api/learners/${learnerId}/journey`).then((r) => r.json()), Seder.api(`/api/learners/${learnerId}`).then((r) => r.json())]).then(([journey]) => {
  phase = journey.phases.find((item) => item.id === phaseId) || journey.nextCheckpoint;
  if (!phase?.checkpointReady) { location.href = 'journey.html'; return; }
  document.querySelector('#title').textContent = `${phase.title}: demonstrate the connection.`;
  const questions = prompts[phase.id] || advancedCheckpoint;
  document.querySelector('#questions').innerHTML = questions.map(([prompt, choices], questionIndex) => `<article><b>CHECK ${questionIndex + 1}</b><h2>${prompt}</h2><div>${shuffle(choices).map(({ text, originalIndex }) => `<button data-question="${questionIndex}" data-choice="${originalIndex}">${text}</button>`).join('')}</div></article>`).join('');
  document.querySelectorAll('#questions button').forEach((button) => button.addEventListener('click', () => {
    const questionIndex = Number(button.dataset.question); if (button.parentElement.dataset.done) return; button.parentElement.dataset.done = 'true';
    const isCorrect = Number(button.dataset.choice) === questions[questionIndex][2]; correct += isCorrect ? 1 : 0; answered++;
    button.parentElement.querySelectorAll('button').forEach((item) => item.disabled = true);
    button.classList.add(isCorrect ? 'correct' : 'incorrect');
    if (!isCorrect) button.parentElement.querySelector(`[data-choice="${questions[questionIndex][2]}"]`).classList.add('correct');
    Seder.api(`/api/learners/${learnerId}/events`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'source_annotation', skillId: checkpointSkills[phase.id] || 'independent-sugya-reading', competency: phase.id === 'phase-3' || phase.id === 'phase-4' || Number(phase.id.split('-')[1]) >= 9 ? 'argument' : 'sourceReasoning', sourceContext: `${phase.id} checkpoint ${questionIndex + 1}`, correct: isCorrect }) }).catch(() => {});
    if (answered === questions.length) { document.querySelector('#continue').disabled = correct !== questions.length; document.querySelector('#feedback').textContent = correct === questions.length ? 'Checkpoint complete. The next phase is ready.' : 'Review the highlighted source moves, then revisit the completed canon moments before trying this checkpoint again.'; }
  }));
});
document.querySelector('#continue').addEventListener('click', async () => { const response = await Seder.api(`/api/learners/${learnerId}/events`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'stage_mastered', stageId: phase.checkpointStage }) }); if (response.ok) location.href = 'journey.html'; });
