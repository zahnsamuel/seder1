// Adaptive placement as a knowledge-frontier estimator (The Math Academy Way, ch. 4). Drives the
// stateless graph diagnostic (POST /api/graph/diagnostic): each answer is fed back, the server picks
// the next skill that best splits the remaining uncertainty (binary search through the DAG) and
// infers everything below a passed skill, so the frontier is pinned in a handful of questions rather
// than one per skill. On completion it seeds the frontier through the same placement_completed path
// the graded placement uses (enrichPlacementWithFrontier), at a provisional "secure" level — this is
// self-calibrated placement, corrected by real evidence the moment the learner starts practicing.
const learnerId = Seder.currentLearnerId();
const $ = (selector) => document.querySelector(selector);
const esc = (value) => String(value == null ? '' : value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const responses = {};      // skillId -> passed boolean, accumulated across probes
let questionCount = 0;
let graph = null;
let total = 53;            // graph skill count, for the "mapped" gauge; refined once the graph loads
let kids = new Map();      // skillId -> direct dependents, for local descendant/leverage math

const graphReady = fetch('data/foundation-skill-graph.json')
  .then((response) => (response.ok ? response.json() : null))
  .then((data) => {
    graph = data;
    if (data && Array.isArray(data.skills)) {
      total = data.skills.length;
      kids = new Map(data.skills.map((skill) => [skill.id, []]));
      for (const skill of data.skills) for (const prereq of skill.prerequisites || []) kids.get(prereq)?.push(skill.id);
    }
  })
  .catch(() => { graph = null; });

const skillById = (id) => (graph && graph.skills || []).find((skill) => skill.id === id);
const layerTitle = (n) => ((graph && graph.layers) || []).find((layer) => layer.n === n)?.title || 'Foundation';
function descendants(id, out = new Set()) { for (const child of kids.get(id) || []) if (!out.has(child)) { out.add(child); descendants(child, out); } return out; }
const leverage = (id) => descendants(id).size; // how many later moves depend on this one

// One round-trip to the stateless estimator: send everything answered so far, get the current
// estimate, the next probe, or completion.
async function step() {
  let data;
  try {
    const response = await Seder.api('/api/graph/diagnostic', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ responses }) });
    if (!response.ok) throw new Error('diagnostic');
    data = await response.json();
  } catch { $('#status').textContent = 'Diagnostic unavailable — try placement.'; return; }
  updateGauge(data.estimate || {});
  if (data.complete || !data.nextProbe) { finish(data.estimate || {}); return; }
  renderProbe(data.nextProbe);
}

// Honest progress: skills whose status is now settled — known (inferred below the frontier), directly
// answered, or provably beyond it (a descendant of something the learner failed).
function updateGauge(estimate) {
  const failed = Object.keys(responses).filter((id) => !responses[id]);
  const beyond = new Set();
  for (const id of failed) for (const d of descendants(id)) beyond.add(d);
  const mapped = new Set([...(estimate.known || []), ...beyond, ...Object.keys(responses)]);
  const pct = Math.min(100, Math.round((mapped.size / total) * 100));
  const fill = $('#gauge-fill'); if (fill) fill.style.width = `${pct}%`;
  const gauge = $('.gauge'); if (gauge) gauge.setAttribute('aria-valuenow', String(pct));
  $('#placed-label').textContent = `${mapped.size} of ${total} skills mapped`;
  $('#q-label').textContent = `Question ${questionCount + 1}`;
}

function renderProbe(probe) {
  $('#probe-shell').hidden = false;
  const skill = skillById(probe.id);
  $('#probe-layer').textContent = (skill ? `Layer ${skill.layer} · ${layerTitle(skill.layer)}` : 'Foundation').toUpperCase();
  $('#probe-title').textContent = probe.title || (skill && skill.title) || '';
  $('#probe-stmt').textContent = probe.statement || (skill && skill.statement) || '';
  $('#probe-check').textContent = probe.check || 'Judge honestly whether you can do this on your own.';
  const answers = $('#answers'); answers.innerHTML = '';
  const options = [
    { label: 'Yes — I can do this reliably', passed: true, cls: 'yes' },
    { label: 'Not reliably yet', passed: false, cls: 'no' },
    { label: 'Not sure', passed: false, cls: 'no' }
  ];
  for (const option of options) {
    const button = document.createElement('button');
    button.type = 'button'; button.className = option.cls; button.textContent = option.label;
    button.addEventListener('click', () => {
      responses[probe.id] = option.passed;
      questionCount += 1;
      answers.querySelectorAll('button').forEach((other) => { other.disabled = true; });
      step();
    });
    answers.appendChild(button);
  }
}

