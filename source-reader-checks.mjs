const MOVE_TEMPLATES = [
  'Treat the line as a final legal ruling before naming its speaker or claim.',
  'Skip this source and start from a later commentary.',
  'Read the line as only a feeling, not a claim in a source.'
];

export { MOVE_TEMPLATES };

export function shuffleChoices(answers) {
  return answers.map((text, index) => ({ text, index })).sort(() => Math.random() - 0.5);
}

function uniqueTexts(values, skip) {
  const seen = new Set(skip ? [skip] : []);
  const result = [];
  for (const value of values) {
    if (!value || seen.has(value)) continue;
    seen.add(value);
    result.push(value);
  }
  return result;
}

function fromAuthored(line) {
  const answers = line.answers.filter((text) => typeof text === 'string' && text.trim());
  if (answers.length < 2 || answers.length > 3) return null;
  if (!Number.isInteger(line.correct) || !answers[line.correct]) return null;
  return {
    ask: line.ask || line.note,
    answers,
    correct: line.correct,
    feedback: line.feedback || 'Right. Stay with this line’s claim before you continue.'
  };
}

export function buildLineCheck(line, collection) {
  const authored = Array.isArray(line.answers) ? fromAuthored(line) : null;
  if (authored) return authored;

  const correct = line.translation || line.note;
  const siblings = (collection.lines || []).filter((other) => other !== line);
  const distractors = uniqueTexts([
    ...siblings.map((other) => other.translation || other.note),
    ...MOVE_TEMPLATES
  ], correct).slice(0, 2);

  return {
    ask: line.note || 'Which reading names this line’s claim?',
    answers: [correct, ...distractors],
    correct: 0,
    feedback: 'Right. Name this line’s claim before you continue.'
  };
}
