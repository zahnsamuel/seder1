const learnerId = Seder.currentLearnerId();
const $ = (selector) => document.querySelector(selector);
const plan = [
  ['Enter the page', 'language.html'], ['Hear a Torah source', 'source-reader.html?collection=shema'], ['Follow blessing language', 'source-reader.html?collection=blessings'], ['Gemara: question opens', 'tractate-mastery.html?tractate=berakhot'], ['Retrieve a source word', 'canon-vocabulary.html'], ['Prayer: name a function', 'canon-course.html?course=tefillah-six'], ['Freedom: identify a claim', 'canon-course.html?course=freedom-six'],
  ['Gemara: map people and domains', 'tractate-mastery.html?tractate=shabbat'], ['History: read context first', 'canon-course.html?course=history-six'], ['Weekly retrieval', 'weekly-review.html'], ['Covenant: memory and command', 'source-reader.html?collection=covenant'], ['Blessings: communal practice', 'canon-course.html?course=blessings-six'], ['Gemara: read a word-question', 'tractate-mastery.html?tractate=pesachim'], ['Retrieve and name a move', 'canon-vocabulary.html'], ['Responsibility: source and practice', 'canon-course.html?course=responsibility-six'],
  ['Unseen source check', 'independent-reading.html'], ['Gemara: measure and reason', 'tractate-mastery.html?tractate=eruvin'], ['Repair one uncertain move', 'mastery-loop.html'], ['Preserve a source reflection', 'sugya-notebook.html'], ['Weekly retrieval', 'weekly-review.html'], ['Gemara: validity and purpose', 'tractate-mastery.html?tractate=sukkah'], ['Freedom: revisit the tension', 'source-reader.html?collection=freedom'], ['Unseen source check', 'independent-reading.html'],
  ['Gemara: claims and evidence', 'tractate-mastery.html?tractate=bava-metzia'], ['Vocabulary retrieval', 'canon-vocabulary.html'], ['History and wider world', 'canon-course.html?course=history-six'], ['Gemara: categories and principle', 'tractate-mastery.html?tractate=bava-kamma'], ['Canon connection', 'course-dashboard.html'], ['Independent synthesis', 'independent-reading.html'], ['First-month review', 'weekly-review.html']
];
const phases = [
  { title: 'Enter the source', days: 'Days 1–7', copy: 'Decode the page, name voice and question, and meet Torah and prayer as living source forms.', link: 'language.html', milestone: 'I can orient to a Hebrew source and identify what kind of statement I am reading.', skills: ['hebrew-', 'mishnah-', 'berakhot-'] },
  { title: 'Read an argument', days: 'Days 8–15', copy: 'Map a Mishnah case, follow a word-question, retrieve vocabulary, and connect legal reading to responsibility.', link: 'tractate-mastery.html?tractate=shabbat', milestone: 'I can map a case, a question, and a response without treating translation as a substitute for reading.', skills: ['shabbat-', 'pesachim-', 'tefillah-', 'responsibility-'] },
  { title: 'Explain purpose', days: 'Days 16–23', copy: 'Use new sources to ask why a measure, practice, or claim matters—and begin to repair uncertainty yourself.', link: 'tractate-mastery.html?tractate=eruvin', milestone: 'I can connect a rule or form to the source-based purpose it serves.', skills: ['eruvin-', 'sukkah-', 'thought-', 'source-'] },
  { title: 'Transfer and synthesize', days: 'Days 24–30', copy: 'Read claims, categories, and history together, then use unfamiliar sources to show what has genuinely transferred.', link: 'tractate-mastery.html?tractate=bava-metzia', milestone: 'I can enter an unfamiliar source, state what I see, name uncertainty, and choose a responsible next step.', skills: ['bava-', 'independent-', 'history-', 'comparative-'] }
];
const openedKey = `seder-30-day-${learnerId}`;
const opened = new Set(JSON.parse(localStorage.getItem(openedKey) || '[]'));
function hasEvidence(learner, phase) { return Object.entries(learner.mastery || {}).filter(([id, score]) => score >= .34 && phase.skills.some((prefix) => id.startsWith(prefix))).length >= 2; }
function currentDay() { const first = [...Array(30).keys()].find((index) => !opened.has(index + 1)); return first === undefined ? 30 : first + 1; }
function openDay(day) { opened.add(day); localStorage.setItem(openedKey, JSON.stringify([...opened])); Seder.api(`/api/learners/${learnerId}/events`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'daily_program_opened', day }) }).catch(() => {}); }
function phaseForDay(day) { return phases[Math.min(3, Math.floor((day - 1) / 8))]; }
function whyNext(day) {
  if (day <= 7) return 'First learn how to enter a source: identify its language, voice, and kind of claim.';
  if (day <= 15) return 'Now the same orientation habits become an argument map: case, question, and response.';
  if (day <= 23) return 'This phase asks why a source matters and gives uncertainty a concrete repair path.';
  return 'The final week asks you to transfer the habits to unfamiliar sources and connect them across the canon.';
}
Seder.api(`/api/learners/${learnerId}`).then((response) => response.ok ? response.json() : null).then((learner) => {
  const day = currentDay(), [title, url] = plan[day - 1];
  $('#xp').textContent = `${learner?.xp || 0} XP`;
  $('#placement').innerHTML = learner?.placement?.completedAt ? '<b>Starting point saved.</b> Your source evidence—not this placement alone—will determine what becomes secure.' : '<b>Choose a starting point first.</b> A short placement lets Seder begin at your actual reading level. <a href="placement.html">Take placement →</a>';
  $('#todayCard').innerHTML = `<small>DAY ${day} OF 30 · ${opened.size} SESSIONS OPENED</small><h2>${title}</h2><p>${whyNext(day)}</p><p class="why-next"><b>Why this is next:</b> ${phaseForDay(day).milestone}</p><a id="openToday" href="${url}">Begin today’s source →</a>`;
  $('#openToday').addEventListener('click', () => openDay(day));
  $('#dayMap').innerHTML = plan.map(([sessionTitle, sessionUrl], index) => {
    const sessionDay = index + 1;
    const isOpened = opened.has(sessionDay);
    const isCurrent = sessionDay === day && !isOpened;
    const isAvailable = isOpened || isCurrent;
    const state = isOpened ? 'opened' : isCurrent ? 'current' : 'upcoming';
    const label = isOpened ? 'Resume' : isCurrent ? 'Begin' : 'Later';
    return `<li class="${state}"><span>DAY ${sessionDay}</span><strong>${sessionTitle}</strong><small>${phaseForDay(sessionDay).title}</small>${isAvailable ? `<a href="${sessionUrl}" data-day="${sessionDay}">${label} →</a>` : '<em>Unlocks in sequence</em>'}</li>`;
  }).join('');
  document.querySelectorAll('#dayMap a[data-day]').forEach((link) => link.addEventListener('click', () => openDay(Number(link.dataset.day))));
  $('#milestones').innerHTML = phases.map((phase, index) => `<article class="milestone ${hasEvidence(learner || {}, phase) ? 'ready' : ''}"><small>${hasEvidence(learner || {}, phase) ? 'EVIDENCE GROWING' : `MILESTONE ${index + 1}`}</small><h3>${phase.title}</h3><p>${phase.milestone}</p></article>`).join('');
  $('#phases').innerHTML = phases.map((phase) => `<article class="phase"><strong>${phase.days}</strong><div><h3>${phase.title}</h3><p>${phase.copy}</p></div><a href="${phase.link}">Open phase →</a></article>`).join('');
}).catch(() => { $('#placement').textContent = 'Your learner record is unavailable; you can still open the first source.'; });
