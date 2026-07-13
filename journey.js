const learnerId = Seder.currentLearnerId();
const phaseGuides = {
  'phase-1': 'Build the first habits for meeting Hebrew and Rabbinic sources.',
  'phase-2': 'Follow one source across Torah, prayer, history, and later reception.',
  'phase-3': 'Read a sugya as a sequence of case, question, evidence, and response.',
  'phase-4': 'Connect distinct source forms without flattening their differences.',
  'phase-5': 'Return to the foundations with more precision about language and context.',
  'phase-6': 'Carry the same Gemara reading habits across several tractates of Shas.',
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

Seder.api(`/api/learners/${learnerId}/journey`).then((response) => response.ok ? response.json() : Promise.reject()).then((journey) => {
  document.querySelector('#progress').textContent = `${journey.completed} OF ${journey.total} CANON MOMENTS`;
  let lastPhase = '';
  document.querySelector('#steps').innerHTML = journey.nodes.map((node, position) => {
    const phaseMeta = journey.phases.find((item) => item.start === position);
    const heading = node.phase !== lastPhase ? `<section class="phase"><h3>${node.phase}</h3><p>${phaseGuides[phaseMeta?.id] || 'A new set of source-reading moves.'}</p><small>${phaseMeta.end - phaseMeta.start + 1} source encounters · checkpoint required</small></section>` : '';
    lastPhase = node.phase;
    const checkpoint = journey.phases.find((item) => item.end === position && item.checkpointReady);
    const checkpointCard = checkpoint ? `<a class="phase-checkpoint" href="phase-checkpoint.html?phase=${checkpoint.id}">Phase checkpoint: open ${checkpoint.title} →</a>` : '';
    return `${heading}<article class="step ${node.complete ? 'done' : ''} ${node.available ? 'current' : ''} ${node.locked ? 'locked' : ''}"><b>${node.complete ? '✓' : node.index}</b><div><small>${node.lens.toUpperCase()}</small><h2>${node.title}</h2><p>${node.summary}</p><em>${node.complete ? 'Mastery evidence recorded.' : node.available ? 'Your next connected source session.' : 'This opens when the prior source move is secure.'}</em></div>${node.complete || node.available ? `<a href="canon-session.html?id=${encodeURIComponent(node.id)}">${node.complete ? 'Revisit →' : 'Continue →'}</a>` : '<span class="later">Later</span>'}</article>${checkpointCard}`;
  }).join('');
  return Seder.api(`/api/learners/${learnerId}`).then((response) => response.ok ? response.json() : null);
}).then((learner) => { if (learner) document.querySelector('#xp').textContent = `${learner.xp || 0} XP`; }).catch(() => {});
