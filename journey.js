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
  { title: 'Gemara reader', phases: ['phase-3', 'phase-4', 'phase-5'], promise: 'Map a sugya, connect its argument to other Jewish source forms, and return to foundations with precision.' },
  { title: 'Canon navigator', phases: ['phase-6', 'phase-7', 'phase-8'], promise: 'Carry Gemara habits across Shas, compare responsibly, and enter unfamiliar sources with an honest map.' },
  { title: 'Question, case, and evidence', phases: ['phase-9', 'phase-10', 'phase-11'], promise: 'Turn small signals into accountable questions, precise case maps, and evidence-led claims.' },
  { title: 'Distinction and reception', phases: ['phase-12', 'phase-13', 'phase-14'], promise: 'Find the distinction that matters, trace a source through later life, and compare without flattening.' },
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

function renderFocus(journey, learner) {
  const next = journey.nodes.find((node) => node.available && !node.complete);
  const due = (learner?.reviewQueue || []).filter((item) => new Date(item.dueAt || 0).getTime() <= Date.now()).length;
  if (!next) {
    document.querySelector('#focus').innerHTML = `<span>YOUR CURRENT FOCUS</span><h2>The full journey is earned.</h2><p>Keep the repertoire durable by retrieving what fades, then choose a new source question from your record.</p><div><a class="focus-primary" href="weekly-review.html">Open retrieval →</a><a href="study-record.html">Open study record →</a></div>`;
    return;
  }
  const nodeIndex = journey.nodes.indexOf(next);
  const phase = journey.phases.find((item) => nodeIndex >= item.start && nodeIndex <= item.end);
  const reviewCopy = due ? `${due} timely retrieval ${due === 1 ? 'is' : 'are'} due; take it after this source move.` : 'No retrieval is due first; this is the right new move.';
  document.querySelector('#focus').innerHTML = `<span>YOUR CURRENT FOCUS</span><h2>${next.title}</h2><p>${next.summary}</p><small>${phase?.title || 'Canon journey'} · ${journey.completed} of ${journey.total} encounters earned · ${reviewCopy}</small><div><a class="focus-primary" href="canon-session.html?id=${encodeURIComponent(next.id)}">Continue this source →</a><a href="${due ? 'review.html' : 'weekly-review.html'}">${due ? 'Retrieve what is due →' : 'See retrieval rhythm →'}</a></div>`;
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
    if (index === active) return `<section class="level active"><div class="level-heading"><span>YOUR CURRENT LEVEL · ${index + 1} OF ${levels.length}</span><h2>${title}</h2><p>${level.promise}</p><small>${encounters} source encounters · complete all ${phases.length} phase checkpoints to level up</small></div><div class="level-content">${phases.map((phase) => renderPhase(phase, journey.nodes)).join('')}</div></section>`;
    return `<article class="level locked"><span>LEVEL ${index + 1}</span><h2>${level.title}</h2><p>${level.promise}</p><small>${encounters} encounters · unlock by earning the level before it</small></article>`;
  }).join('');
  return Seder.api(`/api/learners/${learnerId}`).then((response) => response.ok ? response.json() : null).then((learner) => ({ journey, learner }));
}).then(({ journey, learner }) => { renderFocus(journey, learner); if (learner) document.querySelector('#xp').textContent = `${learner.xp || 0} XP`; }).catch(() => {});

const termTwoLink=document.createElement('a');termTwoLink.href='term-two-journey.html';termTwoLink.className='journey-term-two-link';termTwoLink.textContent='Continue into Second Foundation Term →';document.querySelector('main')?.appendChild(termTwoLink);