// The single highest-leverage frontier skill: ready now, and more later moves depend on it than on any
// other ready-now move (mirrors placement.js's "the first skill that unlocks the most").
function pickStart(frontier) {
  const candidates = (frontier || []).map((id) => ({ id, skill: skillById(id), lev: leverage(id) })).filter((entry) => entry.skill);
  if (!candidates.length) return null;
  return candidates.sort((a, b) => b.lev - a.lev || a.skill.layer - b.skill.layer || a.id.localeCompare(b.id))[0];
}

function finish(estimate) {
  $('#probe-shell').hidden = true;
  const intro = $('.intro'); if (intro) intro.hidden = true;
  $('#status').textContent = 'STARTING POINT READY';
  const start = pickStart(estimate.frontier);
  // Seed via the proven placement path: pass the directly-claimed skills; the server's downward
  // inference (enrichPlacementWithFrontier) seeds their prerequisites too. Self-report lands at a
  // provisional 0.8 ("secure"), never a graded 1.0, and real practice refines it from there.
  const passed = Object.keys(responses).filter((id) => responses[id]);
  const foundationScores = Object.fromEntries(passed.map((id) => [id, 0.8]));
  Seder.api(`/api/learners/${learnerId}/events`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'placement_completed', source: 'adaptive-diagnostic', scores: foundationScores, foundationScores, recommendedSkill: start ? start.id : null })
  }).catch(() => {});
  renderResults(estimate, start);
}

function renderResults(estimate, start) {
  $('#results').hidden = false;
  const known = new Set(estimate.known || []);
  const why = start && start.lev > 0
    ? `More of the foundation builds on this than anything else you haven’t shown yet — ${start.lev} later move${start.lev === 1 ? '' : 's'} depend on it.`
    : (start ? 'This is your next move toward reading a source on your own.' : 'Every foundational move is already in place — carry them into an unfamiliar source to make them durable.');
  $('#results-title').textContent = start ? `Start here: ${start.skill.title}` : 'You’ve placed out of the foundation.';
  $('#results-copy').textContent = start
    ? `${start.skill.statement || ''} ${why} This is a starting point, not a permanent level — your first sessions confirm it, and anything you can’t yet do comes right back.`
    : why;
  $('#results-cando').textContent = known.size
    ? `You placed ${known.size} of ${total} reading moves as already yours.`
    : 'You’re right at the beginning of the foundation — a good place to start.';
  const layers = (graph && graph.layers) || [];
  $('#results-grid').innerHTML = layers.map((layer) => {
    const inLayer = (graph.skills || []).filter((skill) => skill.layer === layer.n);
    const got = inLayer.filter((skill) => known.has(skill.id)).length;
    let status = 'Start here', tone = 'low';
    if (!inLayer.length) { status = '—'; tone = 'neutral'; }
    else if (got === inLayer.length) { status = 'Secure'; tone = 'strong'; }
    else if (got > 0) { status = `${got}/${inLayer.length} secure`; tone = 'mid'; }
    return `<article class="tone-${tone}"><span>${layer.n}. ${esc(layer.title)}</span><strong>${status}</strong></article>`;
  }).join('');
  const begin = $('#results-begin');
  if (begin) begin.href = start
    ? (start.id.startsWith('fnd-decode-') ? 'hebrew-decoding.html' : `daily-router.html?foundationSkill=${encodeURIComponent(start.id)}`)
    : 'my-graph.html';
  bindRhythm();
}

// Same rhythm capture as the graded placement, so a learner leaves either path with a pace set.
function bindRhythm() {
  document.querySelectorAll('[data-rhythm]').forEach((button) => button.addEventListener('click', async () => {
    document.querySelectorAll('[data-rhythm]').forEach((other) => other.classList.toggle('selected', other === button));
    $('#rhythm-status').textContent = 'Saving your rhythm…';
    try {
      const response = await Seder.api(`/api/learners/${learnerId}/events`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'learning_rhythm_set', rhythm: button.dataset.rhythm }) });
      if (!response.ok) throw new Error('rhythm');
      $('#rhythm-status').textContent = 'Rhythm saved. The Academy will keep the next move small and consistent.';
    } catch { $('#rhythm-status').textContent = 'Rhythm will stay on this device until your account is available.'; }
  }));
}

graphReady.then(step); // load the graph first so probes show their layer and the gauge has a denominator
