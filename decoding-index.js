// Renders the decoding-ladder index (hebrew-decoding.html) from window.DecodingDrills + the learner's
// completed-lesson set and spaced-review schedule in localStorage. First paint is one next move
// (start / continue / review-due). The full band ladder is filled into #ladder, which lives inside
// a collapsed <details>. Each lesson links to decoding-lesson.html?lesson=<id>. Review-due is
// preferred over the next new lesson. Storage keys: seder-decoding-done: / seder-decoding-review:
(function (root) {
  const START_TITLE = 'Learn to read Hebrew from the very beginning.';
  const START_COPY = 'Before you can read a source you have to decode it — recognize each letter and its sound, then each vowel, then blend them into words. Short lessons, one glyph at a time, in Modern Hebrew pronunciation.';
  const REVIEW_COPY = 'A quick re-drill keeps the letters automatic. Review this lesson, then return to the next new one.';

  const readJSON = (storage, key, fallback) => {
    try { return JSON.parse(storage.getItem(key) || fallback); } catch { return JSON.parse(fallback); }
  };

  const learnerState = (drills, storage, learner, now) => {
    const done = new Set(readJSON(storage, `seder-decoding-done:${learner}`, '[]'));
    const review = readJSON(storage, `seder-decoding-review:${learner}`, '{}');
    const skillDue = (s) => review[s] && review[s].dueAt <= now;
    const lessonDue = (id) => done.has(id) && ((drills.lessonSkills && drills.lessonSkills[id]) || []).some(skillDue);
    const order = drills.bands.flatMap((b) => b.lessons);
    const nextLesson = order.find((id) => !done.has(id)) || order[order.length - 1];
    const dueLessons = order.filter(lessonDue);
    const firstDue = dueLessons[0];
    const target = firstDue || nextLesson;
    const mode = firstDue ? 'review' : done.size ? 'continue' : 'start';
    return { done, order, nextLesson, dueLessons, firstDue, target, mode, lessonDue };
  };

  const heroFor = (drills, state) => {
    const lesson = (drills.lessons && drills.lessons[state.target]) || {};
    if (state.mode === 'review') {
      return { title: lesson.title || START_TITLE, copy: REVIEW_COPY, cta: 'Review what is due →', href: `decoding-lesson.html?lesson=${state.target}` };
    }
    if (state.mode === 'continue') {
      return { title: lesson.title || START_TITLE, copy: lesson.intro || 'Continue with the next short decoding lesson.', cta: 'Continue decoding →', href: `decoding-lesson.html?lesson=${state.target}` };
    }
    return { title: START_TITLE, copy: START_COPY, cta: 'Start decoding →', href: `decoding-lesson.html?lesson=${state.target}` };
  };

  const ladderHtml = (drills, state) => drills.bands.map((band) => {
    const lessons = band.lessons.map((id) => {
      const l = drills.lessons[id];
      const isDue = state.lessonDue(id), isDone = state.done.has(id), isNext = id === state.nextLesson;
      const klass = isDue ? 'review' : isDone ? 'done' : isNext ? 'current' : '';
      const action = (isDue || isDone) ? 'Review →' : isNext ? 'Start →' : 'Open →';
      const badge = isDue ? '↻' : isDone ? '✓' : '';
      const label = isDue ? 'DUE FOR REVIEW' : l.bandLabel;
      return `<a class="dl-lesson ${klass}" href="decoding-lesson.html?lesson=${id}"><span class="dl-badge">${badge}</span><span class="dl-body"><strong>${l.title}</strong><small>${label}</small></span><span class="dl-go">${action}</span></a>`;
    }).join('');
    return `<section class="dl-band"><div class="dl-band-head"><span>BAND ${band.id}</span><h2>${band.title}</h2></div><div class="dl-lessons">${lessons}</div></section>`;
  }).join('');

  const render = (document, drills, storage, now, learner) => {
    if (!document || !drills || !drills.bands) return;
    const state = learnerState(drills, storage, learner || 'local', now);
    const hero = heroFor(drills, state);
    const title = document.querySelector('#decoding-title');
    const copy = document.querySelector('#decoding-copy');
    const cta = document.querySelector('#continue-cta');
    const prog = document.querySelector('#ladder-progress');
    const ladder = document.querySelector('#ladder');
    if (title) title.textContent = hero.title;
    if (copy) copy.textContent = hero.copy;
    if (cta) { cta.href = hero.href; cta.textContent = hero.cta; }
    if (prog) prog.textContent = `${state.order.filter((id) => state.done.has(id)).length} / ${state.order.length} lessons`;
    if (ladder) ladder.innerHTML = ladderHtml(drills, state);
  };

  root.SederDecodingIndex = { learnerState, heroFor, ladderHtml, render };

  if (typeof document !== 'undefined' && document.querySelector && document.querySelector('#continue-cta')) {
    const learner = (root.Seder && root.Seder.currentLearnerId && root.Seder.currentLearnerId()) || 'local';
    render(document, root.DecodingDrills, root.localStorage || localStorage, Date.now(), learner);
  }
})(typeof window !== 'undefined' ? window : globalThis);
