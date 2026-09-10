// Adaptive placement as a knowledge-frontier estimator (The Math Academy Way, ch. 4). Drives the
// stateless graph diagnostic (POST /api/graph/diagnostic): each answer is a real authored MC, the
// server picks the next skill that best splits remaining uncertainty, and infers everything below a
// passed skill. Self-ratings are not used. On completion it seeds the frontier through the same
// placement_completed path the rest of the app uses (enrichPlacementWithFrontier), at a provisional
// "secure" level — one placement item is evidence, not a graded 1.0, and later sessions refine it.
const learnerId = Seder.currentLearnerId();
const $ = (selector) => document.querySelector(selector);
const esc = (value) => String(value == null ? '' : value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const responses = {};      // skillId -> passed boolean, accumulated across probes
let questionCount = 0;
const PROBE_CAP = 6; // keep in sync with DIAGNOSTIC_PROBE_CAP
let maxProbes = PROBE_CAP;
let done = false;          // once the result is shown, the diagnostic is terminal — no late probe may reappear
let graph = null;
let total = 53;            // graph skill count, for the "mapped" gauge; refined once the graph loads
let kids = new Map();      // skillId -> direct dependents, for local descendant/leverage math
let pending = null;        // { id, passed } while feedback is on screen

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

function shuffleChoices(choices, correctIndex) {
  const items = choices.map((text, index) => ({ text, correct: index === correctIndex }));
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

// One round-trip to the stateless estimator: send everything answered so far, get the current
// estimate, the next probe, or completion.
async function step() {
  if (done) return; // a slow round-trip could resolve after we've already finished; never re-open
  let data;
  try {
    const response = await Seder.api('/api/graph/diagnostic', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ responses }), optional: true });
    if (!response.ok) throw new Error('diagnostic');
    data = await response.json();
  } catch { $('#status').textContent = 'Diagnostic unavailable — reload to try again.'; return; }
  if (typeof data.maxProbes === "number" && data.maxProbes > 0) maxProbes = data.maxProbes;
  updateGauge(data.estimate || {});
  const atCap = Object.keys(responses).length >= maxProbes;
  if (data.complete || !data.nextProbe || atCap) { finish(data.estimate || {}); return; }
  if (done) return; // finished while this round-trip was in flight
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
  $('#q-label').textContent = `Check ${Math.min(questionCount + 1, maxProbes)} of ${maxProbes}`;
}

function renderProbe(probe) {
  const item = probe.item;
  if (!item || !Array.isArray(item.choices) || item.choices.length < 2) {
    $('#status').textContent = 'Diagnostic unavailable — reload to try again.';
    return;
  }
  const intro = $('.intro'); if (intro) intro.hidden = true;
  $('#probe-shell').hidden = false;
  pending = { id: probe.id, passed: null };
  const skill = skillById(probe.id);
  $('#probe-layer').textContent = (skill ? `Layer ${skill.layer} · ${layerTitle(skill.layer)}` : 'Foundation').toUpperCase();
  const ref = $('#probe-ref');
  if (item.sourceRef) { ref.textContent = item.sourceRef; ref.hidden = false; }
  else { ref.textContent = ''; ref.hidden = true; }
  const teachBlock = $('#probe-teach-block');
  const teach = $('#probe-teach');
  if (probe.teach) {
    teach.textContent = probe.teach;
    teachBlock.hidden = false;
  } else {
    teach.textContent = '';
    teachBlock.hidden = true;
  }
  $('#probe-stem').textContent = item.stem;
  const feedback = $('#probe-feedback');
  feedback.hidden = true;
  feedback.textContent = '';
  feedback.className = 'jla-feedback';
  const cont = $('#probe-continue');
  cont.hidden = true;

  const answers = $('#answers');
  answers.innerHTML = '';
  for (const option of shuffleChoices(item.choices, item.correct)) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'jla-choice';
    button.textContent = option.text;
    button.addEventListener('click', () => {
      if (!pending || pending.passed !== null) return;
      const passed = option.correct;
      pending.passed = passed;
      answers.querySelectorAll('button').forEach((other) => {
        other.disabled = true;
        if (other === button) other.classList.add(passed ? 'is-correct' : 'is-wrong');
      });
      const taught = item.feedback || '';
      feedback.textContent = passed ? (taught || 'Yes.') : (taught ? `Not yet. ${taught}` : 'Not yet.');
      feedback.className = passed ? 'jla-feedback is-correct' : 'jla-feedback is-wrong';
      feedback.hidden = false;
      cont.hidden = false;
      cont.focus();
    });
    answers.appendChild(button);
  }
}

