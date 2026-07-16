const learnerId = Seder.currentLearnerId();
const terms = [
  { number: 'I', title: 'First Foundation Term', stage: 'foundation-capstone', url: 'integrated-path.html', action: 'Begin First Term →', summary: 'Map cases, questions, evidence, and reception across the canon.' },
  { number: 'II', title: 'Second Foundation Term', stage: 'term-two-capstone', url: 'second-foundation-term.html', action: 'Begin Second Term →', summary: 'Trace institutional reasons, exceptions, scope, and public responsibility.' },
  { number: 'III', title: 'Third Foundation Term', stage: 'second-foundation-synthesis', url: 'term-three-journey.html', action: 'Begin Third Term →', summary: 'Preserve disagreement, make a careful comparison, and transfer the habit.' }
];
const $ = (selector) => document.querySelector(selector);
function render(learner) {
  const completed = new Set(learner?.completedStages || []); const count = terms.filter((term) => completed.has(term.stage)).length;
  $('#xp').textContent = `${learner?.xp || 0} XP`; $('#meter').style.width = `${(count / terms.length) * 100}%`;
  $('#status').textContent = count === terms.length ? 'Foundation Year synthesis earned.' : `Term ${count + 1} is your current foundation.`;
  $('#summary').textContent = count === terms.length ? 'You have evidence for reason, scope, disagreement, and cross-canon transfer. Continue into the Gemara Year, then return for retrieval.' : `${count} of ${terms.length} term checkpoints earned. One clear next move is open.`;
  $('#terms').innerHTML = terms.map((term, index) => {
    const complete = completed.has(term.stage), current = !complete && index === count, state = complete ? 'complete' : current ? 'current' : 'locked';
    const note = complete ? 'Checkpoint earned · revisit when you want to strengthen the repertoire.' : current ? 'Your next connected term is ready.' : 'Earn the preceding term checkpoint to open this material.';
    const action = complete ? `<a href="${term.url}">Revisit →</a>` : current ? `<a href="${term.url}">${term.action}</a>` : '<span class="later">Later</span>';
    return `<article class="term ${state}"><span class="number">${complete ? '✓' : term.number}</span><div><small>TERM ${term.number} · ${complete ? 'EARNED' : current ? 'CURRENT' : 'LOCKED'}</small><h2>${term.title}</h2><p>${term.summary}</p><p>${note}</p></div>${action}</article>`;
  }).join('') + (count === terms.length ? '<a class="term current" href="gemara-year.html"><span class="number">→</span><div><small>NEXT · GEMARA YEAR</small><h2>Carry the repertoire across Shas</h2><p>Enter the next three earned terms: time and space, civil reasoning, then rule and disagreement.</p></div><span>Open Gemara Year →</span></a>' : '');
}
Seder.api(`/api/learners/${learnerId}`).then((response) => response.ok ? response.json() : null).then(render).catch(() => render(null));
