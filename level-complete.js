const learnerId = Seder.currentLearnerId();
const requestedLevel = Number(new URLSearchParams(location.search).get('level'));

const levels = [
  { title: 'Foundations', phases: ['phase-1', 'phase-2'], range: [0, 9], outcomes: ['Meet a Hebrew or rabbinic source before rushing to a conclusion.', 'Name a Mishnah’s case and the question the Gemara is asking.', 'Preserve a source’s original setting while tracing its later reception.'], next: 'Gemara reader', description: 'Now enter a sugya as a sequence of case, question, evidence, objection, and response.' },
  { title: 'Gemara reader', phases: ['phase-3', 'phase-4'], range: [10, 17], outcomes: ['Locate the claim or case an objection pressures.', 'Read a distinction as a reasoned response, not a change of subject.', 'Connect a Gemara argument to another source form without flattening either one.'], next: 'Return with precision', description: 'Revisit language, context, and cross-tractate structures with sharper tools.' },
  { title: 'Return with precision', phases: ['phase-5', 'phase-6'], range: [18, 26], outcomes: ['Identify what an introduced source is doing in an argument.', 'Return to an earlier text without losing its original voice.', 'Map a compact Gemara case before choosing a conclusion.'], next: 'Independent orientation', description: 'Use comparison and source maps to enter unfamiliar material honestly.' },
  { title: 'Independent orientation', phases: ['phase-7', 'phase-8'], range: [27, 35], outcomes: ['State shared questions and differences before judging sources.', 'Compare traditions without stereotypes or false equivalence.', 'Name uncertainty and choose a responsible next step in a new sugya.'], next: 'Question and case', description: 'Turn small textual signals into accountable questions and precise case maps.' },
  { title: 'Question and case', phases: ['phase-9', 'phase-10'], range: [36, 51], outcomes: ['Notice the signal that makes a source worth investigating.', 'Frame a question that the source can actually answer.', 'Map people, objects, conditions, and stakes before deciding what follows.'], next: 'Evidence and distinction', description: 'Learn to separate what a source claims from the evidence and distinction that supports it.' },
  { title: 'Evidence and distinction', phases: ['phase-11', 'phase-12'], range: [52, 67], outcomes: ['Distinguish a claim from the proof or reason offered for it.', 'Test whether evidence really addresses the question at hand.', 'Find the category or condition that makes similar cases diverge.'], next: 'Reception and comparison', description: 'Trace sources through later Jewish life while preserving their distinct voices.' },
  { title: 'Reception and comparison', phases: ['phase-13', 'phase-14'], range: [68, 83], outcomes: ['Follow an earlier source into prayer, practice, and interpretation.', 'Name what changes and what remains when a source is received later.', 'Compare texts through a shared question while preserving real difference.'], next: 'Transfer and independence', description: 'Carry your source-reading habits into fresh material and make your own next move.' },
  { title: 'Transfer and independence', phases: ['phase-15', 'phase-16'], range: [84, 99], outcomes: ['Retrieve a reading move when a new source calls for it.', 'Use evidence, uncertainty, and context to navigate unfamiliar material.', 'Choose the next question, source, or conversation that deepens your learning.'], next: null, description: 'You have built a durable practice of independent canon learning. Keep returning, testing, and deepening it.' }
];

const level = levels[requestedLevel - 1];
if (!level) location.href = 'journey.html';

function skillsForLevel(journey) {
  const nodes = journey.nodes.slice(level.range[0], level.range[1] + 1);
  return [...new Set(nodes.flatMap((node) => (node.skillRequirements || []).map((item) => item.skillId)))];
}

Promise.all([
  Seder.api(`/api/learners/${learnerId}/journey`).then((response) => response.ok ? response.json() : null),
  Seder.api(`/api/learners/${learnerId}`).then((response) => response.ok ? response.json() : null)
]).then(([journey, learner]) => {
  if (!journey || !learner) return;
  const allComplete = level.phases.every((id) => journey.phases.find((phase) => phase.id === id)?.checkpointComplete);
  if (!allComplete) { location.href = 'journey.html'; return; }
  const encounterCount = level.phases.reduce((count, id) => {
    const phase = journey.phases.find((item) => item.id === id);
    return count + (phase ? phase.end - phase.start + 1 : 0);
  }, 0);
  const established = skillsForLevel(journey).filter((skillId) => (learner.mastery?.[skillId] || 0) >= 0.34).length;
  document.querySelector('#xp').textContent = `${learner.xp || 0} XP`;
  document.querySelector('#title').textContent = `${level.title} complete.`;
  document.querySelector('#summary').textContent = `You completed ${encounterCount} connected source encounters and both level checkpoints. This is evidence of a reading practice, not just a finished list.`;
  document.querySelector('#outcomes').innerHTML = level.outcomes.map((outcome) => `<li>${outcome}</li>`).join('');
  document.querySelector('#record').textContent = `${established} level skill${established === 1 ? '' : 's'} now have recorded mastery evidence. Return to them when review is due.`;
  const nextTitle = document.querySelector('#next-title');
  const begin = document.querySelector('#begin');
  if (level.next) {
    nextTitle.textContent = `Level ${requestedLevel + 1} · ${level.next}`;
    document.querySelector('#next-description').textContent = level.description;
    begin.textContent = `Begin Level ${requestedLevel + 1} →`;
  } else {
    nextTitle.textContent = 'Keep the practice alive';
    document.querySelector('#next-description').textContent = level.description;
    begin.textContent = 'Return to the journey →';
  }
}).catch(() => { location.href = 'journey.html'; });
