const learnerId = Seder.currentLearnerId();

const phaseGuides = {
  'phase-1': 'Build the first habits for meeting Hebrew and Rabbinic sources.',
  'phase-2': 'Follow one source across Torah, prayer, history, and later reception.',
  'phase-3': 'Read a sugya as a sequence of case, question, evidence, and response.',
  'phase-4': 'Connect distinct source forms without flattening their differences.',
  'phase-5': 'Return to foundations with more precision about language and context.',
  'phase-6': 'Carry Gemara reading habits across several tractates of Shas.',
  'phase-7': 'Compare claims, institutions, and intellectual traditions responsibly.',
  'phase-8': 'Meet unfamiliar material with a map, honest uncertainty, and a next move.',
  'phase-9': 'Use small signals to form a first accountable question in eight source settings.',
  'phase-10': 'Map cases, people, objects, and conditions before deciding what follows.',
  'phase-11': 'Separate a claim from the evidence and reason offered for it.',
  'phase-12': 'Find the relevant distinction when similar sources or cases diverge.',
  'phase-13': 'Trace how Torah, prayer, practice, and interpretation receive earlier sources.',
  'phase-14': 'Compare sources without losing their distinct genres, settings, or claims.',
  'phase-15': 'Retrieve familiar reading moves and carry them into a fresh context.',
  'phase-16': 'Navigate unfamiliar material with evidence, uncertainty, and a deliberate next step.'
};

const levels = [
  { title: 'Foundations', phases: ['phase-1', 'phase-2'], promise: 'Open Hebrew sources, follow their first questions, and see the canon begin to connect.' },
  { title: 'Gemara reader', phases: ['phase-3', 'phase-4'], promise: 'Map a sugya and connect its argument to other Jewish source forms.' },
  { title: 'Return with precision', phases: ['phase-5', 'phase-6'], promise: 'Revisit foundations with sharper language, context, and cross-tractate reading.' },
  { title: 'Independent orientation', phases: ['phase-7', 'phase-8'], promise: 'Compare responsibly and enter unfamiliar sources with an honest map.' },
  { title: 'Question and case', phases: ['phase-9', 'phase-10'], promise: 'Turn small signals into accountable questions and precise case maps.' },
  { title: 'Evidence and distinction', phases: ['phase-11', 'phase-12'], promise: 'Read arguments for their proof and find the distinction that matters.' },
  { title: 'Reception and comparison', phases: ['phase-13', 'phase-14'], promise: 'Trace a source across later Jewish life and compare without flattening.' },
  { title: 'Transfer and independence', phases: ['phase-15', 'phase-16'], promise: 'Carry your reading habits into fresh sources and choose the next move yourself.' }
];

function renderNode(node) {
  return `<article class="step ${node.complete ? 'done' : ''} ${node.available ? 'current' : ''} ${node.locked ? 'locked' : ''}"><b>${node.complete ? '✓' : node.index}</b><div><small>${node.lens.toUpperCase()}</small><h2>${node.title}</h2><p>${node.summary}</p><em>${node.complete ? 'Mastery evidence recorded.' : node.available ? 'Your next connected source session.' : 'This opens when the prior source move is secure.'}</em></div>${node.complete || node.available ? `<a href="canon-session.html?id=${encodeURIComponent(node.id)}">${node.complete ? 'Revisit →' : 'Continue →'}</a>` : '<span class="later">Later</span>'}</article>`;
}

function renderPhase(phase, nodes) {
  const phaseNodes = nodes.slice(phase.start, phase.end + 1);
  const checkpoint = phase.checkpointReady ? `<a class="phase-checkpoint" href="phase-checkpoint.html?phase=${phase.id}">Phase checkpoint: open ${phase.title} →</a>` : '';
  return `<section class="phase"><h3>${phase.title}</h3><p>${phaseGuides[phase.id] || 'A new set of source-reading moves.'}</p><small>${phaseNodes.length} source encounters · checkpoint required</small></section>${phaseNodes.map(renderNode).join('')}${checkpoint}`;
}

Seder.api(`/api/learners/${learnerId}/journey`).then((response) => response.ok ? response.json() : Promise.reject()).then((journey) => {
  document.querySelector('#progress').textContent = `${journey.completed} OF ${journey.total} CANON MOMENTS`;
  const byId = Object.fromEntries(journey.phases.map((phase) => [phase.id, phase]));
  const activeLevel = levels.findIndex((level) => !level.phases.every((id) => byId[id]?.checkpointComplete));
  const active = activeLevel === -1 ? levels.length - 1 : activeLevel;
  document.querySelector('#steps').innerHTML = levels.map((level, index) => {
    const phases = level.phases.map((id) => byId[id]).filter(Boolean);
    const complete = phases.every((phase) => phase.checkpointComplete);
    const encounters = phases.reduce((total, phase) => total + phase.end - phase.start + 1, 0);
    const title = `LEVEL ${index + 1} · ${level.title}`;
    if (index < active || complete) return `<details class="level complete"><summary><span>✓ LEVEL ${index + 1}</span><strong>${level.title}</strong><small>${encounters} encounters mastered · Review</small></summary><p>${level.promise}</p><div class="level-content">${phases.map((phase) => renderPhase(phase, journey.nodes)).join('')}</div></details>`;
    if (index === active) return `<section class="level active"><div class="level-heading"><span>YOUR CURRENT LEVEL · ${index + 1} OF ${levels.length}</span><h2>${title}</h2><p>${level.promise}</p><small>${encounters} source encounters · complete both phase checkpoints to level up</small></div><div class="level-content">${phases.map((phase) => renderPhase(phase, journey.nodes)).join('')}</div></section>`;
    return `<article class="level locked"><span>LEVEL ${index + 1}</span><h2>${level.title}</h2><p>${level.promise}</p><small>${encounters} encounters · unlock by earning the level before it</small></article>`;
  }).join('');
  return Seder.api(`/api/learners/${learnerId}`).then((response) => response.ok ? response.json() : null);
}).then((learner) => { if (learner) document.querySelector('#xp').textContent = `${learner.xp || 0} XP`; }).catch(() => {});
