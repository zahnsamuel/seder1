const checks = [
  { skill: 'hebrew-decoding', label: 'HEBREW DECODING', source: 'מֵאֵימָתַי', prompt: 'Which description best fits this word in the opening Mishnah?', answers: ['A question asking from when / at what time.', 'A final ruling about prayer.', 'A name of a person.'], correct: 0 },
  { skill: 'mishnah-orientation', label: 'MISHNAH ORIENTATION', source: 'שְׁנַיִם אוֹחֲזִין בְּטַלִּית', prompt: 'What situation does this Mishnah set up?', answers: ['Two people make competing claims over an object.', 'A person prepares for Shabbat.', 'A teacher tells a historical story.'], correct: 0 },
  // A learner's placement previously never produced any signal for the `translation`
  // competency (see recommendFor in server.mjs, whose very first post-placement gate
  // checks competencies.translation), so every new learner was routed into the
  // language-foundation step regardless of whether they already knew this vocabulary.
  // This check gives that gate a real, placement-based signal instead of a hardcoded 0.
  { skill: 'language-baseline', label: 'VOCABULARY BASELINE', source: 'תַּנְיָא', prompt: 'What does this single word typically introduce in a Gemara sugya?', answers: ['A cited teaching from outside the Mishnah.', 'A final vote among the Sages.', 'The name of a tractate.'], correct: 0 },
  { skill: 'gemara-moves', label: 'GEMARA MOVES', source: 'תַּנָּא הֵיכָא קָאֵי?', prompt: 'What is the Gemara asking the reader to investigate?', answers: ['What earlier context the Mishnah is responding to.', 'Which person should receive an object.', 'How to pronounce a Hebrew word.'], correct: 0 },
  { skill: 'proof-texts', label: 'SOURCE REASONING', source: 'דִּכְתִיב: בְּשָׁכְבְּךָ וּבְקוּמֶךָ', prompt: 'What role does the verse play in an argument?', answers: ['It supplies a textual reason or support for the claim.', 'It ends the discussion without explanation.', 'It introduces an unrelated narrative.'], correct: 0 },
  // The checks below were previously missing entirely: Halakha, Chumash, and Jewish
  // Thought had zero placement signal, so every learner started those tracks at 0
  // mastery regardless of experience (see recommendFor's source-literacy gate, which
  // already routes toward chumash-arc.html but had no placement data to act on).
  // Each skill id below matches a real skill already taught in that track's course
  // lesson (halakha-arc.js / chumash-arc.js / philosophy.js), so a strong placement
  // answer here seeds real, review-covered mastery rather than an orphaned score.
  { skill: 'halakha-torah-directive', label: 'HALAKHIC SOURCE CHAIN', source: 'וְאָכַלְתָּ וְשָׂבָעְתָּ וּבֵרַכְתָּ אֶת ה׳ אֱלֹהֶיךָ', prompt: 'What does this verse provide for later halakhic study?', answers: ['A Torah directive connecting eating, satisfaction, and blessing.', 'A complete list of every later blessing.', 'A final ruling for every practical situation.'], correct: 0 },
  { skill: 'tanakh-address-claim', label: 'CHUMASH CLOSE READING', source: 'שְׁמַע יִשְׂרָאֵל ה׳ אֱלֹהֵינוּ ה׳ אֶחָד', prompt: 'What is the first close-reading task?', answers: ['Identify who is addressed and what claim the verse makes.', 'Find a later halakhic code immediately.', 'Treat the verse as a list of disconnected words.'], correct: 0 },
  { skill: 'thought-identify-claim', label: 'JEWISH THOUGHT', source: 'וְיָדַעְתָּ הַיּוֹם וַהֲשֵׁבֹתָ אֶל לְבָבֶךָ', prompt: 'What is the central claim the verse asks a learner to take seriously?', answers: ['Knowledge of God must move from awareness into the heart.', 'All questions have already been answered.', 'Only outward action matters.'], correct: 0 }
];
checks.push(
  { skill: 'liturgical-function', label: 'TEFILLAH FUNCTION', source: 'מודים אנחנו לך', prompt: 'What is this line doing?', answers: ['Offering communal thanks.', 'Giving a court procedure.', 'Describing a historical period.'], correct: 0 },
  { skill: 'historical-context', label: 'HISTORY IN CONTEXT', source: 'ודרשו את שלום העיר', prompt: 'What should guide a first reading of this line?', answers: ['Who is addressed, where they are, and what situation the line addresses.', 'Which current opinion it automatically settles.', 'Only the number of Hebrew words.'], correct: 0 },
  { skill: 'comparative-reading', label: 'RESPONSIBLE COMPARISON', source: 'שאלה · הקשר · דמיון · הבדל', prompt: 'What makes a comparison between Jewish sources responsible?', answers: ['Name the shared question and preserve each source’s setting and difference.', 'Treat every source as making the same claim.', 'Use the source with the shortest translation only.'], correct: 0 },
  { skill: 'conceptual-application', label: 'ETHICAL READING', source: 'אל תפרוש מן הציבור', prompt: 'What is a careful first response to this ethical maxim?', answers: ['Ask how it might invite a modest practice while avoiding an automatic ruling.', 'Use it to judge every disagreement immediately.', 'Ignore its communal setting.'], correct: 0 }
);
const foundationSkillByLegacy = {
  'hebrew-decoding': 'fnd-signal-question-words',
  'mishnah-orientation': 'fnd-orient-source-type',
  'language-baseline': 'fnd-signal-known-words',
  'gemara-moves': 'fnd-arg-claim',
  'proof-texts': 'fnd-arg-evidence-role',
  'halakha-torah-directive': 'fnd-resp-learning-vs-ruling',
  'tanakh-address-claim': 'fnd-context-who-audience',
  'thought-identify-claim': 'fnd-arg-claim',
  'liturgical-function': 'fnd-context-genre-expectations',
  'historical-context': 'fnd-context-when-where',
  'comparative-reading': 'fnd-compare-scope',
  'conceptual-application': 'fnd-resp-name-limits'
};
const learnerId = Seder.currentLearnerId();
let index = 0;
const scores = {};
const $ = (selector) => document.querySelector(selector);
const shuffle = (items) => items.map((text, originalIndex) => ({ text, originalIndex })).sort(() => Math.random() - .5);

