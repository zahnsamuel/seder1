const learnerId = Seder.currentLearnerId();
const $ = (selector) => document.querySelector(selector);
const steps = [
  { title: '1 · Enter the measure-and-validity Mishnah', stage: 'sukkah-tractate-arc', url: 'sukkah-arc.html', copy: 'Map the structure, the stated condition, and the ruling before asking what principle gives the measure its force.' },
  { title: '2 · Map the visible Daf', event: (event) => event.correct && event.sourceContext?.includes('sukkah flagship workbench line'), url: 'flagship-daf-workbench.html?tractate=sukkah', copy: 'Classify the case, reason-question, and proof-text work on the visible source page.' },
  { title: '3 · Retrieve a Sukkah move', event: (event) => event.correct && String(event.skillId || '').startsWith('lab-sukkah-'), url: 'lab.html?tractate=sukkah', copy: 'Return to a source line and distinguish a condition, ruling, reason, and dispute.' },
  { title: '4 · Test transfer in a new sugya', event: (event) => event.correct && event.skillId === 'sukkah-unseen-transfer', url: 'gemara-unseen-check.html?block=sukkah', copy: 'Carry measure-and-validity reading into an unfamiliar source without assuming a new case has the same purpose.' },
  { title: '5 · Earn the Canon Connection', artifact: 'canon_connection', artifactId: 'sukkah', url: 'canon-connection.html?tractate=sukkah', copy: 'Connect the source’s physical form and reasoning to Torah’s language of embodied memory.' },
  { title: '6 · Widen the connection, then enter Bava Kamma', ready: (learner) => (learner.artifacts?.canon_connection || []).includes('sukkah'), url: 'sukkah-canon-bridge.html', copy: 'Take an optional Chumash and Chassidus deepening, then carry close classification into harm and restitution.' }
];
const complete = (learner, step) => {
  if (step.stage) return (learner.completedStages || []).includes(step.stage);
  if (step.artifact) return (learner.artifacts?.[step.artifact] || []).includes(step.artifactId);
  if (step.event) return (learner.events || []).some(step.event);
  return step.ready ? step.ready(learner) : false;
};
Seder.api(`/api/learners/${learnerId}`).then((response) => response.ok ? response.json() : null).then((learner) => {
  const state = learner || {}, first = steps.findIndex((step) => !complete(state, step)), earned = first < 0 ? steps.length : first;
  $('#summary').innerHTML = `<article><small>BLOCK 7 · SUKKAH</small><strong>${earned} / ${steps.length}</strong></article><article><small>CURRENT AIM</small><strong>${earned === steps.length ? 'Ready for Bava Kamma' : 'Keep form and reason together'}</strong></article>`;
  $('#steps').innerHTML = steps.map((step, index) => {
    const established = complete(state, step), current = index === first, locked = !established && !current;
    const action = locked ? '<span class="next disabled">Earn the earlier move first →</span>' : `<a href="${step.url}">${established ? 'Review this move →' : 'Continue this move →'}</a>`;
    return `<article class="course-card ${locked ? 'locked' : ''}"><small>${established ? 'REVIEWABLE' : current ? 'YOUR NEXT MOVE' : 'UPCOMING'}</small><h2>${step.title}</h2><p>${step.copy}</p>${action}</article>`;
  }).join('');
}).catch(() => { $('#steps').innerHTML = '<p>Open the Sukkah source trail to begin.</p>'; });
