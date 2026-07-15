const learnerId = Seder.currentLearnerId();
const cohorts = [
  { title: 'FOUNDATIONS · PRAYER AND READING', promise: 'Build the first reading repertoire', tractates: [
    { id: 'berakhot', title: 'Berakhot', focus: 'Question, context, and textual time', guided: 'berakhot-mastery.html', deep: 'cohort-source-mastery.html?tractate=berakhot' },
    { id: 'shabbat', title: 'Shabbat', focus: 'Cases, domains, and distinctions', guided: 'shabbat-arc.html', deep: 'cohort-source-mastery.html?tractate=shabbat' },
    { id: 'yoma', title: 'Yoma', focus: 'Preparation, risk, and proof text', guided: 'yoma-arc.html', deep: 'cohort-source-mastery.html?tractate=yoma' }
  ] },
  { title: 'STRUCTURES · REASONS · DISPUTES', promise: 'Read the architecture of a sugya', tractates: [
    { id: 'ketubot', title: 'Ketubot', focus: 'Schedule, institution, and competing concerns', guided: 'ketubot-arc.html', deep: 'cohort-source-mastery.html?tractate=ketubot' },
    { id: 'chullin', title: 'Chullin', focus: 'Rule, exception, and condition', guided: 'chullin-arc.html', deep: 'cohort-source-mastery.html?tractate=chullin' },
    { id: 'niddah', title: 'Niddah', focus: 'Three positions held carefully', guided: 'niddah-arc.html', deep: 'cohort-source-mastery.html?tractate=niddah' }
  ] },
  { title: 'FLAGSHIP WORLDS OF GEMARA', promise: 'Carry the repertoire across legal worlds', tractates: [
    { id: 'pesachim', title: 'Pesachim', focus: 'Time, action, and contested words', guided: 'pesachim-arc.html', deep: 'pesachim-deepening.html' },
    { id: 'eruvin', title: 'Eruvin', focus: 'Measure, formulation, and purpose', guided: 'eruvin-arc.html', deep: 'eruvin-deepening.html' },
    { id: 'sukkah', title: 'Sukkah', focus: 'Validity, reason, and competing accounts', guided: 'sukkah-arc.html', deep: 'sukkah-deepening.html' },
    { id: 'bava-metzia', title: 'Bava Metzia', focus: 'Claims, procedure, and evidence', guided: 'bava-metzia-arc.html', deep: 'bava-metzia-deepening.html' },
    { id: 'bava-kamma', title: 'Bava Kamma', focus: 'Categories, distinction, and shared principle', guided: 'bava-kamma-arc.html', deep: 'bava-kamma-deepening.html' }
  ] }
];
const $ = (selector) => document.querySelector(selector);
const stageCard = (title, complete, current, detail) => `<article class="stage ${complete ? 'done' : ''} ${current ? 'current' : ''}"><i></i><strong>${title}</strong><small>${complete ? 'Evidence earned' : current ? detail : 'Ahead'}</small></article>`;
const labelFor = (count) => count >= 4 ? 'TRANSFER' : count >= 3 ? 'INDEPENDENT' : count >= 2 ? 'MAPPING' : 'GUIDED';

