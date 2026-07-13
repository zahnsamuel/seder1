import { promises as fs } from 'node:fs';
import { join } from 'node:path';
import { advancedCanonSessions } from './advanced-canon-cycle.mjs';

let cachedJourney;
let cachedGemaraSequence;

const subjectRetrievals = {
  halakha: { label: 'HALAKHA RETRIEVAL', hebrew: 'תורה · משנה · גמרא · קוד', translation: 'Torah · Mishnah · Gemara · code.', prompt: 'When a practice is grounded across source layers, what is the first thing to identify?', answers: ['Which genre each source is, and what role it plays in the chain.', 'Only the final ruling.', 'The longest word.'], feedback: 'Halakhic literacy begins by naming each source layer’s role; study support is not a personal ruling.' },
  chumash: { label: 'CHUMASH RETRIEVAL', hebrew: 'פשט · הקשר · קבלה', translation: 'Plain sense · context · reception.', prompt: 'Before bringing later readings, what should a close reader establish?', answers: ['Speaker, audience, and the verse’s immediate claim.', 'Which commentator wins.', 'A final ruling.'], feedback: 'Read the verse in its own setting before tracing later reception.' },
  tefillah: { label: 'TEFILLAH RETRIEVAL', hebrew: 'ברוך · חננו · מודים', translation: 'Blessed · grant us · we give thanks.', prompt: 'Entering a section of prayer, what is the first move?', answers: ['Name the kind of address it makes: praise, petition, or thanks.', 'Memorize every word first.', 'Assume all sections are identical.'], feedback: 'Prayer is read by the form of address its language performs.' },
  history: { label: 'HISTORY RETRIEVAL', hebrew: 'זכרון · עדות · ראיה', translation: 'Memory · testimony · evidence.', prompt: 'Reading a historical source, what distinction comes first?', answers: ['Whether it is evidence of an event, of how it was remembered, or both.', 'That every source is a neutral camera.', 'That memory has no value.'], feedback: 'Sources are windows and voices at once.' },
  widerworld: { label: 'WIDER WORLD RETRIEVAL', hebrew: 'מקור · הקשר · השוואה', translation: 'Source · context · comparison.', prompt: 'Comparing a Jewish and a non-Jewish source, what is the responsible order?', answers: ['Read each in context, name the shared question, then compare.', 'Start from a stereotype.', 'Assume comparison erases difference.'], feedback: 'Compare without flattening: context, shared question, then similarity and difference.' },
  mussar: { label: 'MUSSAR RETRIEVAL', hebrew: 'מידה · מתח · הרגל', translation: 'Trait · tension · habit.', prompt: 'Studying a middah, what makes it serious rather than a slogan?', answers: ['Name the trait, its real tension, and the case that tests it.', 'Pick the nicest-sounding word.', 'Turn reflection into self-judgment.'], feedback: 'A middah is traced from source, to tension, to a real situation.' },
  chassidus: { label: 'CHASSIDUS RETRIEVAL', hebrew: 'מקור · מושג · השלכה', translation: 'Source · concept · implication.', prompt: 'Reading a Chassidic source, what is the responsible order?', answers: ['Read the source, define its concept, then consider an implication.', 'Begin with a feeling and make the text agree.', 'Skip the text for a slogan.'], feedback: 'Inner learning stays anchored in the text.' },
  thought: { label: 'JEWISH THOUGHT RETRIEVAL', hebrew: 'שאלה · קול · פירוש', translation: 'Question · voice · interpretation.', prompt: 'Holding several voices on a question, what is the first move?', answers: ['State what each voice claims before ranking them.', 'Pick the most comfortable answer.', 'Assume the voices agree.'], feedback: 'Jewish Thought holds distinct voices without flattening them.' }
};

function subjectReviewItem(skillId) {
  const key = Object.keys(subjectRetrievals).find((prefix) => skillId.startsWith(`${prefix}-`));
  const spec = key && subjectRetrievals[key];
  return spec && { trueSkillId: skillId, ...spec, correct: 0, sourceContext: `retrieval for ${skillId}`, variantId: `subject-${skillId}` };
}

