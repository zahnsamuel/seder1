const learnerId = Seder.currentLearnerId();
const $ = (selector) => document.querySelector(selector);
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

Promise.all([
  Seder.api(`/api/learners/${learnerId}`).then((response) => response.json()),
  fetch('/api/curriculum/repair-router').then((response) => response.json()),
  fetch('/api/curriculum/canon-six-session-courses').then((response) => response.json())
]).then(([learner, router, courses]) => {
  const struggles = learner.struggles || {};
  const category = router.categories.map((item) => ({ ...item, score: item.skills.reduce((total, skill) => total + (struggles[skill] || 0), 0) })).sort((a, b) => b.score - a.score)[0];
  const vocabDue = (learner.reviewQueue || []).find((item) => String(item.skillId || '').startsWith('vocab-'));
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
  const pendingDeepenings = deepenings.filter(([firstStage, secondStage]) => doneStages.has(firstStage) && !doneStages.has(secondStage));
  const deepening = pendingDeepenings.length && day % 3 === 2 ? pendingDeepenings[day % pendingDeepenings.length] : null;

  let recommendation = category?.score > 0 ? category : vocabDue ? { title: 'Retrieve a source word', url: 'canon-vocabulary.html', reason: 'A word you met before is due for a brief retrieval. Recall keeps source reading available.' } : active ? { title: `Resume ${active.course.title}`, url: `canon-course.html?course=${active.course.id}&session=${active.first}`, reason: `Continue at session ${active.first + 1} of ${active.course.sessions.length}; your earlier source work is saved.` } : readyCapstone ? { title: `Capstone: ${readyCapstone.course.title}`, url: `canon-capstone.html?course=${readyCapstone.course.id}`, reason: 'You completed the source sequence. Now make an independent connection.' } : capstoned && transferDone < 5 ? { title: 'Read an unfamiliar source', url: 'independent-reading.html', reason: 'You have completed a course connection. Now prove that your reading habits transfer to a new text.' } : deepening ? { title: deepening[2], url: deepening[3], reason: 'You finished this subject’s foundation, and its second unit is waiting. Deepen it today — the Gemara spine returns tomorrow.' } : { title: gemaraTitle, url: `tractate-mastery.html?tractate=${tractate}`, reason: 'Today’s core source work is a Gemara move. The wider canon will return in the next daily cycle.' };

  $('#title').textContent = recommendation.title;
  $('#reason').textContent = recommendation.reason;
  $('#primary').href = recommendation.url;
  $('#sequence').innerHTML = [['1', 'Recall', 'canon-vocabulary.html', 'Retrieve a source word.'], ['2', 'Study', recommendation.url, 'Follow the next adaptive step.'], ['3', 'Transfer', 'independent-reading.html', 'Read a source you have not rehearsed.'], ['4', 'Connect', 'course-dashboard.html', 'See course, bridge, and capstone evidence.']].map(([number, title, url, copy]) => `<article><small>${number}</small><h2>${title}</h2><p>${copy}</p><a href="${url}">Open &rarr;</a></article>`).join('');
}).catch(() => { $('#title').textContent = 'Begin today\'s Canon Studio'; $('#primary').href = 'daily-canon.html'; });
