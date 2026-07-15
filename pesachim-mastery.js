const learnerId = Seder.currentLearnerId();
const $ = (selector) => document.querySelector(selector);
const steps = [
  { title: '1 · Enter the time-and-action Mishnah', stage: 'pesachim-tractate-arc', url: 'pesachim-arc.html', copy: 'Separate the required action, its time, and its instrument before resolving an ambiguous word.' },
  { title: '2 · Map the visible Daf', event: (event) => event.correct && event.sourceContext?.includes('pesachim flagship workbench line'), url: 'flagship-daf-workbench.html?tractate=pesachim', copy: 'Classify the case, word-question, and proposed response on the page before drawing a conclusion.' },
  { title: '3 · Retrieve a Pesachim move', event: (event) => event.correct && String(event.skillId || '').startsWith('lab-pesachim-'), url: 'lab.html?tractate=pesachim', copy: 'Return to a source line and name the reading move without depending on the earlier trail.' },
  { title: '4 · Test transfer in a new sugya', event: (event) => event.correct && event.skillId === 'pesachim-unseen-transfer', url: 'gemara-unseen-check.html?block=pesachim', copy: 'Carry the action-time-tool map into an unfamiliar source where one detail changes the case.' },
  { title: '5 · Earn the Canon Connection', artifact: 'canon_connection', artifactId: 'pesachim', url: 'canon-connection.html?tractate=pesachim', copy: 'Connect careful reading of ritual time to a Torah source about memory without flattening either text.' },
  { title: '6 · Enter Bava Metzia', ready: (learner) => (learner.artifacts?.canon_connection || []).includes('pesachim'), url: 'bava-metzia-arc.html', copy: 'Bring close case-mapping into competing claims, procedure, and fairness.' }
];
const complete = (learner, step) => {
  if (step.stage) return (learner.completedStages || []).includes(step.stage);
  if (step.artifact) return (learner.artifacts?.[step.artifact] || []).includes(step.artifactId);
  if (step.event) return (learner.events || []).some(step.event);
  return step.ready ? step.ready(learner) : false;
};
Seder.api(`/api/learners/${learnerId}`).then((response) => response.ok ? response.json() : null).then((learner) => {
  const state = learner || {}, first = steps.findIndex((step) => !complete(state, step)), earned = first < 0 ? steps.length : first;
  $('#summary').innerHTML = `<article><small>BLOCK 4 · PESACHIM</small><strong>${earned} / ${steps.length}</strong></article><article><small>CURRENT AIM</small><strong>${earned === steps.length ? 'Ready for Bava Metzia' : 'Keep the case visible'}</strong></article>`;
  $('#steps').innerHTML = steps.map((step, index) => {
    const established = complete(state, step), current = index === first, locked = !established && !current;
    const action = locked ? '<span class="next disabled">Earn the earlier move first →</span>' : `<a href="${step.url}">${established ? 'Review this move →' : 'Continue this move →'}</a>`;
    return `<article class="course-card ${locked ? 'locked' : ''}"><small>${established ? 'REVIEWABLE' : current ? 'YOUR NEXT MOVE' : 'UPCOMING'}</small><h2>${step.title}</h2><p>${step.copy}</p>${action}</article>`;
  }).join('');
}).catch(() => { $('#steps').innerHTML = '<p>Open the Pesachim source trail to begin.</p>'; });