export async function canonJourney(root) {
  if (!cachedJourney) {
    const [foundationFile, extensionFile] = await Promise.all([
      fs.readFile(join(root, 'curriculum', 'canon-journey.json'), 'utf8'),
      fs.readFile(join(root, 'curriculum', 'canon-journey-extension.json'), 'utf8')
    ]);
    const foundation = JSON.parse(foundationFile);
    const extension = JSON.parse(extensionFile);
    cachedJourney = {
      ...foundation,
      title: 'Integrated Canon Journey',
      description: `${foundation.description} Later cycles deepen language, argument, canon connections, transfer, and independent study through deliberate source practice.`,
      sessions: [...foundation.sessions, ...extension.sessions, ...advancedCanonSessions()]
    };
  }
  return cachedJourney;
}

export async function nextGemaraArc(root, learner) {
  if (!cachedGemaraSequence) cachedGemaraSequence = JSON.parse(await fs.readFile(join(root, 'data', 'advanced-gemara-sequence.json'), 'utf8'));
  const completed = new Set(learner.completedStages || []);
  return cachedGemaraSequence.steps.find((step) => !completed.has(step.stageId)) || null;
}

function skillsReady(learner, requirements = []) {
  return requirements.every((requirement) => (learner.mastery?.[requirement.skillId] || 0) >= (requirement.minimum || .67));
}

const phases = [
  { id: 'phase-1', title: 'Reading foundations', start: 0, end: 3 },
  { id: 'phase-2', title: 'Canon connections', start: 4, end: 9 },
  { id: 'phase-3', title: 'Gemara fluency', start: 10, end: 13 },
  { id: 'phase-4', title: 'Integrated reading', start: 14, end: 17 },
  { id: 'phase-5', title: 'Second foundation', start: 18, end: 21 },
  { id: 'phase-6', title: 'Gemara across Shas', start: 22, end: 26 },
  { id: 'phase-7', title: 'Canon and comparison', start: 27, end: 31 },
  { id: 'phase-8', title: 'Independent navigation', start: 32, end: 35 },
  { id: 'phase-9', title: 'Signals and first questions', start: 36, end: 43 },
  { id: 'phase-10', title: 'Cases, people, and conditions', start: 44, end: 51 },
  { id: 'phase-11', title: 'Claims and evidence', start: 52, end: 59 },
  { id: 'phase-12', title: 'Categories and distinctions', start: 60, end: 67 },
  { id: 'phase-13', title: 'A source has a later life', start: 68, end: 75 },
  { id: 'phase-14', title: 'Comparison without flattening', start: 76, end: 83 },
  { id: 'phase-15', title: 'Retrieve and transfer', start: 84, end: 91 },
  { id: 'phase-16', title: 'Independent source navigation', start: 92, end: 99 }
];

function phaseForIndex(index) { return phases.find((phase) => index >= phase.start && index <= phase.end); }
function checkpointStage(phase) { return `${phase.id}-checkpoint`; }

export async function journeyStatus(root, learner) {
  const journey = await canonJourney(root);
  const completeStages = new Set(learner.completedStages || []);
  let priorReady = true;
  const nodes = journey.sessions.map((session, index) => {
    const phase = phaseForIndex(index);
    const complete = completeStages.has(session.stageId);
    const phaseGate = phase.start === 0 || completeStages.has(checkpointStage(phases[phases.indexOf(phase) - 1]));
    const prerequisitesMet = phaseGate && (session.prerequisiteStages || []).every((stage) => completeStages.has(stage)) && skillsReady(learner, session.skillRequirements);
    const available = !complete && priorReady && prerequisitesMet;
    if (!complete) priorReady = false;
    return { ...session, index: index + 1, phase: `${['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI'][phases.indexOf(phase)]} · ${phase.title}`, complete, available, locked: !complete && !available };
  });
  const next = nodes.find((node) => node.available) || null;
  const phaseStatus = phases.map((phase) => {
    const phaseNodes = nodes.slice(phase.start, phase.end + 1);
    const complete = phaseNodes.every((node) => node.complete);
    const checkpointComplete = completeStages.has(checkpointStage(phase));
    return { ...phase, complete, checkpointStage: checkpointStage(phase), checkpointComplete, checkpointReady: complete && !checkpointComplete };
  });
  return { ...journey, completed: nodes.filter((node) => node.complete).length, total: nodes.length, nodes, phases: phaseStatus, next, nextCheckpoint: phaseStatus.find((phase) => phase.checkpointReady) || null };
}

