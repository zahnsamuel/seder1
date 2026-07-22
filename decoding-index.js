// Renders the decoding-ladder index (hebrew-decoding.html) from window.DecodingDrills + the learner's
// completed-lesson set in localStorage. Each lesson links to decoding-lesson.html?lesson=<id>; the
// primary CTA points at the first not-yet-done lesson.
const drills = window.DecodingDrills;
const learner = (window.Seder && Seder.currentLearnerId && Seder.currentLearnerId()) || 'local';
const done = (() => { try { return new Set(JSON.parse(localStorage.getItem(`seder-decoding-done:${learner}`) || '[]')); } catch { return new Set(); } })();
const order = drills.bands.flatMap((b) => b.lessons);
const nextLesson = order.find((id) => !done.has(id)) || order[order.length - 1];
const $ = (s) => document.querySelector(s);

$('#ladder').innerHTML = drills.bands.map((band) => {
  const lessons = band.lessons.map((id) => {
    const l = drills.lessons[id];
    const isDone = done.has(id), isNext = id === nextLesson;
    const state = isDone ? 'done' : isNext ? 'current' : '';
    const action = isDone ? 'Review →' : isNext ? 'Start →' : 'Open →';
    return `<a class="dl-lesson ${state}" href="decoding-lesson.html?lesson=${id}"><span class="dl-badge">${isDone ? '✓' : ''}</span><span class="dl-body"><strong>${l.title}</strong><small>${l.bandLabel}</small></span><span class="dl-go">${action}</span></a>`;
  }).join('');
  return `<section class="dl-band"><div class="dl-band-head"><span>BAND ${band.id}</span><h2>${band.title}</h2></div><div class="dl-lessons">${lessons}</div></section>`;
}).join('');

const cta = $('#continue-cta');
if (cta) { cta.href = `decoding-lesson.html?lesson=${nextLesson}`; cta.textContent = (done.size ? 'Continue decoding' : 'Start decoding') + ' →'; }
const prog = $('#ladder-progress');
if (prog) prog.textContent = `${order.filter((id) => done.has(id)).length} / ${order.length} LESSONS`;
