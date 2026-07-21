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
    ['What does independent learning mean in Jewish Learning Academy?', ['Responsible source navigation, including knowing when further guidance and community matter.', 'Never asking another reader for help.', 'Having a final answer immediately.'], 0]
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
const advancedPrompts = {
  'phase-9': [
    ['Berakhot 2a opens with a question about the Mishnah’s opening. Before solving it, what signal matters most?', ['The opening assumes a context the Gemara wants to recover.', 'The first word must be a final ruling.', 'The page is only asking for vocabulary.'], 0],
    ['A prayer blessing begins “Blessed are You.” What is the first reading question?', ['What form of address and function this language performs.', 'Which later custom automatically follows.', 'How to turn it into a Gemara objection.'], 0]
  ],
  'phase-10': [
    ['Two people hold one garment in Bava Metzia. What must your first source map keep separate?', ['The shared object, each claim, and the procedure that follows.', 'The claims, because they are automatically proof.', 'The later ruling, without the case.'], 0],
    ['A Mishnah gives a measurement for an alleyway or sukkah. What makes the number meaningful?', ['Its object, stated condition, response, and reason.', 'Its numerical size alone.', 'Its resemblance to an unrelated measure.'], 0]
  ],
  'phase-11': [
    ['A Gemara introduces a verse after making a claim. What question distinguishes evidence from assertion?', ['What claim the verse is being asked to support or clarify.', 'Whether the verse sounds familiar.', 'Whether a conclusion can be chosen before reading it.'], 0],
    ['A historical text describes a community’s response to pressure. What can it be evidence for?', ['Both an event and the way that community remembered or framed it.', 'A neutral camera with no viewpoint.', 'A timeless rule without context.'], 0]
  ],
  'phase-12': [
    ['An answer says two cases are not alike. What has it supplied?', ['A relevant distinction that limits the objection.', 'A refusal to answer the question.', 'Proof that categories never matter.'], 0],
    ['Two thinkers use the word “freedom” differently. What should you map?', ['Each definition, supporting source, and the consequence of the difference.', 'Only which thinker is more familiar.', 'A single definition that makes them agree.'], 0]
  ],
  'phase-13': [
    ['A Torah verse appears in the Siddur and later halakhic discussion. What does responsible reception preserve?', ['The verse’s original setting and each later role it takes on.', 'Only the newest use of the verse.', 'Only a translation detached from all contexts.'], 0],
    ['Why trace a source through several later forms?', ['To see how a tradition receives and specifies a source without erasing earlier voices.', 'To replace the original source entirely.', 'To avoid reading the intervening sources.'], 0]
  ],
  'phase-14': [
    ['What makes a comparison between a Jewish and another philosophical source responsible?', ['A shared question, each source’s setting, and a precise similarity and difference.', 'A stereotype about each tradition.', 'The assumption that resemblance erases difference.'], 0],
    ['Two sources use the same image but for different purposes. What should a reader conclude first?', ['Shared language may still serve different claims and contexts.', 'They must teach exactly the same thing.', 'Neither source needs close reading.'], 0]
  ],
  'phase-15': [
    ['You have mapped a Gemara case before. What shows the habit has transferred to a new source?', ['You use the map while naming what the new source changes.', 'You repeat an old answer without looking.', 'You assume every source has the same structure.'], 0],
    ['A source feels familiar but you cannot explain its line of reasoning. What is the best next move?', ['Retrieve the case, claim, evidence, and uncertainty before continuing.', 'Claim mastery from recognition.', 'Skip the source for a conclusion.'], 0]
  ],
  'phase-16': [
    ['What belongs in a responsible independent source map?', ['The source’s kind, its claim or move, textual evidence, and one honest uncertainty.', 'Only a personal reaction.', 'A final ruling without a map.'], 0],
    ['After an unfamiliar source, how should a learner choose the next move?', ['Use the evidence to decide between retrieval, a new source, repair, or further guidance.', 'Choose whichever lesson is shortest.', 'Treat uncertainty as a reason to stop learning.'], 0]
  ]
};
let phase, answered = 0, correct = 0;
const checkpointSkills = { 'phase-1': 'mishnah-orientation', 'phase-2': 'canonical-reception', 'phase-3': 'challenge-and-answer', 'phase-4': 'independent-sugya-reading', 'phase-5': 'canonical-reception', 'phase-6': 'bava-kamma-independent-map', 'phase-7': 'comparative-reading', 'phase-8': 'independent-sugya-reading' };
const levelCompletionByFinalPhase = { 'phase-2': 1, 'phase-4': 2, 'phase-6': 3, 'phase-8': 4, 'phase-10': 5, 'phase-12': 6, 'phase-14': 7, 'phase-16': 8 };
const shuffle = (items) => items.map((text, originalIndex) => ({ text, originalIndex })).sort(() => Math.random() - .5);
Promise.all([Seder.api(`/api/learners/${learnerId}/journey`).then((r) => r.json()), Seder.api(`/api/learners/${learnerId}`).then((r) => r.json())]).then(([journey]) => {
  phase = journey.phases.find((item) => item.id === phaseId) || journey.nextCheckpoint;
  if (!phase?.checkpointReady) { location.href = 'journey.html'; return; }
  document.querySelector('#title').textContent = `${phase.title}: demonstrate the connection.`;
  const questions = prompts[phase.id] || advancedPrompts[phase.id] || advancedCheckpoint;
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
document.querySelector('#continue').addEventListener('click', async () => { const response = await Seder.api(`/api/learners/${learnerId}/events`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'stage_mastered', stageId: phase.checkpointStage }) }); if (response.ok) { const level = levelCompletionByFinalPhase[phase.id]; location.href = level ? `level-complete.html?level=${level}` : 'journey.html'; } });
