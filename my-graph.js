// Your map through the graph: the whole 49-skill foundation graph, coloured by where the learner is —
// mastered (secured), frontier (ready now: every prerequisite secured), or ahead (still locked). The
// big-picture companion to My Path's frontier list. Grounded in the learner's own evidence.
const esc = (v) => String(v == null ? '' : v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const set = (sel, fn) => { const el = document.querySelector(sel); if (el) fn(el); };

function render(learner, graph) {
  const skills = graph.skills || [];
  const layers = graph.layers || [];
  const foundationScores = learner.foundationScores || {};
  const mastery = learner.mastery || {};
  const isSecure = (id) => Math.max(foundationScores[id] || 0, mastery[id] || 0) >= 0.67;
  const byId = new Map(skills.map((s) => [s.id, s]));
  const titleOf = (id) => byId.get(id)?.title || id;
  const stateOf = (s) => isSecure(s.id) ? 'mastered' : (s.prerequisites || []).every(isSecure) ? 'frontier' : 'locked';
  const state = new Map(skills.map((s) => [s.id, stateOf(s)]));
  const successors = new Map(skills.map((s) => [s.id, skills.filter((x) => (x.prerequisites || []).includes(s.id))]));

  const counts = { mastered: 0, frontier: 0, locked: 0 };
  skills.forEach((s) => { counts[state.get(s.id)] += 1; });
  set('#xp', (el) => { el.textContent = counts.mastered ? `${counts.mastered} on your own` : ''; });
  set('#summary', (el) => {
    el.innerHTML = counts.mastered
      ? `You have mastered <b>${counts.mastered}</b> reading move${counts.mastered === 1 ? '' : 's'}. <b>${counts.frontier}</b> ${counts.frontier === 1 ? 'is' : 'are'} ready now; <b>${counts.locked}</b> lie ahead. The gold moves are the ones your evidence says you are ready to learn next.`
      : `The whole map of ${skills.length} reading moves. <b>${counts.frontier}</b> ${counts.frontier === 1 ? 'is' : 'are'} ready to begin; the rest open up as you secure each one.`;
  });

  // ---- layered layout ----
  const layerNums = [...new Set(skills.map((s) => s.layer))].sort((a, b) => a - b);
  const byLayer = {}; skills.forEach((s) => { (byLayer[s.layer] = byLayer[s.layer] || []).push(s); });
  const W = 920, rowH = 58, padX = 58, padTop = 30, padBot = 26;
  const H = padTop + padBot + layerNums.length * rowH;
  const pos = {};
  layerNums.forEach((L, li) => {
    const row = byLayer[L]; const y = padTop + li * rowH + 16;
    row.forEach((s, i) => { const x = padX + (row.length === 1 ? (W - 2 * padX) / 2 : i * ((W - 2 * padX) / (row.length - 1))); pos[s.id] = { x, y }; });
  });

  let g = '';
  for (const s of skills) for (const p of s.prerequisites || []) {
    const a = pos[p], b = pos[s.id]; if (!a || !b) continue;
    const hot = state.get(s.id) === 'frontier' && isSecure(p); // a secured move feeding a ready-now one
    g += `<path d="M${a.x} ${a.y} C ${a.x} ${(a.y + b.y) / 2}, ${b.x} ${(a.y + b.y) / 2}, ${b.x} ${b.y}" fill="none" stroke="${hot ? 'var(--frontier)' : 'var(--line)'}" stroke-width="${hot ? 1.5 : 1}" opacity="${hot ? 0.8 : 0.5}"/>`;
  }
  layerNums.forEach((L, li) => { g += `<text class="lyr" x="10" y="${padTop + li * rowH + 20}">${L}</text>`; });
  for (const s of skills) {
    const p = pos[s.id]; const st = state.get(s.id);
    g += `<g class="node ${st}" data-id="${esc(s.id)}" tabindex="0" role="button" aria-label="${esc(s.title)} — ${st}"><title>${esc(s.title)} — ${st}</title><circle cx="${p.x}" cy="${p.y}" r="${st === 'frontier' ? 8 : 6.5}"></circle></g>`;
  }
  const svg = document.getElementById('map');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('height', H);
  svg.innerHTML = g;

  // ---- detail panel ----
  const stateLabel = { mastered: 'Mastered', frontier: 'Ready now', locked: 'Ahead' };
  function showDetail(id) {
    const s = byId.get(id); if (!s) return;
    const st = state.get(id);
    svg.querySelectorAll('.node.sel').forEach((n) => n.classList.remove('sel'));
    svg.querySelector(`.node[data-id="${CSS.escape(id)}"]`)?.classList.add('sel');
    const prereqs = (s.prerequisites || []).map((p) => `<span class="chip ${isSecure(p) ? 'done' : ''}">${esc(titleOf(p))}</span>`).join('') || '<span class="chip">— a starting move</span>';
    const opens = (successors.get(id) || []).map((x) => `<span class="chip">${esc(x.title)}</span>`).join('') || '<span class="chip">completes its layer</span>';
    const layer = layers.find((x) => x.n === s.layer);
    const practiceUrl = id.startsWith('fnd-decode-') ? 'hebrew-decoding.html' : `academy-session.html?skill=${encodeURIComponent(id)}`;
    const practice = st === 'locked' ? '' : `<a class="practice" href="${practiceUrl}">${st === 'mastered' ? 'Practice again →' : 'Practice this move →'}</a>`;
    document.getElementById('detail').innerHTML =
      `<span class="state ${st}">${stateLabel[st]}</span>` +
      `<h2>${esc(s.title)}</h2><p class="stmt">${esc(s.statement || '')}</p>` +
      `<div class="rel"><div class="row"><span class="lbl">Layer ${s.layer}</span><b>${esc(layer?.title || '')}</b></div>` +
      `<div class="row"><span class="lbl">Builds on</span>${prereqs}</div>` +
      `<div class="row"><span class="lbl">Unlocks</span>${opens}</div></div>${practice}`;
  }
  svg.querySelectorAll('.node').forEach((n) => {
    n.addEventListener('click', () => showDetail(n.dataset.id));
    n.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); showDetail(n.dataset.id); } });
  });
  // Open on the first frontier move so the page is never empty of guidance.
  const firstFrontier = skills.find((s) => state.get(s.id) === 'frontier');
  if (firstFrontier) showDetail(firstFrontier.id);
}

// Static demo mode: a baked {learner, graph} in a <script id="demo-data"> renders without any login
// or API (the shareable demo-map artifact). Otherwise fetch the signed-in learner's real evidence.
const embedded = document.getElementById('demo-data');
if (embedded) {
  try { const data = JSON.parse(embedded.textContent); render(data.learner || {}, data.graph); } catch (e) { /* malformed demo data */ }
} else {
  const learnerId = Seder.currentLearnerId();
  Promise.all([
    Seder.api(`/api/learners/${learnerId}`).then((r) => (r.ok ? r.json() : {})).catch(() => ({})),
    fetch('data/foundation-skill-graph.json').then((r) => r.json())
  ]).then(([learner, graph]) => render(learner, graph))
    .catch(() => { set('#summary', (el) => { el.textContent = 'Sign in to see your map through the graph.'; }); });
}