export async function nextJourneyRecommendation(root, learner) {
  const status = await journeyStatus(root, learner);
  if (!status.next) return null;
  const next = status.next;
  return {
    kind: 'canon-session',
    title: next.title,
    reason: `${next.lens} is the next shared tool in your connected canon journey.`,
    url: `canon-session.html?id=${encodeURIComponent(next.id)}`,
    session: next
  };
}

// Client-side locks are useful guidance, but completion is checked here as well so
// a deep link cannot skip the source evidence and prerequisite canon moments.
export async function canMasterJourneyStage(root, learner, stageId) {
  const academyDay = /^academy-day-(\d{1,2})$/.exec(stageId || '');
  if (academyDay) {
    const day = Number(academyDay[1]);
    const correctContexts = new Set((learner.events || []).filter((event) => event.correct && (event.type === 'answer_submitted' || event.type === 'source_annotation') && event.sourceContext).map((event) => event.sourceContext));
    const checksComplete = [1, 2].every((check) => correctContexts.has(`academy day ${day} check ${check}`));
    const weeklyMapComplete = day % 7 !== 0 || (learner.events || []).some((event) => event.type === 'journey_artifact_saved' && event.artifactType === 'academy-source-maps' && event.artifactId === `academy-day-${day}` && String(event.note || '').trim().length >= 28);
    return day >= 1 && day <= 90 && checksComplete && weeklyMapComplete;
  }
  const journey = await canonJourney(root);
  const phase = phases.find((item) => checkpointStage(item) === stageId);
  if (phase) return journey.sessions.slice(phase.start, phase.end + 1).every((session) => (learner.completedStages || []).includes(session.stageId));
  const session = journey.sessions.find((item) => item.stageId === stageId);
  if (!session) return true;
  const completeStages = new Set(learner.completedStages || []);
  const prerequisitesMet = (session.prerequisiteStages || []).every((stage) => completeStages.has(stage));
  // A session is earned by current-session evidence, not merely by having answered
  // its screens. Every question context in this session must have a correct learner
  // event. This prevents a learner from clicking through all wrong answers after a
  // prior prerequisite skill was established.
  const requiredContexts = new Set((session.questions || []).map((question) => question.sourceContext).filter(Boolean));
  const correctContexts = new Set((learner.events || []).filter((event) => (event.type === 'answer_submitted' || event.type === 'source_annotation' || event.type === 'canon_lab') && event.correct && requiredContexts.has(event.sourceContext)).map((event) => event.sourceContext));
  const currentEvidenceMet = requiredContexts.size > 0 && [...requiredContexts].every((context) => correctContexts.has(context));
  return prerequisitesMet && skillsReady(learner, session.skillRequirements) && currentEvidenceMet;
}

export async function sourceReviewItems(root, skillIds = []) {
  const [journey, flagshipFile] = await Promise.all([
    canonJourney(root),
    fs.readFile(join(root, 'data', 'flagship-retrieval.json'), 'utf8')
  ]);
  const flagship = JSON.parse(flagshipFile).items || [];
  const flagshipSkillIds = new Set(flagship.map((item) => item.skillId));
  const wanted = new Set(skillIds);
  const mapped = journey.sessions.flatMap((session) => session.questions
    .filter((question) => wanted.has(question.skillId) && !flagshipSkillIds.has(question.skillId))
    .map((question, index) => ({
      trueSkillId: question.skillId,
      label: `${session.lens.toUpperCase()} RETRIEVAL`,
      hebrew: session.source.hebrew,
      translation: session.source.translation,
      prompt: question.prompt,
      answers: question.choices,
      correct: question.correct,
      feedback: question.explanation,
      sourceContext: question.sourceContext,
      variantId: `${session.id}-${index}`
    })));
  const flagshipMapped = flagship.filter((item) => wanted.has(item.skillId)).map((item) => ({ ...item, trueSkillId: item.skillId, variantId: `flagship-${item.skillId}` }));
  const covered = new Set([...mapped, ...flagshipMapped].map((item) => item.trueSkillId));
  const workbenchFallbacks = skillIds.filter((skillId) => !covered.has(skillId)).map((skillId) => subjectReviewItem(skillId) || ({
    trueSkillId: skillId, label: 'DAF RETRIEVAL', hebrew: 'מַה תַּפְקִיד הַשּׁוּרָה?', translation: 'What job does this line perform?',
    prompt: 'Before deciding whether a line is correct, what should you identify in a sugya?', answers: ['Its role: case, question, proof, objection, response, or distinction.', 'Only the longest word in the line.', 'The final ruling without reading the argument.'], correct: 0,
    feedback: 'Daf reading starts by naming the work a line does in the argument.', sourceContext: `retrieval for ${skillId}`, variantId: `fallback-${skillId}`
  }));
  return [...mapped, ...flagshipMapped, ...workbenchFallbacks];
}

