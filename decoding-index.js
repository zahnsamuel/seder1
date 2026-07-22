// Renders the decoding-ladder index (hebrew-decoding.html) from window.DecodingDrills + the learner's
// completed-lesson set and spaced-review schedule in localStorage. Each lesson links to
// decoding-lesson.html?lesson=<id>. A completed lesson whose dec- skills have come due is flagged for
// review; the primary CTA and a banner point at what is due first, otherwise the next new lesson.
const drills = window.DecodingDrills;
const learner = (window.Seder && Seder.currentLearnerId && Seder.currentLearnerId()) || 'local';
const readJSON = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key) || fallback); } catch { return JSON.parse(fallback); } };
const done = new Set(readJSON(`seder-decoding-done:${learner}`, '[]'));
const review = readJSON(`seder-decoding-review:${learner}`, '{}');
const now = Date.now();
const skillDue = (s) => review[s] && review[s].dueAt <= now;
const lessonDue = (id) => done.has(id) && ((drills.lessonSkills && drills.lessonSkills[id]) || []).some(skillDue);
const order = drills.bands.flatMap((b) => b.lessons);
const nextLesson = order.find((id) => !done.has(id)) || order[order.length - 1];
const dueLessons = order.filter(lessonDue);
const firstDue = dueLessons[0];
const $ = (s) => document.querySelector(s);

$('#ladder').innerHTML = drills.bands.map((band) => {
  const lessons = band.lessons.map((id) => {
    const l = drills.lessons[id];
    const isDue = lessonDue(id), isDone = done.has(id), isNext = id === nextLesson;
    const state = isDue ? 'review' : isDone ? 'done' : isNext ? 'current' : '';
    const action = (isDue || isDone) ? 'Review →' : isNext ? 'Start →' : 'Open →';
    const badge = isDue ? '↻' : isDone ? '✓' : '';
    const label = isDue ? 'DUE FOR REVIEW' : l.bandLabel;
    return `<a class="dl-lesson ${state}" href="decoding-lesson.html?lesson=${id}"><span class="dl-badge">${badge}</span><span class="dl-body"><strong>${l.title}</strong><small>${label}</small></span><span class="dl-go">${action}</span></a>`;
  }).join('');
  return `<section class="dl-band"><div class="dl-band-head"><span>BAND ${band.id}</span><h2>${band.title}</h2></div><div class="dl-lessons">${lessons}</div></section>`;
}).join('');

const banner = $('#review-banner');
if (banner) {
  banner.hidden = !dueLessons.length;
  if (dueLessons.length) banner.innerHTML = `<span>↻ ${dueLessons.length} lesson${dueLessons.length === 1 ? '' : 's'} due for review — a quick re-drill keeps the letters automatic.</span> <a href="decoding-lesson.html?lesson=${firstDue}">Review now →</a>`;
}

const cta = $('#continue-cta');
if (cta) {
  const target = firstDue || nextLesson;
  cta.href = `decoding-lesson.html?lesson=${target}`;
  cta.textContent = (firstDue ? 'Review what is due' : done.size ? 'Continue decoding' : 'Start decoding') + ' →';
}
const prog = $('#ladder-progress');
if (prog) prog.textContent = `${order.filter((id) => done.has(id)).length} / ${order.length} LESSONS`;
