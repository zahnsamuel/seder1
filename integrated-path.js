const $ = (selector) => document.querySelector(selector);
const learnerId = Seder.currentLearnerId();
const storageKey = `seder-integrated-path-${learnerId}`;
const saved = JSON.parse(localStorage.getItem(storageKey) || '{"started":[]}');
const state = {started: new Set(saved.started || [])};

const save = () => localStorage.setItem(storageKey, JSON.stringify({started:[...state.started]}));
const evidenceFor = (week, learner) => Object.entries(learner?.mastery || {}).filter(([skill, score]) => score >= .34 && week.evidencePrefixes.some((prefix) => skill.startsWith(prefix))).length;
const readyForReview = (week, learner) => evidenceFor(week, learner) >= week.evidenceTarget;
const currentWeek = (weeks, learner) => weeks.findIndex((week) => !readyForReview(week, learner));
const labelFor = (week, current, learner) => readyForReview(week, learner) ? 'RETRIEVAL READY' : week.week === current + 1 ? (state.started.has(week.week) ? 'IN PROGRESS' : 'READY TO BEGIN') : week.week > current + 1 ? 'COMING NEXT' : 'RETURN TO THIS WEEK';

function render(path, learner) {
  const current = currentWeek(path.weeks, learner);
  $('#title').textContent = path.title;
  $('#principle').textContent = path.principle;
  $('#xp').textContent = learner?.xp ?? 0;
  $('#skills').textContent = Object.values(learner?.mastery || {}).filter((value) => value >= .67).length;
  const readyWeeks = path.weeks.filter((week) => readyForReview(week, learner)).length;
  $('#weeks-ready').textContent = `${readyWeeks} / ${path.weeks.length}`;
  $('#journey').innerHTML = path.weeks.map((week) => {
    const isReady = readyForReview(week, learner);
    const evidence = evidenceFor(week, learner);
    const status = labelFor(week, current, learner);
    const locked = week.week > current + 1;
    const className = isReady ? 'ready' : week.week === current + 1 ? 'current' : locked ? 'locked' : '';
    const action = isReady
      ? `<a class="begin" href="${week.review}" data-visit="${week.week}">Review this week →</a>`
      : locked ? `<span class="study-state">Complete the preceding week's study plan first.</span>`
      : `<a class="begin" href="${week.gemara}" data-start="${week.week}">Begin with Gemara →</a><span class="study-state">Evidence: ${evidence} / ${week.evidenceTarget} source moves. Complete source work to unlock retrieval.</span>`;
    return `<article class="week ${className}" data-week="${week.week}">
      <div class="week-top"><span class="week-number">WEEK ${week.week}</span><span class="status">${status}</span></div>
      <h2>${week.theme}</h2><p class="practice">${week.practice}</p>
      <div class="moves"><a class="move" href="${week.gemara}" data-start="${week.week}">GEMARA SPINE<small>Start the week's reading move</small></a><a class="move" href="${week.canon}" data-visit="${week.week}">CANON CONNECTION<small>Meet the same question in another source form</small></a><a class="move" href="${week.review}" data-visit="${week.week}">RETRIEVAL & TRANSFER<small>Return after time and test the move</small></a></div>
      <div class="week-actions">${action}</div></article>`;
  }).join('');
  document.querySelectorAll('[data-start],[data-visit]').forEach((link) => link.addEventListener('click', () => {
    const week = Number(link.dataset.start || link.dataset.visit); state.started.add(week); save();
    Seder.saveJourneyArtifact('integrated_week_started', String(week));
  }));
}

Promise.all([
  fetch('data/eight-week-integrated-path.json').then((response) => response.json()),
  Seder.api(`/api/learners/${learnerId}`).then((response) => response.ok ? response.json() : null).catch(() => null)
]).then(([path, learner]) => render(path, learner)).catch(() => { $('#title').textContent = 'Your journey is temporarily unavailable.'; });
