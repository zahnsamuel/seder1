const learnerId = Seder.currentLearnerId();
const $ = (selector) => document.querySelector(selector);
const domains = [
  { label: 'Gemara reasoning', prefixes: ['berakhot-', 'shabbat-', 'pesachim-', 'eruvin-', 'sukkah-', 'bava-', 'mishnah-', 'gemara-'], url: 'gemara-continuation.html', copy: 'Return to the reasoning spine: choose the next tractate move, read its case, and explain the textual evidence before reaching for a conclusion.' },
  { label: 'Hebrew and source orientation', prefixes: ['hebrew-', 'language-', 'source-signals-', 'source-'], url: 'language.html', copy: 'Strengthen the entry skills that make every later source more available: language signals, source form, and the first map of a line.' },
  { label: 'Canon connection', prefixes: ['history-', 'tefillah-', 'halakha-', 'chumash-', 'thought-', 'mussar-', 'chassidus-', 'widerworld-', 'comparative-', 'canonical-'], url: 'journey.html', copy: 'Carry a demonstrated reading move into another form of the canon, then return with a clearer question for the Gemara spine.' }
];
function scoreDomain(mastery, domain) { const values = Object.entries(mastery || {}).filter(([skill]) => domain.prefixes.some((prefix) => skill.startsWith(prefix))).map(([, value]) => Number(value) || 0); return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0; }
function percent(value) { return Math.round(Math.min(1, Math.max(0, value)) * 100); }
function render(learner) {
  const scored = domains.map((domain) => ({ ...domain, score: scoreDomain(learner?.mastery, domain) })).sort((a, b) => a.score - b.score), next = scored[0];
  $('#xp').textContent = `${learner?.xp || 0} XP`;
  $('#recommendation').innerHTML = `<h2 id="recommendation-title">Next: ${next.label}</h2><p>${next.copy}</p><p><b>${percent(next.score)}% demonstrated mastery in this evidence group.</b> This is a recommendation, not a verdict: it keeps your next cycle connected to what you have actually practiced.</p><a class="primary" href="${next.url}">Begin this next move -></a><a href="weekly-review.html">Retrieve before moving on -></a>`;
  const cycle = [['Deepen the recommended move', next.copy, next.url], ['Retrieve a prior source', 'Return to a due or uncertain move. Retrieval tells you what is genuinely durable and what needs repair.', 'weekly-review.html'], ['Connect across the canon', 'Use one familiar reading habit in a different source form, then state both the connection and the difference.', 'journey.html'], ['Keep a source record', 'Save an honest map of what the source establishes, what supports it, and what still needs a question.', 'study-record.html']];
  $('#cycle').innerHTML = cycle.map(([title, copy, url]) => `<li><div><h3>${title}</h3><p>${copy}</p></div><a href="${url}">Open -></a></li>`).join('');
}
Seder.api(`/api/learners/${learnerId}`).then((response) => response.ok ? response.json() : null).then(render).catch(() => render(null));
