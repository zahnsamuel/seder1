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
const firstMonth = [
  ['Language entry', 'מִלָּה · שְׁאֵלָה · פֵּרוּשׁ', 'hebrew-decoding', 'What is the responsible first move with an unfamiliar Hebrew source?', 'Notice a word signal, the source type, and the question before guessing a conclusion.'],
  ['Deuteronomy 6:4', 'שְׁמַע יִשְׂרָאֵל ה׳ אֱלֹהֵינוּ ה׳ אֶחָד', 'source-signals', 'What should a close reader name before tracing later interpretations?', 'The addressee, the claim being made, and the verse’s immediate setting.'],
  ['Deuteronomy 8:10', 'וְאָכַלְתָּ וְשָׂבָעְתָּ וּבֵרַכְתָּ', 'canonical-reception', 'What does this line ask a learner to keep visible?', 'A source can become a later practice while retaining its original voice.'],
  ['Berakhot 2a', 'תַּנָּא הֵיכָא קָאֵי', 'gemara-context-question', 'What hidden problem is the Gemara asking you to recover?', 'The prior context that makes the Mishnah’s “from when” opening intelligible.'],
  ['Hebrew source vocabulary', 'מֵאֵימָתַי · שְׁאֵלָה · תְּשׁוּבָה', 'hebrew-decoding', 'How should a learner use a familiar source word?', 'Use it as a signal for the line’s job, then verify it in context.'],
  ['Amidah opening', 'בָּרוּךְ אַתָּה ה׳', 'liturgical-function', 'What is this language doing before it gives information?', 'Addressing God in a form of praise.'],
  ['Deuteronomy 4:39', 'וְיָדַעְתָּ הַיּוֹם וַהֲשֵׁבֹתָ אֶל לְבָבֶךָ', 'identify-conceptual-claim', 'What claim does this verse make beyond its topic?', 'Knowledge is meant to be brought into one’s inner life.'],
  ['Mishnah Shabbat 1:1', 'יְצִיאוֹת הַשַּׁבָּת שְׁתַּיִם שֶׁהֵן אַרְבַּע', 'shabbat-independent-map', 'What must be mapped before later Gemara analysis?', 'The people, domains, actions, and categories behind the count.'],
  ['Jeremiah 29:7', 'וְדִרְשׁוּ אֶת שְׁלוֹם הָעִיר', 'historical-context', 'What makes historical context evidence rather than decoration?', 'It identifies speaker, audience, setting, and purpose.'],
  ['Weekly retrieval: Shema', 'שְׁמַע יִשְׂרָאֵל', 'canonical-reception', 'What must remain when a Torah verse is used in prayer?', 'Both the verse’s original setting and its later liturgical role.'],
  ['Covenant source', 'וְשִׁנַּנְתָּם לְבָנֶיךָ', 'source-signals', 'What question should precede a later application of this command?', 'Who is addressed, what is commanded, and in what setting.'],
  ['Blessing formulation', 'בָּרוּךְ אַתָּה ה׳', 'liturgical-function', 'What reading move distinguishes a blessing from a legal case?', 'Name its form of address and the function it performs.'],
  ['Pesachim 2a', 'מַאי אוֹר', 'pesachim-independent-map', 'Why does one short word deserve close attention?', 'Its meaning can change the time and structure of the case.'],
  ['Vocabulary retrieval', 'קֻשְׁיָא · תֵּרוּץ', 'challenge-and-answer', 'What do these terms ask you to locate in a sugya?', 'The pressure of an objection and the response that addresses it.'],
  ['Pirkei Avot 2:5', 'בְּמָקוֹם שֶׁאֵין אֲנָשִׁים הִשְׁתַּדֵּל לִהְיוֹת אִישׁ', 'conceptual-application', 'What is a careful application of this teaching?', 'A call to responsibility, without turning it into a personal legal ruling.'],
  ['Unseen-source protocol', 'שְׁאֵלָה · רְאָיָה · קֻשְׁיָא · תֵּרוּץ', 'independent-sugya-reading', 'What order helps with an unfamiliar short sugya?', 'Map the case and line roles, then use supports to verify.'],
  ['Eruvin 2a', 'מָבוֹי שֶׁהוּא גָבוֹהַּ לְמַעְלָה מֵעֶשְׂרִים אַמָּה יְמַעֵט', 'eruvin-independent-map', 'What makes the measure meaningful?', 'Its object, condition, response, and reason.'],
  ['Repair protocol', 'חֲזָרָה · בֵּירוּר', 'source-signals', 'What should happen after uncertainty is revealed?', 'Return to the source move, clarify the uncertainty, and test it again.'],
  ['Source map protocol', 'מַעֲשֶׂה · שְׁאֵלָה · רְאָיָה', 'independent-sugya-reading', 'What does a useful source map preserve?', 'The case, the question, the evidence, and what remains unresolved.'],
  ['Weekly retrieval: Eruvin', 'עֶשְׂרִים אַמָּה', 'eruvin-independent-map', 'What should you ask after locating a measure?', 'Why this threshold matters for this object and case.'],
  ['Mishnah Sukkah 1:1', 'סֻכָּה שֶׁהִיא גְבוֹהָה לְמַעְלָה מֵעֶשְׂרִים אַמָּה פְּסוּלָה', 'sukkah-independent-map', 'What should follow identification of this ruling?', 'Ask for the reason and proof-text role that explain its purpose.'],
  ['Exodus 20:2', 'אָנֹכִי ה׳ אֱלֹהֶיךָ', 'identify-conceptual-claim', 'What does this line require before philosophical reflection?', 'State its claim and setting before comparing later interpretations.'],
  ['Fresh-source protocol', 'מָקוֹר · הֶקְשֵׁר · טַעַן', 'independent-sugya-reading', 'What proves that your reading habit has transferred?', 'Use the same map on a new source while naming what changes.'],
  ['Bava Metzia 2a', 'שְׁנַיִם אוֹחֲזִין בְּטַלִּית', 'bava-metzia-independent-map', 'What must remain distinct before judging the case?', 'The shared object, each claim, and later evidence or procedure.'],
  ['Vocabulary: proof', 'רְאָיָה · תּוֹשְׁמַע', 'proof-role', 'What should you ask when a proof-text enters?', 'What claim it is being asked to support, clarify, or challenge.'],
  ['History and wider world', 'מָקוֹר · הֶקְשֵׁר · הַשְׁוָאָה', 'comparative-reading', 'What makes a comparison accountable?', 'A shared question, each source in context, and a precise difference.'],
  ['Bava Kamma 2a', 'לֹא הֲרֵי הַשּׁוֹר כַּהֲרֵי הַמַּבְעֶה', 'bava-kamma-independent-map', 'Why name a difference before a common principle?', 'To preserve a relevant difference while finding a shared structure.'],
  ['Weekly transfer: categories', 'כְּלָל · פְּרָט · חִלּוּק', 'comparative-reading', 'What does responsible transfer do with similar cases?', 'It tests a shared structure while asking which difference matters.'],
  ['Canon connection', 'תּוֹרָה · תַּלְמוּד · תְּפִלָּה · מַעֲשֶׂה', 'canonical-reception', 'What is the first sequence for a new Jewish source?', 'Name its form and context, read its language, then trace its connections.'],
  ['Independent synthesis', 'חֲזָרָה · בֵּירוּר · הַשְׁוָאָה · הַדְרָכָה', 'independent-sugya-reading', 'How should a learner choose the next study move?', 'Use evidence to decide between retrieval, a new source, repair, or further guidance.']
].map(([citation, hebrew, skill, prompt, answer]) => ({ citation, hebrew, skill, prompt, answer }));
const weeklyTransfer = { citation: 'Fresh related source', hebrew: 'מָקוֹר חָדָשׁ · שְׁאֵלָה מוּכֶּרֶת', prompt: 'You meet a related source in a different genre. What proves a reading habit has transferred?', answer: 'Use the same reading move while naming what is genuinely different in the new source.' };
const item = day <= 30 ? firstMonth[day - 1] : bank[(day - 1) % bank.length];
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
