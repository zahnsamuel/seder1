const sources = [
  { id: 'berakhot', lens: 'Gemara', citation: 'Berakhot 2a', hebrew: 'מאימתי קורין את שמע בערבין', translation: 'From when may one recite the Shema in the evenings?', note: 'An opening question establishes a practice, a time, and a source problem before a conclusion is reached.', focus: 'the time question and the practice it frames', skillId: 'source-signals', competency: 'argument' },
  { id: 'shabbat', lens: 'Gemara', citation: 'Mishnah Shabbat 2a', hebrew: 'יציאות השבת שתים שהן ארבע', translation: 'The acts of carrying out on Shabbat are two that are four.', note: 'A compact opening divides a case into categories that need to be mapped before they are applied.', focus: 'the categories and the case behind the count', skillId: 'shabbat-independent-map', competency: 'argument' },
  { id: 'pesachim', lens: 'Gemara', citation: 'Pesachim 2a', hebrew: 'אור לארבעה עשר בודקין את החמץ', translation: 'On the or of the fourteenth, one searches for leaven.', note: 'One word can create a serious interpretive question when its meaning changes the time of the case.', focus: 'the word that places the case in time', skillId: 'pesachim-independent-map', competency: 'argument' },
  { id: 'eruvin', lens: 'Gemara', citation: 'Eruvin 2a', hebrew: 'מבוי שהוא גבוה למעלה מעשרים אמה ימעט', translation: 'An alleyway whose entrance is higher than twenty cubits must be lowered.', note: 'A measurement belongs to an object, a condition, a response, and a reason.', focus: 'the object, measurement, and required response', skillId: 'eruvin-independent-map', competency: 'argument' },
  { id: 'bava-metzia', lens: 'Gemara', citation: 'Bava Metzia 2a', hebrew: 'שנים אוחזין בטלית', translation: 'Two people are holding a garment.', note: 'Competing assertions must be kept distinct from the evidence and procedure that later address them.', focus: 'the shared object and the competing claimants', skillId: 'bava-metzia-independent-map', competency: 'argument' },
  { id: 'deuteronomy', lens: 'Torah & Halakha', citation: 'Deuteronomy 6:4', hebrew: 'שמע ישראל ה׳ אלהינו ה׳ אחד', translation: 'Hear, Israel: the Lord is our God, the Lord is one.', note: 'A Torah address can later become a practice, a liturgical text, and a subject of Rabbinic reasoning without losing its original voice.', focus: 'the address, audience, and later source life of the verse', skillId: 'canonical-reception', competency: 'sourceReasoning' },
  { id: 'amidah', lens: 'Tefillah', citation: 'Amidah, first blessing', hebrew: 'ברוך אתה ה׳ אלהינו ואלהי אבותינו', translation: 'Blessed are You, the Lord our God and God of our ancestors.', note: 'Prayer has a form of address and praise before it turns to petition or thanks.', focus: 'the form of address and inherited relationship', skillId: 'liturgical-function', competency: 'sourceReasoning' },
  { id: 'jeremiah', lens: 'History & Wider World', citation: 'Jeremiah 29:7', hebrew: 'ודרשו את שלום העיר', translation: 'Seek the welfare of the city.', note: 'The source addresses a displaced community in a specific historical setting; context is evidence for reading.', focus: 'the audience, setting, and public question', skillId: 'historical-context', competency: 'sourceReasoning' }
];

const cycles = [
  { id: 'signals', title: 'Signals and first questions', lens: 'Reading precision', summary: 'Use small words and source form to predict the work a line is about to do.', prompt: 'What should you identify before translating every word?', answer: 'The source signal and the reading job it announces.' },
  { id: 'case-map', title: 'Cases, people, and conditions', lens: 'Argument mapping', summary: 'Map concrete cases before deciding what a source proves or requires.', prompt: 'What belongs in a strong first map?', answer: 'The people or object, the condition, and the question still open.' },
  { id: 'evidence', title: 'Claims and evidence', lens: 'Source reasoning', summary: 'Separate an assertion from the source, reason, or proof offered for it.', prompt: 'What should you ask when a source supplies support?', answer: 'What claim is being supported and what work the evidence is doing.' },
  { id: 'distinction', title: 'Categories and distinctions', lens: 'Argument mapping', summary: 'Notice the difference that allows similar cases or ideas to be treated differently.', prompt: 'What is the next move when two cases seem alike?', answer: 'Ask which relevant difference changes the source’s reasoning.' },
  { id: 'reception', title: 'A source has a later life', lens: 'Canon in conversation', summary: 'Trace how a source is received in later practice, prayer, or interpretation.', prompt: 'What must a reader preserve in a source chain?', answer: 'Both the original setting and the later use or question.' },
  { id: 'comparison', title: 'Comparison without flattening', lens: 'Comparative reading', summary: 'Put texts in conversation by naming a shared question and a real difference.', prompt: 'What makes a comparison accountable?', answer: 'A shared question, each source’s context, and a precise difference.' },
  { id: 'transfer', title: 'Retrieve and transfer', lens: 'Durable mastery', summary: 'Use a familiar source habit in a different genre or problem rather than relying on recognition.', prompt: 'What demonstrates that a reading habit transfers?', answer: 'Using the same map on a fresh source while naming what changes.' },
  { id: 'synthesis', title: 'Independent source navigation', lens: 'Independent study', summary: 'Make an accountable map, state uncertainty honestly, and choose the next study move.', prompt: 'What belongs in a responsible independent reading?', answer: 'A source map, evidence, one stated uncertainty, and a deliberate next step.' }
];

export function advancedCanonSessions() {
  let previousStage = 'canon-independent-next-step';
  return cycles.flatMap((cycle, cycleIndex) => sources.map((source, sourceIndex) => {
    const stageId = `canon-${cycle.id}-${source.id}`;
    const title = `${cycle.title}: ${source.citation}`;
    const context = `${cycle.id} · ${source.citation}`;
    const session = {
      id: `${cycle.id}-${source.id}`,
      stageId,
      lens: source.lens,
      title,
      summary: `${cycle.summary} Work with ${source.focus}.`,
      prerequisiteStages: [previousStage],
      source: { citation: source.citation, hebrew: source.hebrew, translation: source.translation, note: source.note },
      practice: {
        prompt: `In 12–30 words, make a source map of ${source.focus}.`,
        hint: `${cycle.title}: name what you see in the source before making a broader claim.`,
        minLength: 24
      },
      questions: [
        { skillId: source.skillId, competency: source.competency, sourceContext: `${context} first move`, prompt: `${cycle.prompt} Read ${source.citation} with attention to ${source.focus}.`, choices: [cycle.answer, 'Treat the source as a slogan without its setting.', 'Choose a conclusion before mapping the source.'], correct: 0, explanation: `${cycle.title} turns close reading into a reusable habit.` },
        { skillId: source.skillId, competency: source.competency, sourceContext: `${context} transfer`, prompt: `How would this habit help when you meet a different source with a related question?`, choices: ['Carry the reading move forward, then name what is genuinely different in the new source.', 'Assume a familiar word makes both sources identical.', 'Ignore context once you recognize a topic.'], correct: 0, explanation: 'Transfer preserves a reading habit while respecting a new source’s particular form.' }
      ]
    };
    previousStage = stageId;
    return session;
  }));
}

export const advancedCanonPhaseTitles = [
  'Signals and first questions', 'Cases, people, and conditions', 'Claims and evidence', 'Categories and distinctions',
  'A source has a later life', 'Comparison without flattening', 'Retrieve and transfer', 'Independent source navigation'
];
