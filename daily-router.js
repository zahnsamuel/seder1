const learnerId = Seder.currentLearnerId();
const foundationSkill = new URLSearchParams(location.search).get('foundationSkill');
const $ = (selector) => document.querySelector(selector);
function renderSessionPlan(primaryUrl, needsPlacement = false, isFoundation = false, minutes = 20) {
  const lapsed = Boolean(window.__academyLapsed);
  const frontier = window.__academyFrontier;
  const steps = needsPlacement
    ? [['1', '5 min', 'Placement', 'Find the right starting point before new material.', 'diagnostic.html']]
    : lapsed
      ? [['1', '3 min', 'Welcome back', 'One small retrieval restarts your rhythm. No catch-up required.', 'daily-recall.html']]
    : isFoundation
      ? [['1', '3 min', 'Retrieve', 'Bring back the last source-reading move.', 'daily-recall.html'], ['2', '7 min', 'Encounter', 'Read one source in its own setting.', primaryUrl], ['3', '5 min', 'Demonstrate', 'Show the move with a guided choice.', primaryUrl], ['4', '3 min', 'Transfer', 'Carry the move into a second genre.', 'independent-reading.html'], ['5', '2 min', 'Orient', 'See what changed and choose the next move.', primaryUrl]]
      : [['1', '5 min', 'Recall', 'Bring back source words and Gemara moves due today.', 'daily-recall.html'], ['2', '15 min', 'Study', 'Work through the selected source with the Daf or source text visible.', primaryUrl], ['3', '5 min', 'Transfer', 'Use the reading habit on a fresh question or passage.', 'independent-reading.html'], ['4', 'Optional', 'Connect', 'See how this move returns to the wider Jewish canon.', 'course-dashboard.html']];
  if (!needsPlacement && !lapsed && frontier?.skill && frontier.url) {
    steps.push(['5', '5 min', 'Frontier', `Practice ${frontier.skill.title} in ${frontier.context || 'a new source'}.`, frontier.url]);
  }
  const target = $('#session-steps');
  if (!target) return;
  // Spatial path (jla-system.css): the session reads as a climbable sequence with
  // one clear "current" node rather than a flat list of cards. Same steps, same URLs.
  const currentIndex = needsPlacement ? 0 : (steps.length > 1 ? 1 : 0);
  target.innerHTML = `<ol class="jla-path">` + steps.map(([number, time, title, copy, url], index) => {
    const state = index === currentIndex ? 'is-current' : 'is-upcoming';
    return `<li class="jla-node ${state}"><span class="marker">${number}</span><span class="kicker">${time}</span><h3>${title}</h3><p>${copy}</p><a class="open" href="${url}">Open →</a></li>`;
  }).join('') + `</ol>`;
  const duration = $('#session-duration');
  if (duration) duration.textContent = isFoundation ? '20' : String(minutes);
}
const gemaraCycle = [
  ['berakhot', 'Berakhot: begin to read the sugya'],
  ['shabbat', 'Shabbat: map a legal case'],
  ['pesachim', 'Pesachim: read a word-question closely'],
  ['eruvin', 'Eruvin: connect a measure to its reason'],
  ['sukkah', 'Sukkah: read a ruling and its source'],
  ['bava-metzia', 'Bava Metzia: map competing claims'],
  ['bava-kamma', 'Bava Kamma: distinguish categories of damage'],
  ['ketubot', 'Ketubot: trace a schedule to its reason'],
  ['chullin', 'Chullin: read a rule through its exception'],
  ['niddah', 'Niddah: hold a three-way dispute carefully']
];
// Daily Gemara recommendations use the same source workspace as an earned tractate arc.
// The older tractate-mastery dashboard remains a reference surface, not the next move.
const gemaraWorkbenchUrl = {
  berakhot: 'daf-workbench.html?tractate=berakhot',
  shabbat: 'flagship-daf-workbench.html?tractate=shabbat',
  pesachim: 'flagship-daf-workbench.html?tractate=pesachim',
  eruvin: 'flagship-daf-workbench.html?tractate=eruvin',
  sukkah: 'flagship-daf-workbench.html?tractate=sukkah',
  'bava-metzia': 'flagship-daf-workbench.html?tractate=bava-metzia',
  'bava-kamma': 'flagship-daf-workbench.html?tractate=bava-kamma',
  ketubot: 'flagship-daf-workbench.html?tractate=ketubot',
  chullin: 'flagship-daf-workbench.html?tractate=chullin',
  niddah: 'flagship-daf-workbench.html?tractate=niddah'
};
// Second-foundation deepenings: [first arc stage, second unit stage, title, url].
// When a learner has finished a subject's first arc but not its second unit, the
// router offers the deepening every third day; the Gemara spine keeps the other days.
const deepenings = [
  ['halakha-blessings-arc', 'halakha-honor-parents-arc', 'Halakha: trace honoring parents from two Torah verbs to Rambam', 'halakha-honor-parents.html'],
  ['chumash-shema-arc', 'chumash-akeidah-arc', 'Chumash: follow one word through the Akeidah', 'chumash-akeidah.html'],
  ['tefillah-siddur-arc', 'tefillah-kaddish-arc', 'Tefillah: read the Kaddish in depth', 'tefillah-kaddish.html'],
  ['mussar-humility-arc', 'mussar-truth-arc', 'Mussar: trace truth through a real halakhic dispute', 'mussar-truth.html'],
  ['chassidus-joy-awe-arc', 'chassidus-ahavat-yisrael-arc', 'Chassidus: read love of a fellow as a gateway', 'chassidus-ahavat-yisrael.html'],
  ['history-community-arc', 'history-yavneh-arc', 'History: work your questions on the year 70 and Yavneh', 'history-yavneh.html'],
  ['widerworld-law-reason-arc', 'widerworld-encounter-arc', 'Wider World: read the tradition’s own charters of encounter', 'widerworld-encounter.html'],
  ['jewish-thought-question-atlas', 'jewish-thought-suffering', 'Jewish Thought: hold three voices on suffering', 'thought-suffering.html'],
  ['halakha-honor-parents-arc', 'halakha-machloket-arc', 'Halakha: read the dispute both sides won', 'halakha-machloket.html'],
  ['halakha-machloket-arc', 'halakha-chanukah-arc', 'Halakha: follow a Chanukah machloket through two reasons', 'halakha-chanukah.html'],
  ['tefillah-kaddish-arc', 'tefillah-amidah-arc', 'Tefillah: enter the Amidah, arranged at Yavneh', 'tefillah-amidah.html'],
  ['mussar-truth-arc', 'mussar-anger-arc', 'Mussar: the trait the middle path refuses to balance', 'mussar-anger.html'],
  ['chumash-akeidah-arc', 'chumash-tehillim-arc', 'Chumash: read the line that says it twice', 'chumash-tehillim.html'],
  ['history-yavneh-arc', 'history-geniza-arc', 'History: the archive nobody meant to keep', 'history-geniza.html'],
  ['chassidus-ahavat-yisrael-arc', 'chassidus-simcha-arc', 'Chassidus: joy as a discipline, not a mood', 'chassidus-simcha.html'],
  ['widerworld-encounter-arc', 'widerworld-mean-arc', 'Wider World: Rambam beside Aristotle, compared honestly', 'widerworld-mean.html']
];
// Foundation Year is an earned three-term arc. It takes priority over rotation once
// placement is complete, so every entry point gives the learner the same next move.
const foundationTerms = [
  { stage: 'foundation-capstone', title: 'Foundation Year · Term I: build the reading repertoire', url: 'integrated-path.html', reason: 'Begin with the connected source sequence that builds case mapping, question reading, evidence, and reception before its capstone.' },
  { stage: 'term-two-capstone', title: 'Foundation Year · Term II: reason, scope, and responsibility', url: 'second-foundation-term.html', reason: 'Your first-term checkpoint is earned. Next, trace reasons, exceptions, and institutional responsibility through new sources.' },
  { stage: 'second-foundation-synthesis', title: 'Foundation Year · Term III: disagreement and synthesis', url: 'term-three-journey.html', reason: 'Your second-term checkpoint is earned. Now preserve distinct voices, compare carefully, and carry the habit into synthesis.' }
];
const gemaraYearTerms = [
  { title: 'Gemara Year · Term I: time, space, and practice', reason: 'Continue the first post-Foundation term by carrying your reading repertoire through concrete cases of domain, measure, time, validity, and source-grounded preparation.', steps: [['shabbat-tractate-arc', 'Shabbat: map a legal case', 'shabbat-arc.html'], ['eruvin-tractate-arc', 'Eruvin: boundary and measure', 'eruvin-arc.html'], ['pesachim-tractate-arc', 'Pesachim: word, time, and source', 'pesachim-arc.html'], ['sukkah-tractate-arc', 'Sukkah: validity and purpose', 'sukkah-arc.html'], ['yoma-tractate-arc', 'Yoma: procedure, limit, and proof', 'yoma-arc.html'], ['gemara-foundations-checkpoint', 'Gemara Foundations checkpoint', 'gemara-foundations.html']] },
  { title: 'Gemara Year · Term II: claims, responsibility, and institutions', reason: 'Continue the civil-reasoning term: map claims, identify categories of responsibility, and read institutions through their stated reasons.', steps: [['bava-metzia-tractate-arc', 'Bava Metzia: claims and evidence', 'bava-metzia-arc.html'], ['bava-kamma-tractate-arc', 'Bava Kamma: categories of damage', 'bava-kamma-arc.html'], ['ketubot-tractate-arc', 'Ketubot: schedule and reason', 'ketubot-arc.html'], ['sanhedrin-tractate-arc', 'Sanhedrin: category and specification', 'sanhedrin-arc.html'], ['civil-reasoning-checkpoint', 'Civil Reasoning checkpoint', 'civil-reasoning.html']] },
  { title: 'Gemara Year · Term III: rule and disagreement', reason: 'Trace a rule through its exceptions and preserve disagreement before taking those reading habits into a new legal field.', steps: [['chullin-tractate-arc', 'Chullin: rule and exception', 'chullin-arc.html'], ['niddah-tractate-arc', 'Niddah: three positions', 'niddah-arc.html']] },
  { title: 'Gemara Year · Term IV: speech, status, and transfer', reason: 'Read how language creates a legal category, how a default gives it shape, and how a reading move transfers across tractates without erasing their differences.', steps: [['moed-katan-tractate-arc', 'Moed Katan: rule and bounded exception', 'moed-katan-arc.html'], ['nedarim-tractate-arc', 'Nedarim: legal speech and function', 'nedarim-arc.html'], ['nazir-tractate-arc', 'Nazir: carry the language move across', 'nazir-arc.html'], ['gemara-year-synthesis', 'Gemara Year synthesis', 'gemara-year-synthesis.html']] }
];
// The full-catalog continuation keeps daily recommendations aligned with the
// expanded sequence after the original four terms are earned.
gemaraYearTerms.push({ title: 'Gemara Year · Full Shas continuation', reason: 'Carry the same reading repertoire through the remaining tractates, one source arc at a time.', steps: [
  ['rosh-hashanah-tractate-arc', 'Rosh Hashanah: calendar and public record', 'rosh-hashanah-arc.html'], ['megillah-tractate-arc', 'Megillah: public schedule and accommodation', 'megillah-arc.html'], ['taanit-tractate-arc', 'Taanit: timing dispute and distinction', 'taanit-arc.html'], ['chagigah-tractate-arc', 'Chagigah: rule, exception, and historical context', 'chagigah-arc.html'], ['beitzah-tractate-arc', 'Beitzah: category and reason', 'beitzah-arc.html'], ['bava-batra-tractate-arc', 'Bava Batra: shared space and evidence', 'bava-batra-arc.html'], ['makkot-tractate-arc', 'Makkot: testimony and consequence', 'makkot-arc.html'], ['shevuot-tractate-arc', 'Shevuot: counted liability and intention', 'shevuot-arc.html'], ['zevachim-tractate-arc', 'Zevachim: validity and obligation', 'zevachim-arc.html'], ['menachot-tractate-arc', 'Menachot: parallel, exception, and transfer', 'menachot-arc.html'], ['bekhorot-tractate-arc', 'Bekhorot: status, ownership, and redemption', 'bekhorot-arc.html'], ['arakhin-tractate-arc', 'Arakhin: fixed measures and valuation', 'arakhin-arc.html'], ['temurah-tractate-arc', 'Temurah: substitution and consequence', 'temurah-arc.html'], ['keritot-tractate-arc', 'Keritot: inadvertence and atonement', 'keritot-arc.html'], ['meilah-tractate-arc', 'Meilah: misuse and restitution', 'meilah-arc.html'], ['tamid-tractate-arc', 'Tamid: ordered daily service', 'tamid-arc.html'], ['avodah-zarah-tractate-arc', 'Avodah Zarah: commerce and context', 'avodah-zarah-arc.html'], ['horayot-tractate-arc', 'Horayot: authority and repair', 'horayot-arc.html'], ['yevamot-tractate-arc', 'Yevamot: obligation and exemption', 'yevamot-arc.html'], ['sotah-tractate-arc', 'Sotah: testimony and uncertainty', 'sotah-arc.html'], ['gittin-tractate-arc', 'Gittin: document and agency', 'gittin-arc.html'], ['kiddushin-tractate-arc', 'Kiddushin: status and consent', 'kiddushin-arc.html']
] });
// Moed opens only after the earned Gemara Year sequence. Yoma is intentionally
// included in the Year, so its completed arc also counts as the first chapter here.
const moedExpansionChapters = [
  ['yoma-tractate-arc', 'Yoma: procedure, limit, and proof', 'yoma-arc.html'],
  ['rosh-hashanah-tractate-arc', 'Rosh Hashanah: calendar and public record', 'rosh-hashanah-arc.html'],
  ['megillah-tractate-arc', 'Megillah: public schedule and accommodation', 'megillah-arc.html'],
  ['taanit-tractate-arc', 'Taanit: timing dispute and distinction', 'taanit-arc.html'],
  ['chagigah-tractate-arc', 'Chagigah: rule, exception, and historical context', 'chagigah-arc.html'],
  ['moed-expansion-synthesis', 'Moed Expansion synthesis', 'moed-expansion-synthesis.html']
];
function nextGemaraYearMove(doneStages) {
  for (const term of gemaraYearTerms) {
    const step = term.steps.find(([stage]) => !doneStages.has(stage));
    if (step) return { title: `${term.title} · ${step[1]}`, url: step[2], reason: term.reason };
  }
  return null;
}
function nextMoedExpansionMove(doneStages) {
  const gemaraYearComplete = gemaraYearTerms.every((term) => term.steps.every(([stage]) => doneStages.has(stage)));
  if (!gemaraYearComplete) return null;
  const chapter = moedExpansionChapters.find(([stage]) => !doneStages.has(stage));
  if (!chapter) return null;
  return {
    title: `Moed Expansion · ${chapter[1]}`,
    url: chapter[2],
    reason: 'Your Gemara Year is complete. Extend the same source-reading habits through the calendar, public reading, and communal response.'
  };
}

