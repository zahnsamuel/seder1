const arc=[
{title:'Core Gemara signals',copy:'Twelve high-frequency words that tell you what the page is doing.',stage:'read-language',url:'language.html',skill:'language-core'},
{title:'Enter Berakhot 2a',copy:'Find the Mishnah, the context-question, and the verse-based answer.',stage:'berakhot-2a-depth',url:'berakhot-deep.html',skill:'berakhot-'},
{title:'Build a proof',copy:'Follow a word-question, answer, sign, and second source on Berakhot 2b.',stage:'berakhot-2b-proof',url:'berakhot-unit-2.html',skill:'berakhot2b-'},
{title:'Transfer the moves',copy:'Read unfamiliar Berakhot signals with translation used only to verify.',stage:'berakhot-independent-transfer',url:'berakhot-unit-3.html',skill:'transfer-'},
{title:'Read Mishnah grammar',copy:'Use compact Hebrew structure to separate case, condition, and ruling.',stage:'berakhot-mishnah-grammar',url:'berakhot-unit-4.html',skill:'mishnah-grammar'},
{title:'Follow a cited teaching',copy:'Track baraita, objection, and response without losing the thread.',stage:'berakhot-baraita-disagreement',url:'berakhot-unit-5.html',skill:'baraita-'},
{title:'Gemara argument toolkit',copy:'Practice connectors, objections, distinctions, and conclusions across contexts.',stage:'gemara-reading-toolkit',url:'gemara-toolkit.html',skill:'connector-'},
{title:'Retrieval session',copy:'Bring back fragile source moves before beginning new material.',stage:'retrieval-room',url:'review.html',skill:'review'},
{title:'Independent reading',copy:'Meet unfamiliar Gemara signals without the scaffold.',stage:'independent-reading-checkpoint',url:'independent-read.html',skill:'independent-'},
{title:'Launch into a new tractate',copy:'Use your Berakhot tools in Eruvin, Shabbat, Pesachim, or Bava Metzia.',stage:'tractate-launch',url:'shas-map-v2.html',skill:'lab-'}
];

const START_TITLE = 'A real path through the opening of Shas.';
const START_COPY = 'Learn the signals, enter a Mishnah, follow a question, weigh evidence, then meet an unfamiliar passage on your own.';

function sessionState(completed){
  const doneSet = new Set(completed || []);
  let available = true;
  const items = arc.map((item, index) => {
    const done = doneSet.has(item.stage);
    const current = !done && available;
    available = available && done;
    return { ...item, index, done, current, locked: !done && !current };
  });
  const doneCount = items.filter((item) => item.done).length;
  const current = items.find((item) => item.current) || items[items.length - 1];
  return { items, current, doneCount, complete: doneCount === items.length };
}

function heroFor(state){
  if (state.complete) {
    return { title: state.current.title, copy: state.current.copy, cta: 'Continue into Shas →', href: state.current.url };
  }
  if (state.doneCount === 0) {
    return { title: START_TITLE, copy: START_COPY, cta: 'Begin the first session →', href: state.current.url };
  }
  return { title: state.current.title, copy: state.current.copy, cta: 'Continue this session →', href: state.current.url };
}

function sessionsHtml(state){
  return state.items.map((item) => {
    const action = item.done ? 'Revisit →' : item.current ? 'Begin →' : 'Locked';
    const status = item.done ? 'MASTERY EVIDENCE RECORDED' : item.current ? 'READY NOW' : 'PREREQUISITE IN PROGRESS';
    return `<article class="session ${item.done?'done':''} ${item.current?'current':''} ${item.locked?'locked':''}"><b>${item.done?'✓':item.index+1}</b><div><h2>${item.title}</h2><p>${item.copy}</p><small>${status}</small></div><a href="${item.url}">${action}</a></article>`;
  }).join('');
}

function render(document, learner){
  const xp = document.querySelector('#xp');
  const evidence = document.querySelector('#evidence');
  const completedEl = document.querySelector('#completed');
  const title = document.querySelector('#arc-title');
  const copy = document.querySelector('#arc-copy');
  const cta = document.querySelector('#arc-cta');
  const progress = document.querySelector('#arc-progress');
  const sessions = document.querySelector('#sessions');
  const completed = learner?.completedStages || [];
  const mastery = learner?.mastery || {};
  const state = sessionState(completed);
  const hero = heroFor(state);
  const sourceMoves = Object.keys(mastery).filter((k) => mastery[k] > 0).length;
  if (xp) xp.textContent = `${learner?.xp || 0} XP`;
  if (evidence) evidence.textContent = `${sourceMoves} SOURCE MOVES PRACTICED`;
  if (completedEl) completedEl.textContent = `${state.doneCount} OF ${state.items.length} SESSIONS`;
  if (title) title.textContent = hero.title;
  if (copy) copy.textContent = hero.copy;
  if (cta) { cta.href = hero.href; cta.textContent = hero.cta; }
  if (progress) progress.textContent = `${state.doneCount} / ${state.items.length} sessions`;
  if (sessions) sessions.innerHTML = sessionsHtml(state);
}

(typeof window !== 'undefined' ? window : globalThis).SederBerakhotArc = { arc, sessionState, heroFor, sessionsHtml, render };

if (typeof document !== 'undefined' && document.querySelector && document.querySelector('#arc-cta') && typeof Seder !== 'undefined') {
  const learnerId = Seder.currentLearnerId();
  Seder.api(`/api/learners/${learnerId}`).then((r) => r.ok ? r.json() : null).then((learner) => render(document, learner)).catch(() => render(document, null));
}
