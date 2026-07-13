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
const thirdMonth = [
  ['Cairo Geniza study protocol', 'זִכָּרוֹן · עֵדוּת · רְאָיָה', 'historical-context', 'What must an archive reader ask first?', 'What this source is evidence for, whose voice it preserves, and what remains uncertain.'],
  ['Maimonides, Deot 1:4', 'הַדֶּרֶךְ הַיְשָׁרָה', 'define-conceptual-term', 'What makes a conceptual term usable?', 'A precise definition and evidence for how the source uses it.'],
  ['Bava Kamma 2a return', 'לֹא הֲרֵי הַשּׁוֹר', 'bava-kamma-independent-map', 'What does returning to a source test?', 'Whether the distinction and shared principle can be explained from the text.'],
  ['Ninety-day retrieval', 'חֲזָרָה · רְאָיָה', 'source-signals', 'Why retrieve a source move after time has passed?', 'To make it available in a new context rather than merely familiar.'],
  ['Gemara continuation', 'סוּגְיָא · מַסֶּכֶת · חֲזָרָה', 'independent-sugya-reading', 'What should choose the next tractate move?', 'Evidence of what is secure, uncertain, or ready for transfer.'],
  ['Unfamiliar Gemara source', 'מֵיתִיבֵי · לָא קַשְׁיָא', 'challenge-and-answer', 'What should you find before evaluating an answer?', 'The earlier claim or case that the objection pressures.'],
  ['Shabbat 21b', 'מַעֲלִין בַּקֹּדֶשׁ וְאֵין מוֹרִידִין', 'canonical-reception', 'What distinguishes two reasons for one practice?', 'The explanatory principle each reason supplies and the pattern it clarifies.'],
  ['Canon connection protocol', 'מָקוֹר · הֶקְשֵׁר · טַעַן · נִימוּק', 'comparative-reading', 'What makes a cross-canon connection serious?', 'A shared question and a source-grounded difference in purpose or claim.'],
  ['Study record', 'מַפָּה · חֲזָרָה · שְׁאֵלָה', 'independent-sugya-reading', 'What belongs in a learner portfolio?', 'Source maps, demonstrated moves, reviews due, and an honest next question.'],
  ['Independent synthesis', 'מָקוֹר חָדָשׁ · טַעַן · רְאָיָה', 'independent-sugya-reading', 'What proves independent source reading?', 'A map supported by textual evidence and a named uncertainty.'],
  ['Vocabulary retrieval', 'קֻשְׁיָא · תֵּרוּץ · רְאָיָה', 'challenge-and-answer', 'What is vocabulary retrieval for?', 'Using the words to identify an argument’s moves in a new source.'],
  ['Tractate continuation', 'מִשְׁנָה · גְּמָרָא', 'mishnah-orientation', 'What is a disciplined way to enter a new tractate?', 'Map its first case before deciding what later discussion will prove.'],
  ['Pirkei Avot 2:5 return', 'הִשְׁתַּדֵּל לִהְיוֹת אִישׁ', 'conceptual-application', 'What keeps ethical study serious?', 'A source, a real tension, and a modest practice rather than a slogan.'],
  ['Weekly durability review', 'חֲזָרָה · בֵּירוּר', 'source-signals', 'What does a durable review ask?', 'Can you use the move again without relying on the original screen.'],
  ['Sugya notebook', 'שְׁאֵלָה · רְאָיָה · קֻשְׁיָא · תֵּרוּץ', 'independent-sugya-reading', 'What should a notebook reveal?', 'How every line advances the argument and what remains to be checked.'],
  ['Gemara unseen check', 'מַעֲשֶׂה · טַעֲנָה · רְאָיָה', 'independent-sugya-reading', 'What is the strongest first move with an unseen case?', 'Name its people or object, condition, open question, and evidence.'],
  ['Freedom source connection', 'וְיָדַעְתָּ הַיּוֹם', 'identify-conceptual-claim', 'What should a learner compare between sources on freedom?', 'Their precise claims, terms, reasons, and contexts.'],
  ['Long-term canon map', 'תּוֹרָה · תַּלְמוּד · תְּפִלָּה · מַעֲשֶׂה', 'canonical-reception', 'What does one integrated canon path preserve?', 'Connections between forms without treating their genres as identical.'],
  ['Review calendar', 'חֲזָרָה · זְמַן · זִכָּרוֹן', 'source-signals', 'Why return to a due source move?', 'Retrieval makes evidence durable and reveals what needs repair.'],
  ['Next ninety days', 'שְׁאֵלָה · הַדְרָכָה', 'independent-sugya-reading', 'How should a learner set the next horizon?', 'Choose a question and source path from recorded evidence, not novelty alone.'],
  ['Geniza evidence return', 'עֵדוּת · פֵּרוּשׁ', 'historical-context', 'What distinction protects historical reasoning?', 'Evidence of an event is not identical to a later interpretation of it.'],
  ['Comparison: the mean', 'מִדָּה · אֶמְצַע · הֶקְשֵׁר', 'comparative-reading', 'What prevents a comparison from flattening sources?', 'State the shared structure and the different foundations or aims.'],
  ['Bava Kamma transfer', 'כְּלָל · חִלּוּק', 'bava-kamma-independent-map', 'What does a transferred category require?', 'Test whether the new case shares the relevant structure and where it differs.'],
  ['Portfolio retrieval', 'מַפָּה · רְאָיָה · חֲזָרָה', 'independent-sugya-reading', 'What does a portfolio let a learner see?', 'What has been demonstrated, what is fading, and the next responsible move.'],
  ['Independent source map', 'מָקוֹר · הֶקְשֵׁר · טַעַן', 'independent-sugya-reading', 'What must precede a personal reaction?', 'A map of the source’s own claim, evidence, and context.'],
  ['Chanukah disagreement return', 'אֵלּוּ וָאֵלּוּ', 'canonical-reception', 'What does a machloket ask you to preserve?', 'Distinct reasons and source chains before a practical conclusion.'],
  ['Unseen-source transfer', 'מַפָּה מוּכֶּרֶת · מָקוֹר חָדָשׁ', 'independent-sugya-reading', 'What is evidence of transfer?', 'Using a familiar move while naming the new source’s particular features.'],
  ['Synthesis reflection', 'טַעַן · נִימוּק · שְׁאֵלָה', 'sourceReasoning', 'What makes a reflection accountable?', 'It names a claim, the source evidence, and a question that remains open.'],
  ['Canon journey', 'תּוֹרָה · תַּלְמוּד · מַחֲשָׁבָה', 'canonical-reception', 'What is the learner ready to do after ninety days?', 'Enter a new source with a map, evidence, uncertainty, and a deliberate next move.'],
  ['Next mastery horizon', 'חֲזָרָה · הַשְׁוָאָה · הַדְרָכָה', 'independent-sugya-reading', 'What is mastery at this stage?', 'Responsible independent navigation that still knows when to retrieve, compare, or seek guidance.']
].map(([citation, hebrew, skill, prompt, answer]) => ({ citation, hebrew, skill, prompt, answer }));
const secondMonth = [
  ['Berakhot 2a: opening question', 'תַּנָּא הֵיכָא קָאֵי', 'gemara-context-question', 'What does this Gemara question make you recover?', 'The prior context that makes the Mishnah’s opening question intelligible.'],
  ['Genesis 22:1', 'וְהָאֱלֹהִים נִסָּה אֶת אַבְרָהָם', 'define-conceptual-term', 'Why clarify the word “test” before interpreting the narrative?', 'Different definitions create different questions about the same source.'],
  ['Mishnah Shabbat 1:1', 'יְצִיאוֹת הַשַּׁבָּת שְׁתַּיִם שֶׁהֵן אַרְבַּע', 'shabbat-independent-map', 'What is the strongest map of this compact opening?', 'The action, people, domains, and how the cases are counted.'],
  ['Berakhot delayed retrieval', 'מֵאֵימָתַי', 'mishnah-orientation', 'What must remain visible when returning to this opening?', 'The practical case before the later argument begins.'],
  ['Independent source map', 'מַעֲשֶׂה · שְׁאֵלָה · רְאָיָה', 'independent-sugya-reading', 'What makes a map useful in a new source?', 'It names the case, question, evidence, and remaining uncertainty.'],
  ['Pesachim 2a', 'מַאי אוֹר', 'pesachim-independent-map', 'What should a reader test about this word?', 'How its meaning changes the source’s time and legal case.'],
  ['Kaddish', 'יִתְגַּדַּל וְיִתְקַדַּשׁ שְׁמֵהּ רַבָּא', 'liturgical-function', 'What should you identify before translating every word?', 'The prayer’s communal form of sanctification and address.'],
  ['Eruvin 2a', 'מָבוֹי שֶׁהוּא גָבוֹהַּ לְמַעְלָה מֵעֶשְׂרִים אַמָּה', 'eruvin-independent-map', 'What must be joined to the number twenty?', 'The object, condition, response, and reason it matters.'],
  ['Vocabulary retrieval', 'מִשְׁנָה · גְּמָרָא · סְבָרָא', 'source-signals', 'What does recognizing a genre word allow you to do?', 'Predict the source’s reading job, then verify it in context.'],
  ['Sugya notebook', 'שְׁאֵלָה · קֻשְׁיָא · תֵּרוּץ', 'challenge-and-answer', 'What should a notebook preserve?', 'Which claim is pressured and how the response addresses it.'],
  ['Bava Metzia 2a', 'שְׁנַיִם אוֹחֲזִין בְּטַלִּית', 'bava-metzia-independent-map', 'What is not yet proof in this case?', 'Each claimant’s assertion; it must remain distinct from evidence.'],
  ['Exodus 20:12', 'כַּבֵּד אֶת אָבִיךָ וְאֶת אִמֶּךָ', 'canonical-reception', 'What does a responsible source chain add to this command?', 'Later categories and reasoning without replacing the verse’s voice.'],
  ['Bava Kamma 2a', 'לֹא הֲרֵי הַשּׁוֹר כַּהֲרֵי הַמַּבְעֶה', 'bava-kamma-independent-map', 'What does the distinction make possible?', 'A shared principle that does not erase relevant differences.'],
  ['Weekly retrieval: claims', 'טַעֲנָה · רְאָיָה', 'proof-role', 'What question separates a claim from evidence?', 'What support is offered and whether it answers the claim at hand.'],
  ['Unseen source transfer', 'מָקוֹר חָדָשׁ · מַפָּה מוּכֶּרֶת', 'independent-sugya-reading', 'How should a familiar reading move meet a new source?', 'Carry the move forward while naming what the new source changes.'],
  ['Mishnah Sukkah 1:1', 'סֻכָּה שֶׁהִיא גְבוֹהָה מֵעֶשְׂרִים אַמָּה פְּסוּלָה', 'sukkah-independent-map', 'What should follow the stated invalidity?', 'A question about purpose, reason, and proof-text role.'],
  ['Jewish Thought: freedom', 'וְיָדַעְתָּ הַיּוֹם', 'identify-conceptual-claim', 'What must a conceptual reader state?', 'The source’s precise claim, not only its general topic.'],
  ['Halakhic machloket', 'אֵלּוּ וָאֵלּוּ דִּבְרֵי אֱלֹהִים חַיִּים', 'canonical-reception', 'What does serious disagreement require?', 'Map each reason and context before asking how practice is decided.'],
  ['Repair and retrieval', 'חֲזָרָה · בֵּירוּר', 'source-signals', 'What makes repair productive?', 'Returning to the missed move with a clear contrast and fresh evidence.'],
  ['Independent reading', 'מָקוֹר · הֶקְשֵׁר · טַעַן', 'independent-sugya-reading', 'What belongs before a conclusion?', 'A source map, textual evidence, and an honest uncertainty.'],
  ['Yavneh: Gittin 56b', 'תֵּן לִי יַבְנֶה וַחֲכָמֶיהָ', 'historical-context', 'What does context help you distinguish here?', 'A source’s narrative claim, its setting, and later historical interpretation.'],
  ['Berakhot return', 'מֵאֵימָתַי קוֹרִין', 'mishnah-orientation', 'What does revisiting a familiar opening test?', 'Whether you can map its case before relying on recognition.'],
  ['Ahavat Yisrael', 'וְאָהַבְתָּ לְרֵעֲךָ כָּמוֹךָ', 'conceptual-application', 'What is a text-grounded application?', 'Name the source’s claim and a modest practice without turning it into coercion.'],
  ['Weekly retrieval: community', 'קוֹל · זִכָּרוֹן · מוֹסָד', 'historical-context', 'What should historical reading keep distinct?', 'Event, memory, voice, and institution.'],
  ['Canon connection map', 'תּוֹרָה · תַּלְמוּד · תְּפִלָּה', 'canonical-reception', 'What connects distinct canon forms without flattening them?', 'A shared question alongside each source’s distinct role and setting.'],
  ['Amidah', 'בָּרוּךְ אַתָּה ה׳', 'liturgical-function', 'What is the first move in reading a blessing?', 'Name whether it is praise, petition, thanks, or another form of address.'],
  ['Psalm 23', 'ה׳ רֹעִי לֹא אֶחְסָר', 'source-signals', 'What does poetic parallel and image require?', 'Attention to voice, metaphor, and the relation between lines.'],
  ['Shabbat return', 'הֶעָנִי עוֹמֵד בַּחוּץ', 'shabbat-independent-map', 'What must still be mapped in a return visit?', 'People, locations, action, and the boundary crossed.'],
  ['Vocabulary transfer', 'רְאָיָה · קֻשְׁיָא · תֵּרוּץ', 'challenge-and-answer', 'Why retrieve these words in a new tractate?', 'To use their argumentative jobs, not merely recognize their sounds.'],
  ['Source-map reflection', 'מַעֲשֶׂה · טַעַן · נִימוּק', 'independent-sugya-reading', 'What should a reflection add to a source map?', 'What the source established, what evidence supports it, and a next question.']
].map(([citation, hebrew, skill, prompt, answer]) => ({ citation, hebrew, skill, prompt, answer }));
const weeklyTransfer = { citation: 'Fresh related source', hebrew: 'מָקוֹר חָדָשׁ · שְׁאֵלָה מוּכֶּרֶת', prompt: 'You meet a related source in a different genre. What proves a reading habit has transferred?', answer: 'Use the same reading move while naming what is genuinely different in the new source.' };
const item = day <= 30 ? firstMonth[day - 1] : day <= 60 ? secondMonth[day - 31] : thirdMonth[day - 61];
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
