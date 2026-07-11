const session = document.querySelector('#session');
const learnerId = Seder.currentLearnerId();
Seder.api(`/api/learners/${learnerId}/today`).then((response) => response.ok ? response.json() : Promise.reject()).then((plan) => {
  document.querySelector('#session-title').textContent = plan.title;
  document.querySelector('#session-copy').textContent = plan.steps.length === 1 ? 'Begin with a short placement so Seder can shape future sessions around what you actually know.' : 'A focused sequence of retrieval, new learning, and a clear return to your path.';
  document.querySelector('#time').textContent = `${plan.totalMinutes} MINUTES`;
  document.querySelector('#step-count').textContent = `${plan.steps.length} STEPS`;
  document.querySelector('#xp').textContent = `${plan.xp || 0} XP`;
  document.querySelector('#streak').textContent = `${plan.dailyStreak || 0} DAY RHYTHM`;
  session.innerHTML = plan.steps.map((step, index) => `<article class="session-step ${step.type}"><b>${index + 1}</b><div><span>${step.label.toUpperCase()}</span><h2>${step.title}</h2><p>${step.reason}</p></div><div><small>${step.minutes} MIN</small><a href="${step.url}">${index === 0 ? 'Begin →' : 'Open →'}</a></div></article>`).join('');
  if (plan.fadingCount > 0) {
    const nudge = document.createElement('p');
    nudge.className = 'fading-nudge';
    nudge.innerHTML = `<a href="mastery.html">${plan.fadingCount} previously mastered skill${plan.fadingCount === 1 ? '' : 's'} ${plan.fadingCount === 1 ? 'is' : 'are'} fading — see your mastery map →</a>`;
    document.querySelector('.promise').before(nudge);
  }
}).catch(() => { document.querySelector('#session-title').textContent = 'Session unavailable'; document.querySelector('#session-copy').textContent = 'Refresh to reconnect to your learning path.'; });