export async function remediationFor(root, learner) {
  const struggleEntries = Object.entries(learner.struggles || {}).filter(([, count]) => count >= 2).sort((a, b) => b[1] - a[1]);
  if (!struggleEntries.length) return null;
  const [skillId, count] = struggleEntries[0];
  const router = JSON.parse(await fs.readFile(join(root, 'data', 'repair-router.json'), 'utf8'));
  const category = router.categories.find((item) => item.skills.includes(skillId));
  const directRepair = category && ['source-function', 'source-chain', 'conceptual-claim', 'historical-context'].includes(category.id);
  if (directRepair) return {
    skillId, count, title: category.title,
    reason: `${category.reason} You will rebuild it in a short contrast source, then test it again in an unfamiliar passage.`,
    url: `pilot-repair.html?skill=${encodeURIComponent(skillId)}`,
    repairMode: 'contrast-and-transfer'
  };
  const journey = await canonJourney(root);
  const session = journey.sessions.find((item) => item.questions.some((question) => question.skillId === skillId));
  if (session) return { skillId, count, title: `Strengthen ${session.lens}`, reason: `This source move has felt uncertain ${count} times. Revisit it in context before piling on new material.`, url: `canon-session.html?id=${encodeURIComponent(session.id)}`, repairMode: 'source-context' };
  if (!category) return null;
  return {
    skillId, count, title: category.title,
    reason: `${category.reason} You will rebuild it in a short contrast source, then test it again in an unfamiliar passage.`,
    url: category.url,
    repairMode: 'targeted-practice'
  };
}

// Select the most teachable next skill: prerequisites must be present, and the
// least-established eligible skill is preferred. This gives the app a graph-based
// practice choice alongside its narrative course sequence.
export async function nextGraphPractice(root, learner) {
  const graph = JSON.parse(await fs.readFile(join(root, 'data', 'skill-graph.json'), 'utf8'));
  const mastery = learner.mastery || {};
  const eligible = graph.skills.filter((skill) => (skill.prerequisites || []).every((id) => (mastery[id] || 0) >= .67));
  const candidate = eligible.filter((skill) => (mastery[skill.id] || 0) < .85).sort((a, b) => (mastery[a.id] || 0) - (mastery[b.id] || 0))[0];
  if (!candidate) return null;
  const workbenchByContext = {
    'Berakhot 2a': 'daf-workbench.html?tractate=berakhot',
    'Shabbat 2a': 'flagship-daf-workbench.html?tractate=shabbat',
    'Eruvin 2a': 'flagship-daf-workbench.html?tractate=eruvin',
    'Pesachim 2a': 'flagship-daf-workbench.html?tractate=pesachim',
    'Sukkah 2a': 'flagship-daf-workbench.html?tractate=sukkah',
    'Yoma 2a': 'yoma-daf-workbench.html',
    'Bava Metzia 2a': 'flagship-daf-workbench.html?tractate=bava-metzia'
  };
  const context = candidate.reviewContexts?.find((item) => workbenchByContext[item]) || candidate.reviewContexts?.[0];
  const url = candidate.track === 'language'
    ? 'language.html'
    : workbenchByContext[context] || (candidate.track === 'thought' ? 'source-reader.html?collection=freedom' : 'cross-tractate.html');
  return { skill: candidate, context, url, reason: `Build ${candidate.title.toLowerCase()} before moving to the next dependent source skill.`, mastery: mastery[candidate.id] || 0 };
}
