import { promises as fs } from 'node:fs';
import { join } from 'node:path';

let cachedJourney;

export async function canonJourney(root) {
  if (!cachedJourney) cachedJourney = JSON.parse(await fs.readFile(join(root, 'curriculum', 'canon-journey.json'), 'utf8'));
  return cachedJourney;
}

function skillsReady(learner, requirements = []) {
  return requirements.every((requirement) => (learner.mastery?.[requirement.skillId] || 0) >= (requirement.minimum || .67));
}

export async function journeyStatus(root, learner) {
  const journey = await canonJourney(root);
  const completeStages = new Set(learner.completedStages || []);
  let priorReady = true;
  const phaseFor = (index) => index < 4 ? 'I · Reading foundations' : index < 10 ? 'II · Canon connections' : index < 14 ? 'III · Gemara fluency' : 'IV · Integrated reading';
  const nodes = journey.sessions.map((session, index) => {
    const complete = completeStages.has(session.stageId);
    const prerequisitesMet = (session.prerequisiteStages || []).every((stage) => completeStages.has(stage)) && skillsReady(learner, session.skillRequirements);
    const available = !complete && priorReady && prerequisitesMet;
    if (!complete) priorReady = false;
    return { ...session, index: index + 1, phase: phaseFor(index), complete, available, locked: !complete && !available };
  });
  const next = nodes.find((node) => node.available) || null;
  return { ...journey, completed: nodes.filter((node) => node.complete).length, total: nodes.length, nodes, next };
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
  const session = journey.sessions.find((item) => item.stageId === stageId);
  if (!session) return true;
  const completeStages = new Set(learner.completedStages || []);
  const prerequisitesMet = (session.prerequisiteStages || []).every((stage) => completeStages.has(stage));
  return prerequisitesMet && skillsReady(learner, session.skillRequirements);
}

export async function sourceReviewItems(root, skillIds = []) {
  const journey = await canonJourney(root);
  const wanted = new Set(skillIds);
  return journey.sessions.flatMap((session) => session.questions
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
