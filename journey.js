const learnerId = Seder.currentLearnerId();

Seder.api(`/api/learners/${learnerId}/journey`).then((response) => response.ok ? response.json() : Promise.reject()).then((journey) => {
  document.querySelector('#progress').textContent = `${journey.completed} OF ${journey.total} CANON MOMENTS`;
  let lastPhase = '';
  document.querySelector('#steps').innerHTML = journey.nodes.map((node) => {
    const phase = node.phase !== lastPhase ? `<h3 class="phase">${node.phase}</h3>` : '';
    lastPhase = node.phase;
    return `${phase}<article class="step ${node.complete ? 'done' : ''} ${node.available ? 'current' : ''} ${node.locked ? 'locked' : ''}"><b>${node.complete ? '✓' : node.index}</b><div><small>${node.lens.toUpperCase()}</small><h2>${node.title}</h2><p>${node.summary}</p><em>${node.complete ? 'Mastery evidence recorded.' : node.available ? 'Your next connected source session.' : 'This opens when the prior source move is secure.'}</em></div>${node.complete || node.available ? `<a href="canon-session.html?id=${encodeURIComponent(node.id)}">${node.complete ? 'Revisit →' : 'Continue →'}</a>` : '<span class="later">Later</span>'}</article>`;
  }).join('');
  return Seder.api(`/api/learners/${learnerId}`).then((response) => response.ok ? response.json() : null);
}).then((learner) => { if (learner) document.querySelector('#xp').textContent = `${learner.xp || 0} XP`; }).catch(() => {});
