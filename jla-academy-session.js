function shuffled(items, random = Math.random) {
  const result = items.map((item) => ({ ...item }));
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

function findSession(skillId, sessions) {
  const session = sessions.find((item) => item.skillId === skillId);
  if (!session) throw new Error(`No Academy session is available for skill: ${skillId}`);
  return session;
}

export function loadJlaAcademySession({ skillId, sessions = [], random = Math.random } = {}) {
  const session = findSession(skillId, sessions);
  const {
    correctChoiceId: _correctChoiceId,
    feedback: _feedback,
    choices,
    ...learnerSession
  } = session;

  return {
    ...learnerSession,
    choices: shuffled(choices, random)
  };
}

export function checkJlaAcademyChoice({ skillId, choiceId, sessions = [] } = {}) {
  const session = findSession(skillId, sessions);
  const choiceExists = session.choices.some((choice) => choice.id === choiceId);
  if (!choiceExists) throw new Error(`Unknown choice for ${skillId}: ${choiceId}`);

  const correct = choiceId === session.correctChoiceId;
  return {
    correct,
    feedback: correct ? session.feedback.correct : session.feedback.incorrect,
    evidencePreview: session.evidencePreview
  };
}
