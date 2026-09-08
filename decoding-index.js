// Renders the decoding-ladder index (hebrew-decoding.html) from window.DecodingDrills + the learner's
// completed-lesson set and spaced-review schedule in localStorage. First paint is one next move
// (start / continue / review-due / done). The full band ladder is filled into #ladder, which lives
// inside a collapsed <details>. Each lesson links to decoding-lesson.html?lesson=<id>. Review-due is
// preferred over the next new lesson. A finished or skipped ladder hands off to Today.
// Storage keys: seder-decoding-done: / seder-decoding-review: / seder-decoding-complete:
(function (root) {
  const START_TITLE = 'First, learn to read the Hebrew letters.';
  const START_COPY = 'This is today’s first step: match each letter to its sound, then vowels, then short words. One short lesson at a time. No prior Hebrew needed. Modern Israeli pronunciation.';
  const REVIEW_COPY = 'A quick re-drill keeps the letters automatic. Review this lesson, then return to the next new one.';
  const DONE_TITLE = 'You can decode Hebrew.';
  const DONE_COPY = 'That capability is in place. Return to Today for the next reading skill.';
  const TODAY = 'daily-router.html';
  const ACADEMY = 'academy.html';
  const DECODE_GRAPH_SKILLS = ['fnd-decode-letters', 'fnd-decode-vowels', 'fnd-decode-blend', 'fnd-decode-word'];

  const readJSON = (storage, key, fallback) => {
    try { return JSON.parse(storage.getItem(key) || fallback); } catch { return JSON.parse(fallback); }
  };

  const lessonOrder = (drills) => (drills && drills.bands ? drills.bands.flatMap((b) => b.lessons) : []);

  const markLadderComplete = (storage, learner, drills) => {
    const id = learner || 'local';
    const order = lessonOrder(drills);
    storage.setItem(`seder-decoding-done:${id}`, JSON.stringify(order));
    storage.setItem(`seder-decoding-complete:${id}`, '1');
    return order;
  };

  const isLadderComplete = (storage, learner, drills) => {
    const id = learner || 'local';
    if (storage.getItem(`seder-decoding-complete:${id}`)) return true;
    const done = readJSON(storage, `seder-decoding-done:${id}`, '[]');
    const order = lessonOrder(drills);
    return Array.isArray(done) && order.length > 0 && order.every((lesson) => done.includes(lesson));
  };

  const decodeSkillEvent = (skill, sourceContext) => ({
    type: 'answer_submitted',
    skillId: skill,
    foundationSkillId: skill,
    knowledgePointId: `kp-${skill}-2`,
    correct: true,
    sourceContext: sourceContext || 'Decoding · Hebrew decoding',
    competency: 'sourceReasoning'
  });

  const postDecodeSkills = (skills, sourceContext) => {
    if (!(root.Seder && root.Seder.api && root.Seder.currentLearnerId)) return Promise.resolve();
    const id = root.Seder.currentLearnerId();
    return Promise.all((skills || DECODE_GRAPH_SKILLS).map((skill) => {
      const body = JSON.stringify(decodeSkillEvent(skill, sourceContext));
      const post = () => root.Seder.api(`/api/learners/${id}/events`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });
      // Two correct answers take graph mastery past the secure threshold (>= .67).
      return post().then(post).catch(() => {});
    }));
  };

  const skipDecode = (storage, drills, learner, location) => {
    markLadderComplete(storage, learner, drills);
    const go = () => { if (location) location.href = TODAY; };
    return postDecodeSkills(DECODE_GRAPH_SKILLS, 'Decoding · already reads Hebrew').then(go).catch(go);
  };

  const learnerState = (drills, storage, learner, now) => {
    const done = new Set(readJSON(storage, `seder-decoding-done:${learner}`, '[]'));
    const review = readJSON(storage, `seder-decoding-review:${learner}`, '{}');
    const skillDue = (s) => review[s] && review[s].dueAt <= now;
    const lessonDue = (id) => done.has(id) && ((drills.lessonSkills && drills.lessonSkills[id]) || []).some(skillDue);
    const order = lessonOrder(drills);
    const allDone = order.length > 0 && order.every((id) => done.has(id));
    const nextLesson = order.find((id) => !done.has(id)) || order[order.length - 1];
    const dueLessons = order.filter(lessonDue);
    const firstDue = dueLessons[0];
    const target = firstDue || nextLesson;
    const mode = firstDue ? 'review' : allDone ? 'done' : done.size ? 'continue' : 'start';
    return { done, order, nextLesson, dueLessons, firstDue, target, mode, lessonDue, allDone };
  };

  const heroFor = (drills, state) => {
    const lesson = (drills.lessons && drills.lessons[state.target]) || {};
    if (state.mode === 'review') {
      return { title: lesson.title || START_TITLE, copy: REVIEW_COPY, cta: 'Review what is due →', href: `decoding-lesson.html?lesson=${state.target}` };
    }
    if (state.mode === 'done') {
      return { title: DONE_TITLE, copy: DONE_COPY, cta: 'Continue to Today →', href: TODAY };
    }
    if (state.mode === 'continue') {
      return { title: lesson.title || START_TITLE, copy: lesson.intro || 'Continue with the next short decoding lesson.', cta: 'Continue this lesson →', href: `decoding-lesson.html?lesson=${state.target}` };
    }
    return { title: START_TITLE, copy: START_COPY, cta: 'Start this lesson →', href: `decoding-lesson.html?lesson=${state.target}` };
  };

  const progressFor = (state) => {
    const n = state.order.length;
    const done = state.order.filter((id) => state.done.has(id)).length;
    if (state.mode === 'done') return 'Hebrew decoding is secure.';
    if (state.mode === 'start') return `A few minutes · first of ${n} short lessons.`;
    if (state.mode === 'review') return `${done} / ${n} lessons · review is due.`;
    return `${done} / ${n} lessons`;
  };

  const ladderHtml = (drills, state) => drills.bands.map((band) => {
    const lessons = band.lessons.map((id) => {
      const l = drills.lessons[id];
      const isDue = state.lessonDue(id), isDone = state.done.has(id), isNext = id === state.nextLesson && state.mode !== 'done';
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
    const skip = document.querySelector('#skip-decode');
    const skipWrap = document.querySelector('#skip-decode-wrap') || skip;
    const academy = document.querySelector('#decode-academy');
    if (title) title.textContent = hero.title;
    if (copy) copy.textContent = hero.copy;
    if (cta) { cta.href = hero.href; cta.textContent = hero.cta; }
    if (prog) prog.textContent = progressFor(state);
    if (ladder) ladder.innerHTML = ladderHtml(drills, state);
    if (skipWrap) skipWrap.hidden = state.mode === 'done';
    if (academy) academy.hidden = state.mode !== 'done';
  };

  const bindSkip = (document, drills, storage, learner, location) => {
    const skip = document && document.querySelector && document.querySelector('#skip-decode');
    if (!skip || skip.dataset.bound === '1') return;
    skip.dataset.bound = '1';
    skip.addEventListener('click', (event) => {
      event.preventDefault();
      skipDecode(storage, drills, learner, location);
    });
  };

  root.SederDecodingIndex = {
    TODAY, ACADEMY, DECODE_GRAPH_SKILLS, START_TITLE, DONE_TITLE,
    learnerState, heroFor, progressFor, ladderHtml, render,
    markLadderComplete, isLadderComplete, decodeSkillEvent, postDecodeSkills, skipDecode, bindSkip
  };

  if (typeof document !== 'undefined' && document.querySelector) {
    const learner = (root.Seder && root.Seder.currentLearnerId && root.Seder.currentLearnerId()) || 'local';
    const storage = root.localStorage || (typeof localStorage !== 'undefined' ? localStorage : null);
    if (document.querySelector('#continue-cta') && storage) {
      render(document, root.DecodingDrills, storage, Date.now(), learner);
    }
    if (storage) bindSkip(document, root.DecodingDrills, storage, learner, root.location);
  }
})(typeof window !== 'undefined' ? window : globalThis);
