/* Educator starter-set edge / misconception workbench.
   Internal only. Loads the frozen starter set and leaves pedagogical fields empty
   unless a human typed them. Export matches docs/educator-audit-workbench.html
   so `npm run graph:import` can fold it. */
(function () {
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));

  const $ = (id) => document.getElementById(id);
  const errorEl = $('error');
  const files = [
    'data/foundation-starter-set.json',
    'data/foundation-skill-graph.json',
    'data/foundation-skill-edges.json',
    'data/foundation-edge-audit.json'
  ];

  function showError(msg) {
    errorEl.hidden = false;
    errorEl.textContent = msg;
  }

  function edgeKey(from, to) { return `${from}::${to}`; }

  function inventory(graph, starterSet, edgeLayer) {
    const starterIds = new Set(starterSet.starterSet.map((s) => s.id));
    const titleOf = new Map(graph.skills.map((s) => [s.id, s.title]));
    const skillOf = new Map(graph.skills.map((s) => [s.id, s]));
    const edges = edgeLayer.edges
      .filter((e) => e.type === 'prerequisite' && starterIds.has(e.from) && starterIds.has(e.to))
      .map((e) => ({
        id: edgeKey(e.from, e.to),
        from: e.from,
        to: e.to,
        fromTitle: titleOf.get(e.from) || e.from,
        toTitle: titleOf.get(e.to) || e.to
      }));
    const incoming = new Map();
    for (const e of edges) {
      const list = incoming.get(e.to) || [];
      list.push(e);
      incoming.set(e.to, list);
    }
    const skills = starterSet.starterSet.slice()
      .sort((a, b) => a.layer - b.layer || a.id.localeCompare(b.id))
      .map((s) => {
        const full = skillOf.get(s.id) || {};
        return {
          id: s.id, layer: s.layer, band: s.band, title: s.title,
          statement: full.statement || '', repair: full.repair || '',
          incoming: incoming.get(s.id) || []
        };
      });
    return { graphVersion: graph.version, skills, edges, layers: graph.layers || [] };
  }

  function stubToState(stub) {
    const rationales = {};
    const misconceptions = {};
    for (const row of stub.edgeRationales || []) {
      if (row?.example === true) continue;
      const from = String(row.from || '').trim();
      const to = String(row.to || '').trim();
      const rationale = String(row.rationale || '').trim();
      if (from && to && rationale && !from.startsWith('example-')) rationales[edgeKey(from, to)] = rationale;
    }
    for (const row of stub.misconceptions || []) {
      if (row?.example === true) continue;
      const skill = String(row.skill || '').trim();
      const description = String(row.description || '').trim();
      const signal = String(row.signal || '').trim();
      if (skill && !skill.startsWith('example-') && (description || signal)) {
        misconceptions[skill] = { description, signal };
      }
    }
    return { rationales, misconceptions };
  }

  async function loadJson(path) {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`${path} (${res.status})`);
    return res.json();
  }

  Promise.all(files.map(loadJson)).then(([starterSet, graph, edgeLayer, stub]) => {
    const DATA = inventory(graph, starterSet, edgeLayer);
    const KEY = 'jla-starter-edge-audit-' + DATA.graphVersion;
    const fromStub = stubToState(stub);
    let state;
    try {
      const local = JSON.parse(localStorage.getItem(KEY));
      state = {
        rationales: { ...fromStub.rationales, ...(local?.rationales || {}) },
        misconceptions: { ...fromStub.misconceptions, ...(local?.misconceptions || {}) }
      };
    } catch {
      state = fromStub;
    }

    $('ver').textContent = DATA.graphVersion;
    $('t-rat').textContent = DATA.edges.length;
    $('t-mis').textContent = DATA.skills.length;

    renderExamples(stub.examples || []);
    renderBands(DATA);
    renderCards(DATA, state);
    bind(DATA, state, KEY);
    refresh(DATA, state);
    $('export').addEventListener('click', () => exportJson(DATA, state));
  }).catch((err) => {
    showError('Open this page through the app server (npm start) so it can load the starter-set JSON. ' + err.message);
  });

  function renderExamples(examples) {
    const root = $('example-panel');
    if (!examples.length) return;
    root.hidden = false;
    const cards = examples.map((ex) => {
      if (ex.kind === 'misconception') {
        return `<div class="ex-card"><span class="tag">EXAMPLE</span>
          <p><strong>Misconception</strong> for <code>${esc(ex.skill)}</code> (${esc(ex.skillTitle || '')})</p>
          <p>Description: ${esc(ex.description)}</p>
          <p>Signal: ${esc(ex.signal)}</p></div>`;
      }
      return `<div class="ex-card"><span class="tag">EXAMPLE</span>
        <p><strong>Edge rationale</strong> <code>${esc(ex.from)}</code> → <code>${esc(ex.to)}</code></p>
        <p>${esc(ex.rationale)}</p></div>`;
    }).join('');
    root.innerHTML = `<h2>Schema examples — not imported</h2>
      <p>These live in <code>examples[]</code> on fake <code>example-*</code> ids. Copy the shape, not the sentences, when you write a real starter-skill record.</p>${cards}`;
  }

  function renderBands(DATA) {
    const bands = [];
    const seen = new Set();
    for (const s of DATA.skills) {
      if (seen.has(s.band)) continue;
      seen.add(s.band);
      bands.push({ band: s.band, layer: s.layer });
    }
    const nav = $('bands');
    nav.hidden = false;
    nav.innerHTML = bands.map((b) => `<a href="#band-${b.layer}">L${b.layer} ${esc(b.band)}</a>`).join('');
  }

  function renderCards(DATA, state) {
    const layers = [...new Set(DATA.skills.map((s) => s.layer))].sort((a, b) => a - b);
    const titleOf = new Map((DATA.layers || []).map((l) => [l.n, l.title]));
    let html = '';
    for (const L of layers) {
      const row = DATA.skills.filter((s) => s.layer === L);
      const band = row[0]?.band || titleOf.get(L) || '';
      html += `<section class="band" id="band-${L}"><div class="band-head"><span class="num">LAYER ${L}</span><h2>${esc(band)}</h2><small>${row.length} skill${row.length === 1 ? '' : 's'}</small></div>`;
      for (const s of row) html += skillCard(s, state);
      html += '</section>';
    }
    $('cards').innerHTML = html;
  }

  function skillCard(s, state) {
    const ins = s.incoming;
    const edgesHtml = ins.length
      ? ins.map((e) => `
        <div class="edge">
          <p class="q">Why must <b>${esc(e.fromTitle)}</b> <span class="arrow">→</span> come before <b>${esc(e.toTitle)}</b>?</p>
          <textarea rows="2" data-rat="${esc(e.id)}" placeholder="An educator's reason this prerequisite holds — leave blank until a human writes it.">${esc(state.rationales[e.id] || '')}</textarea>
        </div>`).join('')
      : '<p class="q" style="color:var(--muted)">A starting skill — no prerequisites.</p>';
    const mis = state.misconceptions[s.id] || {};
    return `<div class="card" id="card-${esc(s.id)}">
      <div class="card-head">
        <h3>${esc(s.title)}</h3>
        <p class="stmt">${esc(s.statement)}</p>
        <span class="sid">${esc(s.id)} · ${esc(s.band)} · layer ${s.layer}</span>
      </div>
      <div class="block">
        <div class="block-label">Prerequisite rationales <span class="req">${ins.length} edge${ins.length === 1 ? '' : 's'} need a human</span><span class="done-tick" data-tick="rat|${esc(s.id)}">✓ done</span></div>
        ${edgesHtml}
      </div>
      <div class="block">
        <div class="block-label">Misconception this skill corrects <span class="req">names the wrong reading</span><span class="done-tick" data-tick="mis|${esc(s.id)}">✓ done</span></div>
        <p class="given">Current repair note (starting point, not a named misconception): <b>${esc(s.repair || '—')}</b></p>
        <div class="two">
          <div>
            <label for="mis-d-${esc(s.id)}">The wrong reading (what a learner mistakenly believes)</label>
            <textarea id="mis-d-${esc(s.id)}" rows="2" data-mis="${esc(s.id)}|description" placeholder="Leave blank until an educator names the wrong model.">${esc(mis.description || '')}</textarea>
          </div>
          <div>
            <label for="mis-s-${esc(s.id)}">The signal (what a learner does when they hold it)</label>
            <textarea id="mis-s-${esc(s.id)}" rows="2" data-mis="${esc(s.id)}|signal" placeholder="Leave blank until an educator names the observable.">${esc(mis.signal || '')}</textarea>
          </div>
        </div>
      </div>
    </div>`;
  }

  let saveTimer;
  function bind(DATA, state, KEY) {
    const root = $('cards');
    const persist = () => {
      clearTimeout(saveTimer);
      saveTimer = setTimeout(() => {
        localStorage.setItem(KEY, JSON.stringify(state));
        const s = $('saved');
        s.textContent = 'saved';
        setTimeout(() => { s.textContent = ''; }, 1200);
        refresh(DATA, state);
      }, 250);
    };
    root.querySelectorAll('[data-rat]').forEach((t) => {
      t.addEventListener('input', () => { state.rationales[t.dataset.rat] = t.value; persist(); });
    });
    root.querySelectorAll('[data-mis]').forEach((t) => {
      t.addEventListener('input', () => {
        const [sid, field] = t.dataset.mis.split('|');
        state.misconceptions[sid] = state.misconceptions[sid] || {};
        state.misconceptions[sid][field] = t.value;
        persist();
      });
    });
  }

  function refresh(DATA, state) {
    const rat = DATA.edges.filter((e) => (state.rationales[e.id] || '').trim()).length;
    const mis = DATA.skills.filter((s) => {
      const m = state.misconceptions[s.id];
      return m && (m.description || '').trim() && (m.signal || '').trim();
    }).length;
    $('p-rat').textContent = rat;
    $('p-mis').textContent = mis;
    document.querySelectorAll('[data-tick]').forEach((t) => {
      const [k, id] = t.dataset.tick.split('|');
      let ok = false;
      if (k === 'rat') {
        const skill = DATA.skills.find((s) => s.id === id);
        const ins = skill?.incoming || [];
        ok = ins.length > 0 && ins.every((e) => (state.rationales[e.id] || '').trim());
      } else {
        const m = state.misconceptions[id];
        ok = m && (m.description || '').trim() && (m.signal || '').trim();
      }
      t.classList.toggle('on', ok);
    });
  }

  async function exportJson(DATA, state) {
    const edgeRationales = {};
    for (const [key, text] of Object.entries(state.rationales || {})) {
      const trimmed = String(text || '').trim();
      if (trimmed && !key.startsWith('example-')) edgeRationales[key] = trimmed;
    }
    const misconceptions = {};
    for (const [skill, m] of Object.entries(state.misconceptions || {})) {
      if (!skill.startsWith('fnd-')) continue;
      const description = String(m?.description || '').trim();
      const signal = String(m?.signal || '').trim();
      if (description && signal) misconceptions[skill] = { description, signal };
    }
    const out = {
      workbench: 'jla-educator-audit',
      graphVersion: DATA.graphVersion,
      exportedAt: new Date().toISOString(),
      edgeRationales,
      encompassingWeights: {},
      misconceptions,
      coverageDecisions: {}
    };
    const json = JSON.stringify(out, null, 2);
    let via = '';
    try {
      const blob = new Blob([json], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `jla-starter-edge-audit-${DATA.graphVersion}-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(a.href);
      via = 'downloaded';
    } catch { /* sandboxed viewers block downloads */ }
    try {
      await navigator.clipboard.writeText(json);
      via = via ? via + ' + copied' : 'copied to clipboard';
    } catch { /* clipboard may be blocked */ }
    const s = $('saved');
    s.textContent = via ? ('exported — ' + via) : 'export ready';
    setTimeout(() => { s.textContent = ''; }, 2600);
  }
}());
