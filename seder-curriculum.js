const learnerId = Seder.currentLearnerId();
const $ = (selector) => document.querySelector(selector);
function evidenceCount(learner, prefixes) {
  return Object.entries(learner.mastery || {}).filter(([id, score]) => score >= .34 && prefixes.some((prefix) => id.startsWith(prefix))).length;
}
Promise.all([fetch('data/seder-curriculum-map.json').then((response) => response.json()), Seder.api(`/api/learners/${learnerId}`).then((response) => response.ok ? response.json() : {})]).then(([map, learner]) => {
  $('#title').textContent = map.title; $('#principle').textContent = map.principle; $('#xp').textContent = `${learner.xp || 0} XP`;
  const milestones = map.levels.flatMap((level) => level.milestones);
  const growing = milestones.filter((milestone) => evidenceCount(learner, milestone.evidencePrefixes) >= 2).length;
  $('#summary').innerHTML = `<span><small>CURRICULUM LEVELS</small><strong>${map.levels.length}</strong></span><span><small>MAJOR MILESTONES</small><strong>${milestones.length}</strong></span><span><small>EVIDENCE GROWING</small><strong>${growing}</strong></span>`;
  $('#levels').innerHTML = map.levels.map((level) => `<article class="level"><strong class="level-number">${level.number}</strong><div><div class="level-head"><div><h2>${level.title}</h2><p class="promise">${level.promise}</p></div><span class="range">${level.range}</span></div><div class="milestones">${level.milestones.map((milestone) => { const count = evidenceCount(learner, milestone.evidencePrefixes); return `<article class="milestone ${count >= 2 ? 'evidence' : ''}"><small>${count >= 2 ? 'EVIDENCE GROWING' : 'NEXT MILESTONE'}</small><h3>${milestone.title}</h3><p>${milestone.capability}</p><a href="${milestone.route}">${milestone.routeLabel} →</a></article>`; }).join('')}</div></div></article>`).join('');
}).catch(() => { $('#title').textContent = 'The long-form curriculum could not load.'; $('#principle').textContent = 'Refresh to try again.'; });