function bindContinue() {
  const cont = $('#probe-continue');
  if (!cont || cont.dataset.bound) return;
  cont.dataset.bound = 'true';
  cont.addEventListener('click', () => {
    if (!pending || pending.passed === null || done) return;
    responses[pending.id] = pending.passed;
    questionCount += 1;
    pending = null;
    cont.hidden = true;
    step();
  });
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
  pending = null;
  $('#probe-shell').hidden = true;
  const intro = $('.intro'); if (intro) intro.hidden = true;
  $('#status').textContent = 'STARTING POINT READY';
  const start = pickStart(estimate.frontier);
  // Seed via the proven placement path: pass the directly-demonstrated skills; the server's downward
  // inference (enrichPlacementWithFrontier) seeds their prerequisites too. One placement item lands
  // at a provisional 0.8 ("secure"), never a graded 1.0, and real practice refines it from there.
  const passed = Object.keys(responses).filter((id) => responses[id]);
  const foundationScores = Object.fromEntries(passed.map((id) => [id, 0.8]));
  Seder.api(`/api/learners/${learnerId}/events`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'placement_completed', source: 'adaptive-diagnostic', scores: foundationScores, foundationScores, recommendedSkill: start ? start.id : null }),
    optional: true
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
    ? `${start.skill.statement || ''} ${why} This is a starting point, not a score — your first sessions confirm it, and anything you can’t yet do comes right back.`
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
  if (begin) { begin.href = 'daily-router.html'; begin.textContent = 'Start today’s lesson →'; }
  bindRhythm();
}

// Same rhythm capture as the rest of placement, so a learner leaves with a pace set.
function bindRhythm() {
  document.querySelectorAll('[data-rhythm]').forEach((button) => button.addEventListener('click', async () => {
    document.querySelectorAll('[data-rhythm]').forEach((other) => other.classList.toggle('selected', other === button));
    $('#rhythm-status').textContent = 'Saving your rhythm…';
    try {
      const response = await Seder.api(`/api/learners/${learnerId}/events`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'learning_rhythm_set', rhythm: button.dataset.rhythm }), optional: true });
      if (!response.ok) throw new Error('rhythm');
      $('#rhythm-status').textContent = 'Rhythm saved. The Academy will keep the next move small and consistent.';
    } catch { $('#rhythm-status').textContent = 'Rhythm will stay on this device until your account is available.'; }
  }));
}

function showSignupCta() {
  const intro = $('.intro'); if (intro) intro.hidden = false;
  const cta = $('#intro-cta'); if (cta) cta.hidden = false;
  const shell = $('#probe-shell'); if (shell) shell.hidden = true;
}

async function hostedSessionReady() {
  const config = await Seder.config();
  const needsAuth = config.mode === 'token' || (config.supabaseUrl && config.supabaseAnonKey);
  if (!needsAuth) return true;
  if (!Seder.session?.access_token) {
    showSignupCta();
    return false;
  }
  const session = await Seder.api('/api/auth/session', { optional: true });
  if (session.ok) return true;
  showSignupCta();
  return false;
}

bindContinue();
graphReady.then(async () => {
  if (await hostedSessionReady()) return step();
});