Seder.api(`/api/learners/${learnerId}`).then((response) => response.ok ? response.json() : null).then((learner) => {
  if (!learner) throw new Error('Your learning record is unavailable.');
  $('#xp').textContent = `${learner.xp || 0} XP`;
  const artifacts = learner.artifacts || {}, events = learner.events || [], reviews = learner.reviewQueue || [];
  const stateFor = (tractate) => {
    const map = (artifacts.source_map || []).includes(tractate.id);
    const second = (artifacts.second_source_explanation || []).includes(tractate.id);
    const transfer = (artifacts.transfer_explanation || []).includes(tractate.id);
    const connection = (artifacts.canon_connection || []).includes(tractate.id);
    const skill = `${tractate.id}-independent-map`;
    const scheduled = events.some((event) => event.type === 'retrieval_scheduled' && event.skillId === skill);
    const due = reviews.some((review) => review.skillId === skill && new Date(review.dueAt) <= new Date());
    const complete = [map, second, transfer, connection, scheduled].filter(Boolean).length;
    let next = { label: 'Start guided source', url: tractate.guided };
    if (!map || !second || !transfer) next = { label: map ? 'Continue source mastery' : 'Build a source map', url: tractate.deep };
    else if (!connection) next = { label: 'Earn the Canon Connection', url: `canon-connection.html?tractate=${tractate.id}` };
    else if (due) next = { label: 'Complete due retrieval', url: 'review-calendar.html' };
    else next = { label: 'Open tractate mastery loop', url: `tractate-mastery.html?tractate=${tractate.id}` };
    return { map, second, transfer, connection, scheduled, due, complete, next };
  };
  const records = cohorts.map((cohort) => ({ ...cohort, records: cohort.tractates.map((tractate) => ({ tractate, state: stateFor(tractate) })) }));
  const all = records.flatMap((cohort) => cohort.records), mapped = all.filter(({ state }) => state.map).length, transferred = all.filter(({ state }) => state.transfer).length, due = all.filter(({ state }) => state.due).length;
  $('#summary').innerHTML = [['TRACTATES MAPPED', `${mapped} / ${all.length}`], ['TRANSFER DEMONSTRATED', `${transferred} / ${all.length}`], ['RETRIEVAL DUE', due]].map(([title, value]) => `<article><small>${title}</small><strong>${value}</strong></article>`).join('');
  const finishedBefore = (cohortIndex) => records.slice(0, cohortIndex).every((cohort) => cohort.records.every(({ state }) => state.connection));
  let recommended = null;
  records.forEach((cohort, cohortIndex) => cohort.records.forEach((record, index) => {
    record.available = finishedBefore(cohortIndex) && (index === 0 || cohort.records[index - 1].state.connection);
    if (!recommended && record.available && !record.state.connection) recommended = { record, cohort, cohortIndex };
  }));
  if (!recommended) recommended = { record: all.find(({ state }) => state.due) || all.at(-1), cohort: records.at(-1), cohortIndex: records.length - 1 };
  const { record: nextRecord, cohort: nextCohort } = recommended;
  $('#recommendation').innerHTML = `<p class="label">YOUR RECOMMENDED NEXT MOVE</p><h2>${nextRecord.tractate.title}: ${nextRecord.state.next.label}</h2><p>You are building <strong>${nextRecord.tractate.focus.toLowerCase()}</strong>. ${nextRecord.state.map ? 'You have begun this source; now make the next piece of evidence durable.' : `This is next because ${nextCohort.promise.toLowerCase()}.`}</p><a href="${nextRecord.state.next.url}">Continue this move →</a>`;
  $('#tractates').innerHTML = records.map((cohort, cohortIndex) => {
    const cohortOpen = finishedBefore(cohortIndex);
    const earned = cohort.records.filter(({ state }) => state.connection).length;
    return `<section class="cohort ${cohortOpen ? '' : 'locked-cohort'}"><header><div><small>${cohort.title}</small><p>${cohort.promise}</p></div><strong>${earned} / ${cohort.records.length} canon links</strong></header>${cohort.records.map(({ tractate, state }, index) => {
      const available = finishedBefore(cohortIndex) && (index === 0 || cohort.records[index - 1].state.connection);
      const locked = !available && !state.connection;
      const currentIndex = !state.map ? 0 : !state.second ? 1 : !state.transfer ? 2 : !state.connection ? 3 : state.due ? 4 : -1;
      const gate = locked ? `Complete ${index ? cohort.records[index - 1].tractate.title : records[cohortIndex - 1].title} and its Canon Connection first to open this move.` : state.connection ? 'Gemara and wider-canon evidence earned; keep it durable through retrieval.' : state.transfer ? 'Bring this reading habit into one connected canon source.' : 'This is available now.';
      return `<article class="tractate ${locked ? 'locked' : ''}"><div class="tractate-head"><div><h2>${tractate.title}</h2><p>${tractate.focus}</p></div><span class="level">${locked ? 'UPCOMING' : labelFor(state.complete)}</span></div><p class="gate">${gate}</p><div class="stages">${stageCard('First source mapped', state.map, !locked && currentIndex === 0, 'Map the visible opening source.')}${stageCard('Second source explained', state.second, !locked && currentIndex === 1, 'Compare the deeper argument.')}${stageCard('Transfer demonstrated', state.transfer, !locked && currentIndex === 2, 'Read the move on a new page.')}${stageCard('Canon link demonstrated', state.connection, !locked && currentIndex === 3, 'Carry the Gemara habit into a connected source.')}${stageCard('Retrieval scheduled', state.scheduled, !locked && currentIndex === 4, state.due ? 'A short retrieval is due now.' : 'Schedule follows source-map completion.')}${stageCard('Durable next step', state.connection && !state.due, false, 'Continue the mastery loop.')}</div>${locked ? '<span class="next disabled">Upcoming after evidence →</span>' : `<a class="next" href="${state.next.url}">${state.next.label} →</a>`}</article>`;
    }).join('')}</section>`;
  }).join('');
}).catch((error) => { $('#recommendation').innerHTML = `<p>${error.message}</p>`; });
