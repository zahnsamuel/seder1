const learnerId = Seder.currentLearnerId();
const journeyPreview = (nodes) => {
  const currentIndex = Math.max(0, nodes.findIndex((node) => node.available && !node.complete));
  const start = Math.max(0, currentIndex - 2);
  return nodes.slice(start, Math.min(nodes.length, currentIndex + 4));
};
const navigation = document.querySelector('header');
if (navigation && !navigation.querySelector('[href="academy.html"]')) {
  const academy = document.createElement('a');
  academy.href = 'academy.html';
  academy.textContent = 'First Month';
  navigation.insertBefore(academy, navigation.querySelector('#xp'));
}
if (navigation && !navigation.querySelector('[href="study-record.html"]')) {
  const record = document.createElement('a');
  record.href = 'study-record.html';
  record.textContent = 'Study Record';
  navigation.insertBefore(record, navigation.querySelector('#xp'));
}
function level(xp) { const n = Math.floor((xp || 0) / 100) + 1; return { n, name: ['Text Explorer', 'Source Reader', 'Canon Navigator', 'Argument Mapper', 'Independent Learner'][Math.min(n - 1, 4)], progress: (xp || 0) % 100 }; }
Promise.all([Seder.api(`/api/learners/${learnerId}`).then(r=>r.ok?r.json():Promise.reject()),Seder.api(`/api/learners/${learnerId}/recommendation`).then(r=>r.ok?r.json():Promise.reject()),Seder.api(`/api/learners/${learnerId}/journey`).then(r=>r.ok?r.json():Promise.reject())]).then(([learner,decision,journey])=>{const xp=learner.xp||0,lvl=level(xp),placement=decision.recommendation.kind==='placement';document.querySelector('#xp').textContent=`${xp} XP`;document.querySelector('#levelLabel').textContent=`LEVEL ${lvl.n} · ${lvl.name.toUpperCase()}`;document.querySelector('#levelCopy').textContent=lvl.progress?`${100-lvl.progress} XP to your next learning level.`:'A new learning level is ready to begin.';document.querySelector('#levelXp').textContent=`${lvl.progress} / 100 XP`;document.querySelector('#levelBar').style.width=`${lvl.progress}%`;document.querySelector('#streak').textContent=learner.dailyStreak||0;document.querySelector('#sources').textContent=Object.keys(learner.mastery||{}).length;document.querySelector('#todayTitle').textContent=placement?decision.recommendation.title:'Today in Jewish Learning Academy';document.querySelector('#todayCopy').textContent=placement?decision.recommendation.reason:'One clear next step: repair what is fragile, then build the next source move.';const action=document.querySelector('#nextAction');action.href=placement?decision.recommendation.url:'daily-router.html';action.textContent=placement?'Find my starting point →':'See today’s next step →';document.querySelector('#journeyProgress').textContent=`${journey.completed} OF ${journey.total} MOMENTS`;document.querySelector('#journeyMap').innerHTML=journeyPreview(journey.nodes).map(node=>`<li class="${node.complete?'done':''} ${node.available?'current':''}"><b>${node.complete?'✓':node.index}</b><span>${node.lens.toUpperCase()}</span><strong>${node.title}</strong><small>${node.complete?'Mastery evidence recorded.':node.available?'Your next connected source session.':'This opens when the prior source move is secure.'}</small>${node.complete||node.available?`<a href="canon-session.html?id=${encodeURIComponent(node.id)}">${node.complete?'Revisit →':'Begin →'}</a>`:''}</li>`).join('')}).catch(()=>{});
