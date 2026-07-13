const learnerId = Seder.currentLearnerId();
const requestedLevel = Number(new URLSearchParams(location.search).get('level'));
const $ = (selector) => document.querySelector(selector);

const reviewBanks = [
  { title: 'Foundations', items: [
    { skillId: 'mishnah-orientation', citation: 'Mishnah Berakhot 1:1', hebrew: 'מֵאֵימָתַי קוֹרִין אֶת שְׁמַע בְּעַרְבִית', prompt: 'What is the strongest first map?', choices: ['The practice, its time boundary, and the concrete case.', 'A later ruling before reading the case.', 'Only the word that looks most familiar.'], correct: 0 },
    { skillId: 'canonical-reception', citation: 'Deuteronomy 6:4', hebrew: 'שְׁמַע יִשְׂרָאֵל ה׳ אֱלֹהֵינוּ ה׳ אֶחָד', prompt: 'What should remain visible when this verse appears later in prayer?', choices: ['Its original address and its later liturgical role.', 'Only the later setting.', 'Only an English paraphrase.'], correct: 0 },
    { skillId: 'source-signals', citation: 'Berakhot 2a', hebrew: 'תַּנָּא הֵיכָא קָאֵי', prompt: 'What does this opening question ask a reader to recover?', choices: ['The context that makes the Mishnah’s opening intelligible.', 'A final ruling before the discussion.', 'A decorative quotation.'], correct: 0 }
  ] },
  { title: 'Gemara reader', items: [
    { skillId: 'challenge-and-answer', citation: 'Shabbat 2a', hebrew: 'מֵיתִיבֵי · לָא קַשְׁיָא', prompt: 'What comes first when an objection appears?', choices: ['Identify the earlier claim or case under pressure.', 'Choose the final ruling.', 'Ignore the target of the objection.'], correct: 0 },
    { skillId: 'independent-sugya-reading', citation: 'Pesachim 2a', hebrew: 'מַאי אוֹר', prompt: 'What is the disciplined first response to a contested word?', choices: ['Ask how its meaning changes the source’s case.', 'Treat it as an isolated vocabulary quiz.', 'Skip to a conclusion.'], correct: 0 },
    { skillId: 'proof-role', citation: 'Berakhot 2a', hebrew: 'דִּכְתִיב', prompt: 'What should you ask when a verse enters an argument?', choices: ['What claim the verse is doing work for.', 'Whether the verse ends every later question.', 'Which answer is shortest.'], correct: 0 }
  ] },
  { title: 'Return with precision', items: [
    { skillId: 'canonical-reception', citation: 'Deuteronomy 8:10', hebrew: 'וְאָכַלְתָּ וְשָׂבָעְתָּ וּבֵרַכְתָּ', prompt: 'How should a learner read this source in a later legal chain?', choices: ['Trace each source layer and its role.', 'Treat the verse as a complete personal ruling.', 'Skip every intervening source.'], correct: 0 },
    { skillId: 'bava-kamma-independent-map', citation: 'Bava Kamma 2a', hebrew: 'לֹא הֲרֵי הַשּׁוֹר כַּהֲרֵי הַמַּבְעֶה', prompt: 'Why state a difference before a shared principle?', choices: ['To preserve a relevant difference while finding a common structure.', 'To prove no categories connect.', 'To avoid mapping the case.'], correct: 0 },
    { skillId: 'mishnah-grammar', citation: 'Mishnah Shabbat 1:1', hebrew: 'יְצִיאוֹת הַשַּׁבָּת שְׁתַּיִם שֶׁהֵן אַרְבַּע', prompt: 'What does a counted formulation ask you to notice?', choices: ['How cases are grouped before later analysis.', 'A number with no case behind it.', 'A final practical instruction.'], correct: 0 }
  ] },
  { title: 'Independent orientation', items: [
    { skillId: 'comparative-reading', citation: 'Shemoneh Perakim, introduction', hebrew: 'קַבֵּל אֶת הָאֱמֶת מִמִּי שֶׁאֲמָרוֹ', prompt: 'What begins a responsible comparison?', choices: ['A shared question and each source in its own context.', 'A stereotype about either tradition.', 'The assumption that difference disappears.'], correct: 0 },
    { skillId: 'independent-sugya-reading', citation: 'Independent reading protocol', hebrew: 'שְׁאֵלָה · רְאָיָה · קֻשְׁיָא · תֵּרוּץ', prompt: 'What does an honest first map include?', choices: ['Likely moves, textual evidence, and what remains uncertain.', 'A final conclusion before reading.', 'Only words already known.'], correct: 0 },
    { skillId: 'historical-context', citation: 'Jeremiah 29:7', hebrew: 'וְדִרְשׁוּ אֶת שְׁלוֹם הָעִיר', prompt: 'What context is essential here?', choices: ['Speaker, displaced audience, setting, and purpose.', 'A modern claim the verse automatically settles.', 'The idea that location cannot matter.'], correct: 0 }
  ] }
];