Promise.all([
  Seder.api(`/api/learners/${learnerId}`).then((response) => response.json()),
  fetch('/api/curriculum/repair-router').then((response) => response.json()),
  fetch('/api/curriculum/canon-six-session-courses').then((response) => response.json()),
  fetch(`/api/learners/${learnerId}/graph-practice`).then((response) => response.ok ? response.json() : { practice: null }).catch(() => ({ practice: null }))
]).then(([learner, router, courses, graph]) => {
  const struggles = learner.struggles || {};
  const category = router.categories.map((item) => ({ ...item, score: item.skills.reduce((total, skill) => total + (struggles[skill] || 0), 0) })).sort((a, b) => b.score - a.score)[0];
  const vocabDue = (learner.reviewQueue || []).find((item) => String(item.skillId || '').startsWith('vocab-'));
  const personalVocabulary = JSON.parse(localStorage.getItem(`seder-personal-vocabulary-${learnerId}`) || '[]');
  const personalDue = personalVocabulary.some((item) => new Date(item.dueAt || item.at || 0) <= Date.now());
  const progress = courses.courses.map((course) => {
    const done = new Set(JSON.parse(localStorage.getItem(`seder-course-${course.id}-${learnerId}`) || '[]'));
    return { course, done, first: [...Array(course.sessions.length).keys()].find((item) => !done.has(item)), capstone: localStorage.getItem(`seder-capstone-${course.id}-${learnerId}`) === 'complete' };
  });
  const active = progress.find((item) => item.done.size > 0 && item.done.size < item.course.sessions.length);
  const readyCapstone = progress.find((item) => item.done.size === item.course.sessions.length && !item.capstone);
  const capstoned = progress.filter((item) => item.capstone).length;
  const transferDone = JSON.parse(localStorage.getItem(`seder-independent-reading-${learnerId}`) || '[]').length;
  const day = Math.floor(Date.now() / 86400000);
  const [tractate, gemaraTitle] = gemaraCycle[day % gemaraCycle.length];
  const doneStages = new Set(learner.completedStages || []);
  const needsPlacement = !learner.placement;
  const pendingDeepenings = deepenings.filter(([firstStage, secondStage]) => doneStages.has(firstStage) && !doneStages.has(secondStage));
  const deepening = pendingDeepenings.length && day % 3 === 2 ? pendingDeepenings[day % pendingDeepenings.length] : null;
  // A learner with no completed stages is at the very start: route them to their
  // journey's current week, not the rotating tractate cycle (which could land a
  // day-one learner in the middle of Shas).
  const brandNew = doneStages.size === 0;
  const foundationTerm = foundationTerms.find((term) => !doneStages.has(term.stage));
  const gemaraYearMove = foundationTerm ? null : nextGemaraYearMove(doneStages);
  const moedExpansionMove = foundationTerm || gemaraYearMove ? null : nextMoedExpansionMove(doneStages);

  let recommendation = category?.score > 0 ? category : personalDue || vocabDue ? { title: 'Complete your daily recall queue', url: 'daily-recall.html', reason: 'A saved source word or Gemara move is due now. Bring it back before beginning new material.' } : active ? { title: `Resume ${active.course.title}`, url: `canon-course.html?course=${active.course.id}&session=${active.first}`, reason: `Continue at session ${active.first + 1} of ${active.course.sessions.length}; your earlier source work is saved.` } : readyCapstone ? { title: `Capstone: ${readyCapstone.course.title}`, url: `canon-capstone.html?course=${readyCapstone.course.id}`, reason: 'You completed the source sequence. Now make an independent connection.' } : capstoned && transferDone < 5 ? { title: 'Read an unfamiliar source', url: 'independent-reading.html', reason: 'You have completed a course connection. Now prove that your reading habits transfer to a new text.' } : brandNew ? { title: 'Continue your first week', url: 'integrated-path.html', reason: 'You are at the start of the eight-week journey. Today’s work is your current week — the wider rotation begins once your first stage is complete.' } : deepening ? { title: deepening[2], url: deepening[3], reason: 'You finished this subject’s foundation, and its second unit is waiting. Deepen it today — the Gemara spine returns tomorrow.' } : { title: gemaraTitle, url: `tractate-mastery.html?tractate=${tractate}`, reason: 'Today’s core source work is a Gemara move. The wider canon will return in the next daily cycle.' };

  if (!category?.score && !(personalDue || vocabDue) && (foundationTerm || gemaraYearMove || moedExpansionMove)) recommendation = foundationTerm || gemaraYearMove || moedExpansionMove;
  if (recommendation.url === `tractate-mastery.html?tractate=${tractate}`) recommendation.url = gemaraWorkbenchUrl[tractate];
  if (needsPlacement) recommendation = { title: 'Find your starting point', url: 'diagnostic.html', reason: 'Begin with a short adaptive placement. A handful of questions pin where you are and set a review rhythm, without assigning a permanent level.' };
  const requestedFoundation = !needsPlacement && foundationSkill ? foundationSkill : null;
  if (requestedFoundation) {
    recommendation = { title: 'Academy Foundation · one focused skill', url: `academy-session.html?skill=${encodeURIComponent(requestedFoundation)}`, reason: 'A short, source-based session builds one transferable learning move at a time.', foundation: true, skillId: requestedFoundation };
  }
  const rhythmMinutes = { daily: 20, 'three-times-weekly': 20, weekly: 30 }[learner.rhythm] || 20;
  const daysSinceStudy = learner.lastStudyDate ? Math.floor((Date.now() - new Date(learner.lastStudyDate).getTime()) / 86400000) : null;
  const recoveryWindow = learner.rhythm === 'weekly' ? 8 : learner.rhythm === 'three-times-weekly' ? 4 : 3;
  window.__academyLapsed = daysSinceStudy !== null && daysSinceStudy >= recoveryWindow;
  window.__academyFrontier = graph.practice || null;
  renderSessionPlan(recommendation.url, needsPlacement, Boolean(recommendation.foundation), rhythmMinutes);
  const rhythmLabels = { daily: '20 minutes daily', 'three-times-weekly': '20 minutes, three times a week', weekly: '30 minutes weekly' };
  const rhythmLabel = $('#rhythm-label');
  const rhythmCopy = $('#rhythm-copy');
  if (rhythmLabel) rhythmLabel.textContent = `${rhythmLabels[learner.rhythm] || '20 minutes daily'} · ${learner.dailyStreak || 0} day streak`;
  if (rhythmCopy) {
    const recoveryWindow = learner.rhythm === 'weekly' ? 8 : learner.rhythm === 'three-times-weekly' ? 4 : 2;
    rhythmCopy.textContent = daysSinceStudy !== null && daysSinceStudy >= recoveryWindow
      ? 'You have room to return. One small session today is enough to restart the rhythm.'
      : 'Keep the next move small and let consistency build the path.';
  }
  // The daily page was simplified to the hero (one clear next step) + the session plan; the
  // mastery-status, cross-canon, and 5-step sequence dashboards were removed (mentor reset). The
  // hero + session plan are populated below; the removed sections are no longer referenced.
  $('#title').textContent = recommendation.title;
  $('#reason').textContent = recommendation.reason;
  $('#primary').href = recommendation.url;
}).catch(() => { $('#title').textContent = 'Begin today\'s Canon Studio'; $('#primary').href = 'daily-canon.html'; });
