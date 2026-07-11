const learnerId = Seder.currentLearnerId();

function level(xp) {
  const n = Math.floor((xp || 0) / 100) + 1;
  return { n, name: ['Text Explorer', 'Source Reader', 'Canon Navigator', 'Argument Mapper', 'Independent Learner'][Math.min(n - 1, 4)], progress: (xp || 0) % 100 };
}

Promise.all([
  Seder.api(`/api/learners/${learnerId}`).then((response) => response.ok ? response.json() : Promise.reject()),
  Seder.api(`/api/learners/${learnerId}/recommendation`).then((response) => response.ok ? response.json() : Promise.reject()),
  Seder.api(`/api/learners/${learnerId}/journey`).then((response) => response.ok ? response.json() : Promise.reject())
]).then(([learner, decision, journey]) => {
  const xp = learner.xp || 0, lvl = level(xp);
  document.querySelector('#xp').textContent = `${xp} XP`;
  document.querySelector('#levelLabel').textContent = `LEVEL ${lvl.n} · ${lvl.name.toUpperCase()}`;
  document.querySelector('#levelCopy').textContent = lvl.progress ? `${100 - lvl.progress} XP to your next learning level.` : 'A new learning level is ready to begin.';
  document.querySelector('#levelXp').textContent = `${lvl.progress} / 100 XP`;
  document.querySelector('#levelBar').style.width = `${lvl.progress}%`;
  document.querySelector('#streak').textContent = learner.dailyStreak || 0;
  document.querySelector('#sources').textContent = Object.keys(learner.mastery || {}).length;
  document.querySelector('#todayTitle').textContent = decision.recommendation.title;
  document.querySelector('#todayCopy').textContent = decision.recommendation.reason;
  const action = document.querySelector('#nextAction');
  action.href = decision.recommendation.url;
  action.textContent = decision.recommendation.kind === 'placement' ? 'Find my starting point →' : 'Continue your journey →';
  document.querySelector('#journeyProgress').textContent = `${journey.completed} OF ${journey.total} MOMENTS`;
  document.querySelector('#journeyMap').innerHTML = journey.nodes.map((node) => `<li class="${node.complete ? 'done' : ''} ${node.available ? 'current' : ''}"><b>${node.complete ? '✓' : node.index}</b><span>${node.lens.toUpperCase()}</span><strong>${node.title}</strong><small>${node.complete ? 'Mastery evidence recorded.' : node.available ? 'Your next connected source session.' : 'This opens when the prior source move is secure.'}</small>${node.complete || node.available ? `<a href="canon-session.html?id=${encodeURIComponent(node.id)}">${node.complete ? 'Revisit →' : 'Begin →'}</a>` : ''}</li>`).join('');
}).catch(() => {});
