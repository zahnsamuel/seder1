const learnerId = Seder.currentLearnerId();
const $ = (selector) => document.querySelector(selector);
const steps = [
  { title: '1 · Enter the claims-and-evidence Mishnah', stage: 'bava-metzia-tractate-arc', url: 'bava-metzia-arc.html', copy: 'Map the object, each claimant, each claim, and the Mishnah’s response before asking why.' },
  { title: '2 · Map the visible Daf', event: (event) => event.correct && event.sourceContext?.includes('bava-metzia flagship workbench line'), url: 'flagship-daf-workbench.html?tractate=bava-metzia', copy: 'Classify the shared object, competing claims, and response so no part of the case becomes background.' },
  { title: '3 · Retrieve a Bava Metzia move', event: (event) => event.correct && String(event.skillId || '').startsWith('lab-bava-metzia-'), url: 'lab.html?tractate=bava-metzia', copy: 'Return to a source line and distinguish claim from proof, procedure, and response.' },
  { title: '4 · Test transfer in a new sugya', event: (event) => event.correct && event.skillId === 'bava-metzia-unseen-transfer', url: 'gemara-unseen-check.html?block=bava-metzia', copy: 'Carry the dispute map into an unfamiliar case without importing a conclusion from the earlier source.' },
  { title: '5 · Earn the Canon Connection', artifact: 'canon_connection', artifactId: 'bava-metzia', url: 'canon-connection.html?tractate=bava-metzia', copy: 'Connect careful reading of another person’s claim to ethical responsibility without treating either source as personal advice.' },
  { title: '6 · Begin Consolidation I', ready: (learner) => (learner.artifacts?.canon_connection || []).includes('bava-metzia'), url: 'foundation-consolidation.html', copy: 'Retrieve the first five Gemara habits alongside Mussar, Tefillah, Chumash, and Jewish Thought.' }
];
const complete = (learner, step) => {
  if (step.stage) return (learner.completedStages || []).includes(step.stage);
  if (step.artifact) return (learner.artifacts?.[step.artifact] || []).includes(step.artifactId);
  if (step.event) return (learner.events || []).some(step.event);
  return step.ready ? step.ready(learner) : false;
};
Seder.api(`/api/learners/${learnerId}`).then((response) => response.ok ? response.json() : null).then((learner) => {
  const state = learner || {}, first = steps.findIndex((step) => !complete(state, step)), earned = first < 0 ? steps.length : first;
  $('#summary').innerHTML = `<article><small>BLOCK 5 · BAVA METZIA</small><strong>${earned} / ${steps.length}</strong></article><article><small>CURRENT AIM</small><strong>${earned === steps.length ? 'Ready to consolidate' : 'Keep every claim visible'}</strong></article>`;
  $('#steps').innerHTML = steps.map((step, index) => {
    const established = complete(state, step), current = index === first, locked = !established && !current;
    const action = locked ? '<span class="next disabled">Earn the earlier move first →</span>' : `<a href="${step.url}">${established ? 'Review this move →' : 'Continue this move →'}</a>`;
    return `<article class="course-card ${locked ? 'locked' : ''}"><small>${established ? 'REVIEWABLE' : current ? 'YOUR NEXT MOVE' : 'UPCOMING'}</small><h2>${step.title}</h2><p>${step.copy}</p>${action}</article>`;
  }).join('');
}).catch(() => { $('#steps').innerHTML = '<p>Open the Bava Metzia source trail to begin.</p>'; });
