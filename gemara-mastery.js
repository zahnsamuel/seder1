const learnerId = Seder.currentLearnerId();
const tractates = [
  { id: 'berakhot', title: 'Berakhot', focus: 'Question, context, and textual time', guided: 'berakhot-mastery.html', deep: 'cohort-source-mastery.html?tractate=berakhot', cohort: true },
  { id: 'shabbat', title: 'Shabbat', focus: 'Cases, domains, and distinctions', guided: 'shabbat-arc.html', deep: 'cohort-source-mastery.html?tractate=shabbat', cohort: true },
  { id: 'yoma', title: 'Yoma', focus: 'Preparation, risk, and proof text', guided: 'yoma-arc.html', deep: 'cohort-source-mastery.html?tractate=yoma', cohort: true },
  { id: 'ketubot', title: 'Ketubot', focus: 'Schedule, institution, and competing concerns', guided: 'ketubot-arc.html', deep: 'cohort-source-mastery.html?tractate=ketubot', cohort: true },
  { id: 'chullin', title: 'Chullin', focus: 'Rule, exception, and condition', guided: 'chullin-arc.html', deep: 'cohort-source-mastery.html?tractate=chullin', cohort: true },
  { id: 'niddah', title: 'Niddah', focus: 'Three positions held carefully', guided: 'niddah-arc.html', deep: 'cohort-source-mastery.html?tractate=niddah', cohort: true },
  { id: 'pesachim', title: 'Pesachim', focus: 'Time, action, and contested words', guided: 'pesachim-arc.html', deep: 'pesachim-deepening.html' },
  { id: 'eruvin', title: 'Eruvin', focus: 'Measure, formulation, and purpose', guided: 'eruvin-arc.html', deep: 'eruvin-deepening.html' },
  { id: 'sukkah', title: 'Sukkah', focus: 'Validity, reason, and competing accounts', guided: 'sukkah-arc.html', deep: 'sukkah-deepening.html' },
  { id: 'bava-metzia', title: 'Bava Metzia', focus: 'Claims, procedure, and evidence', guided: 'bava-metzia-arc.html', deep: 'bava-metzia-deepening.html' },
  { id: 'bava-kamma', title: 'Bava Kamma', focus: 'Categories, distinction, and shared principle', guided: 'bava-kamma-arc.html', deep: 'bava-kamma-deepening.html' }
];
const $ = (selector) => document.querySelector(selector);
const labelFor = (count) => count >= 4 ? 'TRANSFER' : count >= 3 ? 'INDEPENDENT' : count >= 2 ? 'MAPPING' : 'GUIDED';
const stageCard = (title, complete, current, detail) => `<article class="stage ${complete ? 'done' : ''} ${current ? 'current' : ''}"><i></i><strong>${title}</strong><small>${complete ? 'Evidence earned' : current ? detail : 'Ahead'}</small></article>`;

Seder.api(`/api/learners/${learnerId}`).then((response) => response.ok ? response.json() : null).then((learner) => {
  if (!learner) throw new Error('Your learning record is unavailable.');
  $('#xp').textContent = `${learner.xp || 0} XP`;
  const artifacts = learner.artifacts || {}, events = learner.events || [], reviews = learner.reviewQueue || [];
  const stateFor = (tractate) => {
    const map = (artifacts.source_map || []).includes(tractate.id);
    const second = (artifacts.second_source_explanation || []).includes(tractate.id);
    const transfer = (artifacts.transfer_explanation || []).includes(tractate.id);
    const retrievalSkill = `${tractate.id}-independent-map`;
    const scheduled = events.some((event) => event.type === 'retrieval_scheduled' && event.skillId === retrievalSkill);
    const due = reviews.some((review) => review.skillId === retrievalSkill && new Date(review.dueAt) <= new Date());
    const steps = [map, second, transfer, scheduled];
    const complete = steps.filter(Boolean).length;
    let next = { label: 'Start guided source', url: tractate.guided };
    if (tractate.cohort && !(map && second && transfer)) next = { label: map ? 'Continue source mastery' : 'Build a source map', url: tractate.deep };
    else if (map && !second) next = { label: 'Read the second source', url: tractate.deep };
    else if (second && !transfer) next = { label: 'Prove transfer', url: `flagship-transfer.html?tractate=${tractate.id}` };
    else if (transfer && due) next = { label: 'Complete due retrieval', url: 'review-calendar.html' };
    else if (transfer) next = { label: 'Open tractate mastery loop', url: `tractate-mastery.html?tractate=${tractate.id}` };
    return { map, second, transfer, scheduled, due, complete, next };
  };
  const records = tractates.map((tractate) => ({ tractate, state: stateFor(tractate) }));
  const mapped = records.filter(({ state }) => state.map).length;
  const transferred = records.filter(({ state }) => state.transfer).length;
  const due = records.filter(({ state }) => state.due).length;
  $('#summary').innerHTML = [['TRACTATES MAPPED', `${mapped} / ${tractates.length}`], ['TRANSFER DEMONSTRATED', `${transferred} / ${tractates.length}`], ['RETRIEVAL DUE', due]].map(([title, value]) => `<article><small>${title}</small><strong>${value}</strong></article>`).join('');
  $('#tractates').innerHTML = records.map(({ tractate, state }, index) => {
    const currentIndex = !state.map ? 0 : !state.second ? 1 : !state.transfer ? 2 : state.due ? 3 : -1;
    const opening = index === 0 ? '<section class="cohort"><header><small>FOUNDATIONS · PRAYER AND READING</small><strong>Build the first reading repertoire</strong></header>' : index === 3 ? '</section><section class="cohort"><header><small>STRUCTURES · REASONS · DISPUTES</small><strong>Read the architecture of a sugya</strong></header>' : index === 6 ? '</section><section class="cohort"><header><small>FLAGSHIP WORLDS OF GEMARA</small><strong>Carry the repertoire across legal worlds</strong></header>' : '';
    const closing = index === records.length - 1 ? '</section>' : '';
    return `${opening}<article class="tractate"><div class="tractate-head"><div><h2>${tractate.title}</h2><p>${tractate.focus}</p></div><span class="level">${labelFor(state.complete)}</span></div><div class="stages">${stageCard('First source mapped', state.map, currentIndex === 0, 'Map the visible opening source.')}${stageCard('Second source explained', state.second, currentIndex === 1, 'Compare the deeper argument.')}${stageCard('Transfer demonstrated', state.transfer, currentIndex === 2, 'Read the move on a new page.')}${stageCard('Retrieval scheduled', state.scheduled, currentIndex === 3, state.due ? 'A short retrieval is due now.' : 'Schedule follows source-map completion.')}${stageCard('Durable next step', state.transfer && !state.due, false, 'Continue the mastery loop.')}</div><a class="next" href="${state.next.url}">${state.next.label} →</a></article>${closing}`;
  }).join('');
}).catch((error) => { $('#summary').innerHTML = `<p>${error.message}</p>`; });
