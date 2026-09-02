// Phase-4: serve arc lesson data with the answer key stripped, and score server-side.
// Mirrors jla-academy-session.js. Interactive arc sessions carry `answers` (text array) +
// `correct` (index into answers) + `feedback` (string). We never ship correct/feedback to the
// browser: loadArc converts answers→id'd, shuffled `choices` and drops the key; checkArcAnswer
// re-reads the authored data server-side and scores by the stable choice id. Index arcs (berakhot)
// are link-outs with no key, returned unchanged.

function shuffled(items, random = Math.random) {
  const result = items.map((item) => ({ ...item }));
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function getArc(tractate, arcs) {
  const arc = arcs && arcs[tractate];
  if (!arc) throw new Error(`No arc for tractate: ${tractate}`);
  return arc;
}

// Client-safe arc: interactive sessions get shuffled, id'd choices with correct/feedback removed.
export function loadArc({ tractate, arcs = {}, random = Math.random } = {}) {
  const arc = getArc(tractate, arcs);
  if (arc.shape !== 'interactive') return arc; // index arcs link out; nothing to strip
  const sessions = arc.sessions.map((s) => {
    const { correct: _correct, feedback: _feedback, answers = [], ...rest } = s;
    const choices = shuffled(answers.map((text, index) => ({ id: `a${index}`, text })), random);
    return { ...rest, choices };
  });
  return { ...arc, sessions };
}

// Authoritative scoring — reads the authored `correct` index the browser never received.
export function checkArcAnswer({ tractate, sessionIndex, choiceId, arcs = {} } = {}) {
  const arc = getArc(tractate, arcs);
  if (arc.shape !== 'interactive') throw new Error(`Arc ${tractate} has no scored sessions`);
  const session = arc.sessions[Number(sessionIndex)];
  if (!session) throw new Error(`No session ${sessionIndex} in ${tractate}`);
  const chosen = Number(String(choiceId).replace(/^a/, ''));
  if (!Number.isInteger(chosen) || chosen < 0 || chosen >= (session.answers || []).length) {
    throw new Error(`Unknown choice for ${tractate}[${sessionIndex}]: ${choiceId}`);
  }
  const correct = chosen === session.correct;
  return { correct, feedback: session.feedback || '', skill: session.skill || null };
}
