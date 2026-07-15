const learnerId = Seder.currentLearnerId();
const $ = (selector) => document.querySelector(selector);
const steps = [
  { title: '1 · Hear the question signal', skills: ['hebrew-question-words'], url: 'language.html', copy: 'Use a question word to predict what kind of answer the page will seek.' },
  { title: '2 · Enter the opening Mishnah', stage: 'berakhot-2a-depth', url: 'berakhot-deep.html', copy: 'Map the practice, question, and source-grounded answer before settling anything.' },
  { title: '3 · Follow proof and word-question', stage: 'berakhot-2b-proof', url: 'berakhot-unit-2.html', copy: 'Ask what a cited verse or compact word contributes to the argument.' },
  { title: '4 · Read unfamiliar signals', stage: 'berakhot-independent-transfer', url: 'berakhot-unit-3.html', copy: 'Make a first source map before relying on English support.' },
  { title: '5 · Separate Mishnah grammar', stage: 'berakhot-mishnah-grammar', url: 'berakhot-unit-4.html', copy: 'Keep case, condition, and ruling distinct.' },
  { title: '6 · Track baraita and objection', stage: 'berakhot-baraita-disagreement', url: 'berakhot-unit-5.html', copy: 'Name teaching, pressure, and response without losing the thread.' },
  { title: '7 · Work on the Daf', skills: ['daf-orientation'], url: 'daf-workbench.html?tractate=berakhot', copy: 'Classify visible lines and trace one transition.' },
  { title: '8 · Retrieve a fragile move', skills: ['berakhot-independent-source'], url: 'berakhot-lab.html', copy: 'Rebuild a source move without being shown the answer first.' },
  { title: '9 · Transfer to a new sugya', skills: ['unseen-sugya-reading'], url: 'gemara-unseen-check.html', copy: 'Carry the reading habit to an unfamiliar source.', optionalUrl: 'cross-tractate.html' },
  { title: '10 · Earn the Canon Connection', skills: ['canon-connection-berakhot'], url: 'canon-connection.html?tractate=berakhot', copy: 'Show how this Gemara habit illuminates a connected Torah source.' }
];
const isMastered = (mastery, skill) => (mastery[skill] || 0) >= 0.34;
const isComplete = (learner, step) => {
  if (step.stage) return (learner.completedStages || []).includes(step.stage);
  return step.skills.every((skill) => isMastered(learner.mastery || {}, skill));
};

Seder.api(`/api/learners/${learnerId}`).then((response) => response.ok ? response.json() : null).then((learner) => {
  const state = learner || { mastery: {} };
  const first = steps.findIndex((step) => !isComplete(state, step));
  const complete = first < 0 ? steps.length : first;
  $('#summary').innerHTML = `<article><small>BLOCK 1 · BERAKHOT</small><strong>${complete} / ${steps.length}</strong></article><article><small>CURRENT AIM</small><strong>${complete === steps.length ? 'Canon connection earned' : 'One source move at a time'}</strong></article>`;
  $('#steps').innerHTML = steps.map((step, index) => {
    const established = isComplete(state, step), current = index === first, locked = !established && !current;
    const action = locked ? '<span class="next disabled">Earn the earlier move first →</span>' : `<a href="${step.url}">${established ? 'Review this move →' : 'Continue this move →'}</a>${established && step.optionalUrl ? `<a class="secondary" href="${step.optionalUrl}">Try cross-tractate transfer →</a>` : ''}`;
    return `<article class="course-card ${locked ? 'locked' : ''}"><small>${established ? 'REVIEWABLE' : current ? 'YOUR NEXT MOVE' : 'UPCOMING'}</small><h2>${step.title}</h2><p>${step.copy}</p>${action}</article>`;
  }).join('');
}).catch(() => { $('#steps').innerHTML = '<p>Open the first Berakhot lesson to begin.</p>'; });
