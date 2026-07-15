const learnerId = Seder.currentLearnerId();
const $ = (selector) => document.querySelector(selector);
const steps = [
  { title: '1 · Enter the counted Mishnah', stage: 'shabbat-tractate-arc', url: 'shabbat-arc.html', copy: 'Map people, domains, action, category, distinction, and the source’s stated reason.' },
  { title: '2 · Map the visible Daf', event: (event) => event.correct && event.sourceContext?.includes('shabbat flagship workbench line'), url: 'flagship-daf-workbench.html?tractate=shabbat', copy: 'Classify every line’s job on the page before deciding what the sugya means.' },
  { title: '3 · Retrieve a Shabbat move', event: (event) => event.correct && String(event.skillId || '').startsWith('lab-shabbat-'), url: 'lab.html?tractate=shabbat', copy: 'Return to a source line and identify the reading move without relying on the earlier trail.' },
  { title: '4 · Test transfer in a new sugya', event: (event) => event.correct && event.skillId === 'shabbat-unseen-transfer', url: 'gemara-unseen-check.html?block=shabbat', copy: 'Carry case-mapping into a source whose people, place, and category are unfamiliar.' },
  { title: '5 · Earn the Canon Connection', artifact: 'canon_connection', artifactId: 'shabbat', url: 'canon-connection.html?tractate=shabbat', copy: 'Connect the Shabbat reading habit to a Torah source without flattening either text.' },
  { title: '6 · Enter Eruvin', ready: (learner) => (learner.artifacts?.canon_connection || []).includes('shabbat'), url: 'eruvin-arc.html', copy: 'Bring the case-mapping habit into boundaries, measures, and shared space.' }
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
  $('#summary').innerHTML = `<article><small>BLOCK 2 · SHABBAT</small><strong>${earned} / ${steps.length}</strong></article><article><small>CURRENT AIM</small><strong>${earned === steps.length ? 'Ready for Eruvin' : 'Keep the case visible'}</strong></article>`;
  $('#steps').innerHTML = steps.map((step, index) => {
    const established = complete(state, step), current = index === first, locked = !established && !current;
    const action = locked ? '<span class="next disabled">Earn the earlier move first →</span>' : `<a href="${step.url}">${established ? 'Review this move →' : 'Continue this move →'}</a>`;
    return `<article class="course-card ${locked ? 'locked' : ''}"><small>${established ? 'REVIEWABLE' : current ? 'YOUR NEXT MOVE' : 'UPCOMING'}</small><h2>${step.title}</h2><p>${step.copy}</p>${action}</article>`;
  }).join('');
}).catch(() => { $('#steps').innerHTML = '<p>Open the Shabbat source trail to begin.</p>'; });
