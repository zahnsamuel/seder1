import { promises as fs } from 'node:fs';
import { join } from 'node:path';

let cachedJourney;
let cachedGemaraSequence;

export async function canonJourney(root) {
  if (!cachedJourney) cachedJourney = JSON.parse(await fs.readFile(join(root, 'curriculum', 'canon-journey.json'), 'utf8'));
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
  { id: 'phase-4', title: 'Integrated reading', start: 14, end: 17 }
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
    return { ...session, index: index + 1, phase: `${['I', 'II', 'III', 'IV'][phases.indexOf(phase)]} · ${phase.title}`, complete, available, locked: !complete && !available };
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
  const journey = await canonJourney(root);
  const wanted = new Set(skillIds);
  const mapped = journey.sessions.flatMap((session) => session.questions
    .filter((question) => wanted.has(question.skillId))
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
  const covered = new Set(mapped.map((item) => item.trueSkillId));
  const workbenchFallbacks = skillIds.filter((skillId) => !covered.has(skillId)).map((skillId) => ({
    trueSkillId: skillId, label: 'DAF RETRIEVAL', hebrew: 'מַה תַּפְקִיד הַשּׁוּרָה?', translation: 'What job does this line perform?',
    prompt: 'Before deciding whether a line is correct, what should you identify in a sugya?', answers: ['Its role: case, question, proof, objection, response, or distinction.', 'Only the longest word in the line.', 'The final ruling without reading the argument.'], correct: 0,
    feedback: 'Daf reading starts by naming the work a line does in the argument.', sourceContext: `retrieval for ${skillId}`, variantId: `fallback-${skillId}`
  }));
  return [...mapped, ...workbenchFallbacks];
}

export async function remediationFor(root, learner) {
  const struggleEntries = Object.entries(learner.struggles || {}).filter(([, count]) => count >= 2).sort((a, b) => b[1] - a[1]);
  if (!struggleEntries.length) return null;
  const [skillId, count] = struggleEntries[0];
  const journey = await canonJourney(root);
  const session = journey.sessions.find((item) => item.questions.some((question) => question.skillId === skillId));
  if (!session) return null;
  return { skillId, count, title: `Strengthen ${session.lens}`, reason: `This source move has felt uncertain ${count} times. Revisit it in context before piling on new material.`, url: `canon-session.html?id=${encodeURIComponent(session.id)}` };
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
  const workbenchByContext = { 'Berakhot 2a': 'berakhot', 'Shabbat 2a': 'shabbat', 'Eruvin 2a': 'eruvin', 'Pesachim 2a': 'pesachim', 'Sukkah 2a': 'sukkah', 'Bava Metzia 2a': 'bava' };
  const context = candidate.reviewContexts?.find((item) => workbenchByContext[item]) || candidate.reviewContexts?.[0];
  return { skill: candidate, context, url: workbenchByContext[context] ? `daf-workbench.html?tractate=${workbenchByContext[context]}` : 'cross-tractate.html' };
}
