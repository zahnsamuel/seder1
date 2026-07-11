const learnerId = Seder.currentLearnerId();
Seder.api(`/api/learners/${learnerId}/insights`).then((response) => response.ok ? response.json() : Promise.reject()).then((insights) => {
  const cards = [
    ['Canon moments', `${insights.completedMoments} / ${insights.totalMoments}`, insights.currentCanonMoment],
    ['Source attempts', insights.attempts, insights.accuracy === null ? 'Your first answer will establish a baseline.' : `${insights.accuracy}% correct across source work`],
    ['Contexts read', insights.sourceContexts, 'Mastery becomes more reliable when it transfers across contexts.'],
    ['Retrieval due', insights.reviewDue, insights.reviewDue ? 'A short retrieval is ready.' : 'No scheduled retrieval is waiting.']
  ];
  document.querySelector('#metrics').innerHTML = cards.map(([label, value, copy]) => `<article><span>${label.toUpperCase()}</span><strong>${value}</strong><p>${copy}</p></article>`).join('');
  if (insights.needsSupport.length) document.querySelector('#metrics').insertAdjacentHTML('afterend', `<p class="support">One or more source moves needs another pass. Your next session will bring it back in context.</p>`);
}).catch(() => { document.querySelector('#metrics').textContent = 'Insights are temporarily unavailable.'; });