const fallback = { title: 'Advanced source practice', items: [
  { skillId: 'independent-sugya-reading', citation: 'Independent study protocol', hebrew: 'חֲזָרָה · בֵּירוּר · הַשְׁוָאָה · הַדְרָכָה', prompt: 'What should determine your next source move?', choices: ['Evidence of what is secure, uncertain, or due for retrieval.', 'Only which lesson is shortest.', 'A claim of mastery without evidence.'], correct: 0 },
  { skillId: 'source-signals', citation: 'Berakhot 2a', hebrew: 'תַּנָּא הֵיכָא קָאֵי', prompt: 'What does a source signal help you do?', choices: ['Predict the reading work before jumping to a conclusion.', 'Avoid the context of the source.', 'Replace close reading with recognition.'], correct: 0 },
  { skillId: 'comparative-reading', citation: 'Interpretive comparison protocol', hebrew: 'מָקוֹר · מוּשָּׂג · טַעַן · נִימוּק', prompt: 'What makes comparison accountable?', choices: ['A source, concept, claim, reason, and real difference.', 'Two labels that sound alike.', 'A conclusion without evidence.'], correct: 0 }
] };

const bank = reviewBanks[requestedLevel - 1] || fallback;
let learner; let items = []; let index = 0;
const shuffle = (choices) => choices.map((text, originalIndex) => ({ text, originalIndex })).sort(() => Math.random() - .5);

function render() {
  const item = items[index];
  $('#card').innerHTML = `<p class="count">RETRIEVAL ${index + 1} OF ${items.length} · ${item.citation}</p><p class="hebrew" dir="rtl">${item.hebrew}</p><h2>${item.prompt}</h2><div class="answers">${shuffle(item.choices).map(({ text, originalIndex }) => `<button data-choice="${originalIndex}">${text}</button>`).join('')}</div><p id="feedback" aria-live="polite"></p>`;
  $('.answers').querySelectorAll('button').forEach((button) => button.addEventListener('click', () => answer(button, item)));
}

async function answer(button, item) {
  const correct = Number(button.dataset.choice) === item.correct;
  $('.answers').querySelectorAll('button').forEach((choice) => choice.disabled = true);
  button.classList.add(correct ? 'correct' : 'incorrect');
  if (!correct) $(`button[data-choice="${item.correct}"]`).classList.add('correct');
  $('#feedback').textContent = correct ? 'Secure. This reading move is ready to carry forward.' : 'Keep the highlighted move active. It will return again in your review rhythm.';
  const response = await Seder.api(`/api/learners/${learnerId}/events`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'source_annotation', skillId: item.skillId, competency: 'sourceReasoning', sourceContext: `level ${requestedLevel} retrieval · ${item.citation}`, correct }) });
  if (response.ok) { learner = await response.json(); $('#xp').textContent = `${learner.xp || 0} XP`; }
  setTimeout(() => { index++; if (index < items.length) render(); else { $('#card').innerHTML = `<p class="count">RETRIEVAL COMPLETE</p><h2>Return with a stronger repertoire.</h2><p>You have revisited the moves most useful for the next level. The journey remains the place to meet the next source.</p>`; $('#done').hidden = false; } }, 850);
}

Seder.api(`/api/learners/${learnerId}`).then((response) => response.ok ? response.json() : Promise.reject()).then((currentLearner) => {
  learner = currentLearner; $('#xp').textContent = `${learner.xp || 0} XP`; $('#title').textContent = `Strengthen Level ${requestedLevel}: ${bank.title}.`;
  items = [...bank.items].sort((a, b) => (learner.mastery?.[a.skillId] || 0) - (learner.mastery?.[b.skillId] || 0)).slice(0, 3);
  render();
}).catch(() => { location.href = 'journey.html'; });
