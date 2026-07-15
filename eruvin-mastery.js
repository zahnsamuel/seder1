const learnerId = Seder.currentLearnerId();
const $ = (selector) => document.querySelector(selector);
const steps = [
  { title: '1 · Enter the measured case', stage: 'eruvin-tractate-arc', url: 'eruvin-arc.html', copy: 'Map the alleyway, its measurement, the response it requires, and the purpose behind the limit.' },
  { title: '2 · Map the visible Daf', event: (event) => event.correct && event.sourceContext?.includes('eruvin flagship workbench line'), url: 'flagship-daf-workbench.html?tractate=eruvin', copy: 'Classify each line’s job on the page before turning a measure into a general claim.' },
  { title: '3 · Retrieve an Eruvin move', event: (event) => event.correct && String(event.skillId || '').startsWith('lab-eruvin-'), url: 'lab.html?tractate=eruvin', copy: 'Return to the source and reconstruct how case, measure, and response belong together.' },
  { title: '4 · Test transfer in a new sugya', event: (event) => event.correct && event.skillId === 'eruvin-unseen-transfer', url: 'gemara-unseen-check.html?block=eruvin', copy: 'Carry the case-and-measure habit into a source whose object and legal field are new.' },
  { title: '5 · Earn the Canon Connection', artifact: 'canon_connection', artifactId: 'eruvin', url: 'canon-connection.html?tractate=eruvin', copy: 'Connect Eruvin’s concrete legal forms to a Torah source without reducing either text to a slogan.' },
  { title: '6 · Enter Pesachim', ready: (learner) => (learner.artifacts?.canon_connection || []).includes('eruvin'), url: 'pesachim-arc.html', copy: 'Bring close reading of time, action, and a consequential word into Pesachim.' }
];
const complete = (learner, step) => {
  if (step.stage) return (learner.completedStages || []).includes(step.stage);
  if (step.artifact) return (learner.artifacts?.[step.artifact] || []).includes(step.artifactId);
  if (step.event) return (learner.events || []).some(step.event);
  return step.ready ? step.ready(learner) : false;
};
Seder.api(`/api/learners/${learnerId}`).then((response) => response.ok ? response.json() : null).then((learner) => {
  const state = learner || {};
  const first = steps.findIndex((step) => !complete(state, step));
  const earned = first < 0 ? steps.length : first;
  $('#summary').innerHTML = `<article><small>BLOCK 3 · ERUVIN</small><strong>${earned} / ${steps.length}</strong></article><article><small>CURRENT AIM</small><strong>${earned === steps.length ? 'Ready for Pesachim' : 'Make the case visible'}</strong></article>`;
  $('#steps').innerHTML = steps.map((step, index) => {
    const established = complete(state, step), current = index === first, locked = !established && !current;
    const action = locked ? '<span class="next disabled">Earn the earlier move first →</span>' : `<a href="${step.url}">${established ? 'Review this move →' : 'Continue this move →'}</a>`;
    return `<article class="course-card ${locked ? 'locked' : ''}"><small>${established ? 'REVIEWABLE' : current ? 'YOUR NEXT MOVE' : 'UPCOMING'}</small><h2>${step.title}</h2><p>${step.copy}</p>${action}</article>`;
  }).join('');
}).catch(() => { $('#steps').innerHTML = '<p>Open the Eruvin source trail to begin.</p>'; });