// The starting profile and its recommendation are computed against the real foundational
// skill graph (data/foundation-skill-graph.json — the same artifact the server and academy
// sessions read), so placement stays in sync with the graph instead of a hardcoded taxonomy.
const SECURE = 0.67;
let graph = null;
const graphReady = fetch('data/foundation-skill-graph.json').then((response) => (response.ok ? response.json() : null)).then((data) => { graph = data; }).catch(() => { graph = null; });
let foundationScores = {};
let recommendation = null;   // { id, title, statement, why, unlocks } — the first skill that unlocks the most
let layerProfile = [];       // [{ n, title, status, tone }] — capability status per graph layer

// Translate the placement's legacy check ids into foundational-skill evidence.
const toFoundationScores = () => Object.fromEntries(
  Object.entries(scores).filter(([skill]) => foundationSkillByLegacy[skill]).map(([skill, score]) => [foundationSkillByLegacy[skill], score])
);

// Given foundational-skill evidence, find the single highest-leverage next skill: a skill the
// learner has not yet shown, all of whose prerequisites they have, that the most later skills
// depend on. This is the roadmap's placement promise — "here is the first skill that will
// unlock the most" — computed from the graph, with a graceful fallback if the graph is absent.
function analyze(evidence) {
  if (!graph || !Array.isArray(graph.skills)) {
    const weakest = Object.entries(evidence).sort((a, b) => a[1] - b[1])[0];
    return { recommendation: { id: weakest ? weakest[0] : 'fnd-orient-source-type', title: 'your first foundational skill', statement: '', why: '', unlocks: 0 }, layerProfile: [] };
  }
  const skills = graph.skills;
  const dependents = new Map();
  for (const skill of skills) for (const prereq of skill.prerequisites || []) {
    if (!dependents.has(prereq)) dependents.set(prereq, []);
    dependents.get(prereq).push(skill.id);
  }
  const leverage = (id) => {
    const seen = new Set();
    const stack = [...(dependents.get(id) || [])];
    while (stack.length) { const next = stack.pop(); if (seen.has(next)) continue; seen.add(next); for (const d of dependents.get(next) || []) stack.push(d); }
    return seen.size;
  };
  const cleared = new Set(skills.filter((skill) => (evidence[skill.id] || 0) >= SECURE).map((skill) => skill.id));
  let candidates = skills.filter((skill) => !cleared.has(skill.id) && (skill.prerequisites || []).every((prereq) => cleared.has(prereq)));
  if (!candidates.length) {
    const openPrereqs = (skill) => (skill.prerequisites || []).filter((prereq) => !cleared.has(prereq)).length;
    candidates = skills.filter((skill) => !cleared.has(skill.id)).sort((a, b) => openPrereqs(a) - openPrereqs(b) || a.layer - b.layer).slice(0, 1);
  }
  const best = candidates
    .map((skill) => ({ skill, lev: leverage(skill.id) }))
    .sort((a, b) => b.lev - a.lev || a.skill.layer - b.skill.layer || a.skill.id.localeCompare(b.skill.id))[0];
  const recommendation = {
    id: best.skill.id,
    title: best.skill.title,
    statement: best.skill.statement || '',
    why: best.lev > 0
      ? `More of the foundation builds on this than on anything else you have not shown yet — ${best.lev} later skill${best.lev === 1 ? '' : 's'} depend on it.`
      : 'This is the next move toward reading a source on your own.',
    unlocks: best.lev
  };
  const layerProfile = (graph.layers || []).map((layer) => {
    const sampled = skills.filter((skill) => skill.layer === layer.n && skill.id in evidence);
    if (!sampled.length) return { n: layer.n, title: layer.title, status: 'Not yet sampled', tone: 'neutral' };
    const avg = sampled.reduce((sum, skill) => sum + (evidence[skill.id] || 0), 0) / sampled.length;
    const status = avg >= 0.8 ? 'Secure' : avg >= 0.5 ? 'Emerging' : 'Start here';
    const tone = avg >= 0.8 ? 'strong' : avg >= 0.5 ? 'mid' : 'low';
    return { n: layer.n, title: layer.title, status, tone };
  });
  return { recommendation, layerProfile };
}
function render() {
  const check = checks[index];
  $('#status').textContent = `${checks.length} SHORT CHECKS`;
  $('#dots').innerHTML = checks.map((_, dotIndex) => `<li class="${dotIndex === index ? 'active' : ''}">${dotIndex + 1}</li>`).join('');
  $('#progress').textContent = `CHECK ${index + 1} OF ${checks.length}`;
  $('#skill-label').textContent = check.label;
  $('#source').textContent = check.source;
  $('#prompt').textContent = check.prompt;
  document.querySelectorAll('#dots li').forEach((dot, dotIndex) => dot.classList.toggle('active', dotIndex === index));
  const answers = $('#answers'); answers.innerHTML = '';
  shuffle(check.answers).forEach(({ text, originalIndex }) => { const button = document.createElement('button'); button.type = 'button'; button.textContent = text; button.addEventListener('click', () => { scores[check.skill] = originalIndex === check.correct ? 1 : .25; if (index < checks.length - 1) { index += 1; render(); } else complete(); }); answers.appendChild(button); });
}
function renderResults() {
  $('#placement-results').hidden = false;
  $('.placement-shell').hidden = true;
  $('.intro').hidden = true;
  const rec = recommendation;
  $('#results-title').textContent = rec && rec.title ? `Start here: ${rec.title}` : 'Your starting profile is ready.';
  $('#results-copy').textContent = rec && rec.statement
    ? `${rec.statement} ${rec.why} This is a starting profile, not a permanent level — Jewish Learning Academy uses it to choose your first source and review rhythm.`
    : 'This is a starting profile, not a permanent level. Jewish Learning Academy uses it to choose your first source and review rhythm.';
  const secure = layerProfile.filter((layer) => layer.status === 'Secure').map((layer) => layer.title.toLowerCase());
  const canDo = $('#results-cando');
  if (canDo) canDo.textContent = secure.length
    ? `You can already work with: ${secure.join(', ')}.`
    : 'You are right at the beginning of the foundation — a good place to start.';
  $('#results-grid').innerHTML = layerProfile.length
    ? layerProfile.map((layer) => `<article class="tone-${layer.tone}"><span>${layer.n}. ${layer.title}</span><strong>${layer.status}</strong></article>`).join('')
    : Object.entries(foundationScores).map(([id, score]) => `<article><span>${id}</span><strong>${Math.round(score * 100)}% signal</strong></article>`).join('');
  const begin = $('#results-begin');
  if (begin && rec) begin.href = `daily-router.html?foundationSkill=${encodeURIComponent(rec.id)}`;
  $('#status').textContent = 'STARTING PROFILE READY';
  document.querySelectorAll('[data-rhythm]').forEach((button) => button.addEventListener('click', async () => {
    const rhythm = button.dataset.rhythm;
    document.querySelectorAll('[data-rhythm]').forEach((item) => item.classList.toggle('selected', item === button));
    $('#rhythm-status').textContent = 'Saving your rhythm…';
    try {
      const response = await Seder.api(`/api/learners/${learnerId}/events`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ type:'learning_rhythm_set', rhythm }) });
      if (!response.ok) throw new Error('rhythm');
      $('#rhythm-status').textContent = 'Rhythm saved. The Academy will keep the next move small and consistent.';
    } catch { $('#rhythm-status').textContent = 'Rhythm will stay on this device until your account is available.'; }
  }));
}
async function complete() {
  $('#status').textContent = 'SAVING YOUR STARTING POINT';
  await graphReady;
  foundationScores = toFoundationScores();
  const analysis = analyze(foundationScores);
  recommendation = analysis.recommendation;
  layerProfile = analysis.layerProfile;
  Seder.api(`/api/learners/${learnerId}/events`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'placement_completed', scores, foundationScores, recommendedSkill: recommendation ? recommendation.id : null }) }).then((response) => response.ok ? response.json() : Promise.reject()).then(() => renderResults()).catch(() => { $('#status').textContent = 'Placement could not be saved.'; });
}
render();
