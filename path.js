const key = 'seder-course-progress-v1';
const learnerId = Seder.currentLearnerId();
const saved = JSON.parse(localStorage.getItem(key) || '{}');
const xp = document.querySelector('#xp');
xp.textContent = `${saved.xp || 0} XP`;
const readableSkill = (skill) => skill.replace(/^lab-/, '').replaceAll('-', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());

Promise.all([
  Seder.api(`/api/learners/${learnerId}`).then((response) => response.ok ? response.json() : Promise.reject()),
  Seder.api(`/api/learners/${learnerId}/recommendation`).then((response) => response.ok ? response.json() : Promise.reject()),
  Seder.api(`/api/learners/${learnerId}/review`).then((response) => response.ok ? response.json() : Promise.reject())
]).then(([learner, decision, review]) => {
  const completed = new Set(learner.completedStages || []);
  const stageState = {
    source: completed.size > 0,
    sugya: [...completed].some((stage) => /berakhot|shabbat|pesachim/.test(stage)),
    foundation: ['foundation-capstone', 'term-two-capstone', 'second-foundation-synthesis'].some((stage) => completed.has(stage)),
    canon: completed.size >= 5,
    transfer: [...completed].some((stage) => /independent|transfer|capstone/.test(stage)),
    reader: completed.size >= 12
  };
  let activeMilestone = false;
  document.querySelectorAll('.path button[data-stage]').forEach((button) => {
    const done = stageState[button.dataset.stage];
    button.classList.toggle('done', done);
    button.classList.toggle('active', !done && !activeMilestone);
    if (!done && !activeMilestone) { button.setAttribute('aria-current', 'step'); activeMilestone = true; }
    else button.removeAttribute('aria-current');
  });
  xp.textContent = `${learner.xp || 0} XP`;
  localStorage.setItem(key, JSON.stringify({ ...saved, xp: learner.xp || 0 }));
  const recommendation = decision.recommendation;
  const today = document.querySelector('.today');
  today.querySelector('div').innerHTML = `<span>NEXT BEST STEP</span><strong>${recommendation.title}</strong><small>${recommendation.reason}</small>`;
  const action = today.querySelector('a'); action.href = recommendation.url; action.textContent = recommendation.kind === 'placement' ? 'Find my starting point →' : 'Start this step →';
  const daily = document.querySelector('.intro .primary'); daily.href = 'daily-router.html'; daily.textContent = recommendation.kind === 'placement' ? 'Begin my starting session →' : 'Begin today’s session →';
  if (review.due.length) {
    document.querySelector('#review-section').hidden = false;
    document.querySelector('#review-count').textContent = `${review.due.length} READY NOW`;
    document.querySelector('#review-list').innerHTML = review.due.map((item) => `<article class="review-card"><div><span>RETRIEVAL REVIEW</span><strong>${readableSkill(item.skillId)}</strong><small>${item.reason}</small></div><a href="review.html">Review this skill →</a></article>`).join('');
  }
}).catch(() => {});

document.querySelectorAll('.path button').forEach((node) => node.addEventListener('click', () => {
  document.querySelectorAll('.path button').forEach((item) => item.classList.toggle('active', item === node));
  document.querySelector('#detail').innerHTML = `<span>MASTERY TARGET</span><h2>${node.dataset.name}</h2><p>${node.dataset.text}</p><a class="primary" href="study.html?v=11">Practice this skill →</a>`;
}));
