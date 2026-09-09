// Adaptive placement as a knowledge-frontier estimator (The Math Academy Way, ch. 4). Drives the
// stateless graph diagnostic (POST /api/graph/diagnostic): each answer is fed back, the server picks
// the next skill that best splits the remaining uncertainty (binary search through the DAG) and
// infers everything below a passed skill. First day is capped at a few checks (DIAGNOSTIC_PROBE_CAP),
// then one Today lesson — not a long quiz. On completion it seeds the frontier through the same
// placement_completed path the graded placement uses (enrichPlacementWithFrontier), at a provisional
// "secure" level — corrected by real evidence the moment the learner starts practicing.
const learnerId = Seder.currentLearnerId();
const $ = (selector) => document.querySelector(selector);
const esc = (value) => String(value == null ? '' : value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const PROBE_CAP = 6;       // keep in sync with DIAGNOSTIC_PROBE_CAP; server may send maxProbes

const responses = {};      // skillId -> passed boolean, accumulated across probes
let questionCount = 0;
let maxProbes = PROBE_CAP;
let done = false;          // once the result is shown, the diagnostic is terminal — no late probe may reappear
let graph = null;
let kids = new Map();      // skillId -> direct dependents, for local descendant/leverage math

const graphReady = fetch('data/foundation-skill-graph.json')
  .then((response) => (response.ok ? response.json() : null))
  .then((data) => {
    graph = data;
    if (data && Array.isArray(data.skills)) {
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
  if (done) return; // a slow round-trip could resolve after we've already finished; never re-open
  let data;
  try {
    const response = await Seder.api('/api/graph/diagnostic', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ responses }) });
    if (!response.ok) throw new Error('diagnostic');
    data = await response.json();
  } catch { $('#status').textContent = 'Diagnostic unavailable — reload to try again.'; return; }
  if (typeof data.maxProbes === 'number' && data.maxProbes > 0) maxProbes = data.maxProbes;
  updateGauge(data.estimate || {});
  const atCap = Object.keys(responses).length >= maxProbes;
  if (data.complete || !data.nextProbe || atCap) { finish(data.estimate || {}); return; }
  if (done) return; // finished while this round-trip was in flight
  renderProbe(data.nextProbe);
}

// Honest progress: Check N of the first-day cap — never a corpus-size count, which reads as a long quiz.
function updateGauge() {
  const asked = Object.keys(responses).length;
  const shown = Math.min(asked + 1, maxProbes);
  const pct = Math.min(100, Math.round((asked / maxProbes) * 100));
  const fill = $('#gauge-fill'); if (fill) fill.style.width = `${pct}%`;
  const gauge = $('.gauge'); if (gauge) gauge.setAttribute('aria-valuenow', String(pct));
  $('#placed-label').textContent = 'A few short checks';
  $('#q-label').textContent = `Check ${shown} of ${maxProbes}`;
}

function renderProbe(probe) {
  const intro = $('.intro'); if (intro) intro.hidden = true;
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
    button.type = 'button'; button.className = `jla-choice ${option.cls}`; button.textContent = option.label;
    button.addEventListener('click', () => {
      responses[probe.id] = option.passed;
      questionCount += 1;
      answers.querySelectorAll('button').forEach((other) => { other.disabled = true; });
      step();
    });
    answers.appendChild(button);
  }
}

// The same frontier pick Today uses: lowest layer, then id. Leverage still explains why the move matters,
// but it must not invent a second start beside the next-action engine.
function pickStart(frontier) {
  const candidates = (frontier || []).map((id) => ({ id, skill: skillById(id) })).filter((entry) => entry.skill);
  if (!candidates.length) return null;
  const start = candidates.sort((a, b) => a.skill.layer - b.skill.layer || a.id.localeCompare(b.id))[0];
  start.lev = leverage(start.id);
  return start;
}

function finish(estimate) {
  if (done) return; // idempotent: only place the result once, and never re-open it afterward
  done = true;
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
  $('#results-title').textContent = start ? `Today’s lesson: ${start.skill.title}` : 'You’ve placed out of the foundation.';
  $('#results-copy').textContent = start
    ? `${start.skill.statement || ''} ${why} This is a starting point, not a score — one short lesson today will confirm it, and anything you can’t yet do comes right back.`
    : why;
  $('#results-cando').textContent = known.size
    ? (known.size === 1
      ? 'One reading move already looks secure. Begin at the first that is not yet.'
      : `${known.size} reading moves already look secure. Begin at the first that is not yet.`)
    : 'You’re right at the beginning of the foundation — a good place to start.';
  const layers = (graph && graph.layers) || [];
  $('#results-grid').innerHTML = layers.map((layer) => {
    const inLayer = (graph.skills || []).filter((skill) => skill.layer === layer.n);
    const got = inLayer.filter((skill) => known.has(skill.id)).length;
    let status = 'Emerging', tone = 'low';
    if (!inLayer.length) { status = '—'; tone = 'neutral'; }
    else if (got === inLayer.length) { status = 'Secure'; tone = 'strong'; }
    else if (got > 0) { status = 'Emerging'; tone = 'mid'; }
    return `<article class="tone-${tone}"><span>${layer.n}. ${esc(layer.title)}</span><strong>${status}</strong></article>`;
  }).join('');
  const begin = $('#results-begin');
  if (begin) {
    begin.href = 'daily-router.html';
    begin.textContent = 'Start today’s lesson →';
    begin.focus();
  }
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
