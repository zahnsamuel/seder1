#!/usr/bin/env node
// Generate the educator-audit workbench: a self-contained HTML tool that shows the frozen 49-skill
// graph and lets 3-5 educators fill in exactly the pedagogical judgments the software deliberately
// leaves empty (docs/foundation-graph-schema.md) — edge rationales, encompassing weights, named
// misconceptions, and homes for the graduation skills the graph doesn't yet cover. Entries autosave
// to the browser and export as JSON that folds straight back into the graph data.
//
//   node scripts/build-audit-workbench.mjs   (npm run graph:workbench)  ->  docs/educator-audit-workbench.html
import { readFileSync, writeFileSync } from 'node:fs';

const read = (p) => JSON.parse(readFileSync(new URL(`../${p}`, import.meta.url), 'utf8'));
const graph = read('data/foundation-skill-graph.json');
const edgeLayer = read('data/foundation-skill-edges.json');
const gradMap = read('data/graduation-skill-map.json').map;
const titleOf = new Map(graph.skills.map((s) => [s.id, s.title]));
const layerOf = new Map(graph.skills.map((s) => [s.id, s.layer]));

const skills = graph.skills.map((s) => ({
  id: s.id, layer: s.layer, title: s.title, statement: s.statement,
  teachingMove: s.teachingMove, repair: s.repair
}));

const edges = edgeLayer.edges.filter((e) => e.type === 'prerequisite').map((e) => ({
  id: `${e.from}::${e.to}`,
  from: e.from, to: e.to,
  fromTitle: titleOf.get(e.from) || e.from,
  toTitle: titleOf.get(e.to) || e.to,
  weight: e.encompassing?.weight ?? 1
}));

const approximate = Object.entries(gradMap)
  .filter(([, m]) => m.graphSkill && m.confidence === 'approximate')
  .map(([gradId, m]) => ({ gradId, graphSkill: m.graphSkill, graphTitle: titleOf.get(m.graphSkill) || m.graphSkill, note: m.note }));

const unmapped = Object.entries(gradMap)
  .filter(([, m]) => !m.graphSkill)
  .map(([gradId, m]) => ({ gradId, note: m.note }));

const DATA = {
  generatedAt: new Date().toISOString().slice(0, 10),
  graphVersion: graph.version,
  layers: (graph.layers || []).map((l) => ({ n: l.n, title: l.title })),
  skills, edges, approximate, unmapped,
  counts: { skills: skills.length, edges: edges.length, misconceptions: skills.length, approximate: approximate.length, unmapped: unmapped.length }
};

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Educator Audit Workbench — JLA Knowledge Graph</title>
<style>
:root{
  --ground:#f4f7f9; --surface:#fff; --surface-2:#eef3f6; --ink:#16232d; --muted:#576975; --faint:#8496a2;
  --hairline:#d7dfe5; --hairline-2:#e6ecf0; --primary:#1f4e6b;
  --done:#2e7d5b; --todo:#946717; --gap:#456388;
  --done-bg:#e5f0ea; --todo-bg:#f5eede; --gap-bg:#e8eef4;
  --field:#fff; --field-border:#c8d3db;
  --shadow:0 1px 2px rgba(20,40,55,.05),0 6px 22px rgba(20,40,55,.05);
}
@media (prefers-color-scheme:dark){:root{
  --ground:#0e151b; --surface:#151f27; --surface-2:#1b2731; --ink:#e8eef2; --muted:#9aabb6; --faint:#6d818e;
  --hairline:#26333d; --hairline-2:#202c35; --primary:#77aacb;
  --done:#5ec392; --todo:#d6ab5c; --gap:#83a6cd;
  --done-bg:#132a20; --todo-bg:#2a2410; --gap-bg:#152230;
  --field:#0f1820; --field-border:#33434e; --shadow:0 1px 2px rgba(0,0,0,.3),0 8px 30px rgba(0,0,0,.28);
}}
:root[data-theme="light"]{--ground:#f4f7f9;--surface:#fff;--surface-2:#eef3f6;--ink:#16232d;--muted:#576975;--faint:#8496a2;--hairline:#d7dfe5;--hairline-2:#e6ecf0;--primary:#1f4e6b;--done:#2e7d5b;--todo:#946717;--gap:#456388;--done-bg:#e5f0ea;--todo-bg:#f5eede;--gap-bg:#e8eef4;--field:#fff;--field-border:#c8d3db}
:root[data-theme="dark"]{--ground:#0e151b;--surface:#151f27;--surface-2:#1b2731;--ink:#e8eef2;--muted:#9aabb6;--faint:#6d818e;--hairline:#26333d;--hairline-2:#202c35;--primary:#77aacb;--done:#5ec392;--todo:#d6ab5c;--gap:#83a6cd;--done-bg:#132a20;--todo-bg:#2a2410;--gap-bg:#152230;--field:#0f1820;--field-border:#33434e}
*{box-sizing:border-box}
body{margin:0;background:var(--ground);color:var(--ink);font:400 15.5px/1.6 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,system-ui,sans-serif;-webkit-font-smoothing:antialiased}
.serif{font-family:"Iowan Old Style","Palatino Linotype",Palatino,Georgia,serif}
.mono{font-family:ui-monospace,"SF Mono",Menlo,Consolas,monospace}
.wrap{max-width:960px;margin:0 auto;padding:0 22px}
h1{font-family:"Iowan Old Style",Palatino,Georgia,serif;font-weight:600;font-size:1.9rem;letter-spacing:-.01em;margin:0}
h2{font-family:"Iowan Old Style",Palatino,Georgia,serif;font-weight:600;font-size:1.35rem;margin:0}
.eyebrow{font-family:ui-monospace,Menlo,monospace;font-size:11.5px;letter-spacing:.2em;text-transform:uppercase;color:var(--primary);font-weight:600}
a{color:var(--primary)}

/* sticky progress bar */
.bar{position:sticky;top:0;z-index:20;background:color-mix(in srgb,var(--surface) 92%,transparent);backdrop-filter:blur(8px);border-bottom:1px solid var(--hairline)}
.bar-inner{max-width:960px;margin:0 auto;padding:11px 22px;display:flex;align-items:center;gap:16px;flex-wrap:wrap}
.bar .title{font-family:"Iowan Old Style",Georgia,serif;font-weight:600;font-size:15px;margin-right:auto}
.stat{display:flex;align-items:center;gap:7px;font-family:ui-monospace,Menlo,monospace;font-size:12px;color:var(--muted);font-variant-numeric:tabular-nums}
.stat b{color:var(--ink);font-weight:700}
.stat .k{width:8px;height:8px;border-radius:50%}
.k.done{background:var(--done)}.k.todo{background:var(--todo)}.k.gap{background:var(--gap)}
button.export{font:600 12.5px ui-monospace,Menlo,monospace;letter-spacing:.02em;color:#fff;background:var(--primary);border:0;border-radius:8px;padding:8px 13px;cursor:pointer}
button.export:hover{filter:brightness(1.08)}
button.export:focus-visible{outline:3px solid var(--todo);outline-offset:2px}

header.top{padding:38px 0 8px}
header.top p.lede{color:var(--muted);max-width:66ch;margin:.7rem 0 0;font-size:1.02rem}
.how{margin:20px 0 6px;padding:16px 18px;background:var(--surface-2);border:1px solid var(--hairline);border-radius:12px;font-size:.95rem;color:var(--muted)}
.how b{color:var(--ink)}

/* graph map */
.map-wrap{margin:24px 0 8px;background:var(--surface);border:1px solid var(--hairline);border-radius:14px;box-shadow:var(--shadow);overflow:hidden}
.map-head{display:flex;align-items:center;gap:12px;padding:13px 18px;border-bottom:1px solid var(--hairline-2)}
.map-head .legend{margin-left:auto;display:flex;gap:14px;font-size:11.5px;color:var(--muted)}
.map-head .legend span{display:inline-flex;align-items:center;gap:6px}
.map-scroll{overflow-x:auto}
svg.map{display:block;min-width:640px}
svg.map .node{cursor:pointer}
svg.map .node circle{transition:r .1s}
svg.map text.lyr{font:600 10px ui-monospace,monospace;fill:var(--faint);letter-spacing:.08em}

section.layer{margin:34px 0 0}
.layer-head{display:flex;align-items:baseline;gap:12px;margin:0 0 12px;padding-bottom:8px;border-bottom:1px solid var(--hairline)}
.layer-head .num{font-family:ui-monospace,Menlo,monospace;font-size:12px;color:var(--primary);font-weight:700}
.layer-head small{color:var(--faint);font-size:12px;margin-left:auto;font-family:ui-monospace,monospace}

.card{background:var(--surface);border:1px solid var(--hairline);border-radius:13px;box-shadow:var(--shadow);margin:0 0 14px;overflow:hidden;scroll-margin-top:70px}
.card-head{padding:15px 18px;border-bottom:1px solid var(--hairline-2)}
.card-head h3{margin:0;font-size:1.05rem;font-weight:650;letter-spacing:-.005em}
.card-head .stmt{color:var(--muted);font-size:.92rem;margin:.25rem 0 0}
.card-head .sid{font-family:ui-monospace,Menlo,monospace;font-size:11px;color:var(--faint)}
.block{padding:14px 18px;border-top:1px solid var(--hairline-2)}
.block:first-child{border-top:0}
.block-label{font-family:ui-monospace,Menlo,monospace;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--todo);font-weight:700;display:flex;align-items:center;gap:8px}
.block-label.mis{color:var(--gap)}
.block-label .req{font-size:10px;color:var(--faint);font-weight:600;letter-spacing:.04em}
.edge{margin-top:12px;padding-top:12px;border-top:1px dashed var(--hairline)}
.edge:first-of-type{border-top:0;margin-top:8px;padding-top:0}
.edge .q{font-size:.94rem;margin:0 0 7px}
.edge .q b{color:var(--ink)}
.edge .q .arrow{color:var(--todo);font-weight:700;padding:0 4px}
textarea,input[type=text]{width:100%;font:400 14px/1.5 -apple-system,system-ui,sans-serif;color:var(--ink);background:var(--field);border:1px solid var(--field-border);border-radius:8px;padding:9px 11px;resize:vertical}
textarea:focus,input:focus{outline:2px solid var(--primary);outline-offset:-1px;border-color:var(--primary)}
textarea::placeholder{color:var(--faint)}
.weight{display:flex;align-items:center;gap:12px;margin-top:9px}
.weight label{font-size:12px;color:var(--muted);white-space:nowrap}
.weight input[type=range]{flex:1;accent-color:var(--primary)}
.weight .val{font-family:ui-monospace,Menlo,monospace;font-size:13px;font-weight:700;color:var(--primary);width:2.6em;text-align:right;font-variant-numeric:tabular-nums}
.given{font-size:.88rem;color:var(--muted);margin:0 0 10px;padding:8px 11px;background:var(--surface-2);border-radius:8px}
.given b{color:var(--ink)}
.two{display:grid;gap:10px}
.two label{font-size:12px;color:var(--muted);display:block;margin:0 0 4px;font-weight:600}
.done-tick{margin-left:auto;color:var(--done);font-size:11px;font-weight:700;font-family:ui-monospace,monospace;opacity:0;transition:opacity .15s}
.done-tick.on{opacity:1}

/* coverage gaps */
.gaps{background:var(--surface);border:1px solid var(--hairline);border-radius:13px;box-shadow:var(--shadow);overflow:hidden}
.gap-row{padding:15px 18px;border-top:1px solid var(--hairline-2)}
.gap-row:first-child{border-top:0}
.gap-row .gid{font-family:ui-monospace,Menlo,monospace;font-size:12px;font-weight:700;color:var(--gap)}
.gap-row .note{color:var(--muted);font-size:.92rem;margin:.2rem 0 9px}
footer{max-width:960px;margin:40px auto 0;padding:26px 22px 60px;border-top:1px solid var(--hairline);color:var(--faint);font-size:12px;display:flex;gap:8px 16px;flex-wrap:wrap}
.saved{font-family:ui-monospace,monospace;font-size:11px;color:var(--done)}
</style>
</head>
<body>
<script type="application/json" id="graph-data">${JSON.stringify(DATA)}</script>

<div class="bar"><div class="bar-inner">
  <span class="title serif">Educator Audit &middot; JLA Graph</span>
  <span class="stat"><span class="k done"></span>Rationales <b id="p-rat">0</b>/<span id="t-rat"></span></span>
  <span class="stat"><span class="k gap"></span>Misconceptions <b id="p-mis">0</b>/<span id="t-mis"></span></span>
  <span class="stat"><span class="k todo"></span>Gaps placed <b id="p-gap">0</b>/<span id="t-gap"></span></span>
  <span class="saved" id="saved"></span>
  <button class="export" id="export">Export JSON ↓</button>
</div></div>

<header class="top"><div class="wrap">
  <p class="eyebrow">Frozen v<span id="ver"></span> &middot; for educator review</p>
  <h1>Turn the graph's assumptions into reviewed claims.</h1>
  <p class="lede">The software has built the <b>structure</b> of this Jewish-learning skill graph and left every <b>pedagogical judgment</b> to you — on purpose. Work through the skills below and fill in <em>why</em> each prerequisite holds, <em>what wrong reading</em> each skill corrects, and where the missing skills belong. Your entries autosave in this browser; <b>Export JSON</b> hands them back to fold into the graph.</p>
  <div class="how"><b>How to read a card.</b> Each skill shows the moves it depends on (its prerequisites). For each, write the reason an educator would assert it must come first, and set how much practising the skill re-exercises that prerequisite (its <em>encompassing weight</em>). Then name the misconception the skill exists to correct. Nothing here is graded — disagreement and "this edge is wrong" are exactly what the audit is for.</div>
</div></header>

<div class="wrap">
  <div class="map-wrap">
    <div class="map-head"><span class="eyebrow">The graph &middot; <span id="map-n"></span> skills, <span id="map-e"></span> prerequisites</span>
      <span class="legend"><span><span class="k done" style="display:inline-block;width:8px;height:8px;border-radius:50%"></span> rationalized</span><span><span class="k todo" style="display:inline-block;width:8px;height:8px;border-radius:50%"></span> partial</span><span><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:var(--faint)"></span> untouched</span></span>
    </div>
    <div class="map-scroll"><svg class="map" id="map"></svg></div>
  </div>

  <div id="cards"></div>

  <section class="layer"><div class="layer-head"><h2>Coverage gaps</h2><small class="mono">graduation skills with no graph home</small></div>
    <p style="color:var(--muted);font-size:.95rem;margin:0 0 14px;max-width:70ch">These skills exist in the graduation slice but the argument-shaped foundation graph has no node for them — the known under-coverage of midrash, tefillah, and reading-as-navigation. For each: does it map to an existing skill, or does the graph need a new one?</p>
    <div class="gaps" id="gaps"></div>
  </section>
</div>

<footer>
  <span class="mono">JLA educator-audit workbench</span><span>·</span>
  <span>graph <span id="ver2"></span> · generated <span id="gen"></span></span><span>·</span>
  <span>entries stay in this browser until you export</span>
</footer>

<script>
const DATA = JSON.parse(document.getElementById('graph-data').textContent);
const KEY = 'jla-audit-' + DATA.graphVersion;
const esc = (s) => String(s==null?'':s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let state = load();
function load(){ try{ return JSON.parse(localStorage.getItem(KEY)) || fresh(); }catch(e){ return fresh(); } }
function fresh(){ return { rationales:{}, weights:{}, misconceptions:{}, gaps:{} }; }
let saveTimer;
function save(){ clearTimeout(saveTimer); saveTimer=setTimeout(()=>{ localStorage.setItem(KEY, JSON.stringify(state)); const s=document.getElementById('saved'); s.textContent='saved'; setTimeout(()=>s.textContent='',1200); },250); }

const edgesTo = {}; for(const e of DATA.edges){ (edgesTo[e.to]=edgesTo[e.to]||[]).push(e); }

// ---- fill headers ----
document.getElementById('ver').textContent = DATA.graphVersion;
document.getElementById('ver2').textContent = DATA.graphVersion;
document.getElementById('gen').textContent = DATA.generatedAt;
document.getElementById('map-n').textContent = DATA.counts.skills;
document.getElementById('map-e').textContent = DATA.counts.edges;
document.getElementById('t-rat').textContent = DATA.counts.edges;
document.getElementById('t-mis').textContent = DATA.counts.misconceptions;
document.getElementById('t-gap').textContent = DATA.counts.approximate + DATA.counts.unmapped;

// ---- graph map ----
function drawMap(){
  const layers = DATA.layers.length ? DATA.layers.map(l=>l.n) : [...new Set(DATA.skills.map(s=>s.layer))].sort((a,b)=>a-b);
  const byLayer = {}; for(const s of DATA.skills){ (byLayer[s.layer]=byLayer[s.layer]||[]).push(s); }
  const W=880, rowH=54, padX=40, padTop=26, padBot=20;
  const H = padTop + padBot + layers.length*rowH;
  const pos = {};
  layers.forEach((L,li)=>{ const row=byLayer[L]||[]; const y=padTop+li*rowH+18;
    row.forEach((s,i)=>{ const x = padX + (row.length===1? (W-2*padX)/2 : i*((W-2*padX)/(row.length-1))); pos[s.id]={x,y}; });
  });
  const svg=document.getElementById('map'); svg.setAttribute('viewBox',\`0 0 \${W} \${H}\`); svg.setAttribute('height',H);
  let g='';
  // edges
  for(const e of DATA.edges){ const a=pos[e.from], b=pos[e.to]; if(!a||!b) continue;
    g+=\`<path d="M\${a.x} \${a.y} C \${a.x} \${(a.y+b.y)/2}, \${b.x} \${(a.y+b.y)/2}, \${b.x} \${b.y}" fill="none" stroke="var(--hairline)" stroke-width="1"/>\`; }
  // layer labels
  layers.forEach((L,li)=>{ const t=(DATA.layers.find(x=>x.n===L)||{}).title||('Layer '+L); g+=\`<text class="lyr" x="6" y="\${padTop+li*rowH+22}">\${L}</text>\`; });
  // nodes
  for(const s of DATA.skills){ const p=pos[s.id]; if(!p) continue;
    g+=\`<g class="node" data-id="\${s.id}"><title>\${esc(s.title)}</title><circle cx="\${p.x}" cy="\${p.y}" r="6" fill="var(--faint)" stroke="var(--surface)" stroke-width="1.5"/></g>\`; }
  svg.innerHTML=g;
  svg.querySelectorAll('.node').forEach(n=>n.addEventListener('click',()=>{ const el=document.getElementById('card-'+n.dataset.id); if(el){ el.scrollIntoView({behavior:'smooth',block:'center'}); el.style.outline='2px solid var(--primary)'; setTimeout(()=>el.style.outline='',1200);} }));
  updateMapColors();
}
function nodeStatus(sid){ const ins=edgesTo[sid]||[]; if(!ins.length) return 'none'; const done=ins.filter(e=>(state.rationales[e.id]||'').trim()).length; return done===0?'none':done===ins.length?'done':'partial'; }
function updateMapColors(){ document.querySelectorAll('#map .node').forEach(n=>{ const st=nodeStatus(n.dataset.id); const c={done:'var(--done)',partial:'var(--todo)',none:'var(--faint)'}[st]; const circ=n.querySelector('circle'); circ.setAttribute('fill',c); circ.setAttribute('r', st==='done'?7:6); }); }

// ---- review cards ----
function cards(){
  const layers = [...new Set(DATA.skills.map(s=>s.layer))].sort((a,b)=>a-b);
  const root=document.getElementById('cards'); let h='';
  for(const L of layers){ const title=(DATA.layers.find(x=>x.n===L)||{}).title||''; const row=DATA.skills.filter(s=>s.layer===L);
    h+=\`<section class="layer"><div class="layer-head"><span class="num">LAYER \${L}</span><h2>\${esc(title)}</h2><small>\${row.length} skill\${row.length>1?'s':''}</small></div>\`;
    for(const s of row){ h+=skillCard(s); }
    h+='</section>';
  }
  root.innerHTML=h;
  root.querySelectorAll('[data-rat]').forEach(t=>{ t.value=state.rationales[t.dataset.rat]||''; t.addEventListener('input',()=>{ state.rationales[t.dataset.rat]=t.value; save(); refresh(); }); });
  root.querySelectorAll('[data-w]').forEach(r=>{ const id=r.dataset.w; r.value = state.weights[id] ?? r.dataset.default; r.nextElementSibling.textContent=Number(r.value).toFixed(2); r.addEventListener('input',()=>{ state.weights[id]=Number(r.value); r.nextElementSibling.textContent=Number(r.value).toFixed(2); save(); }); });
  root.querySelectorAll('[data-mis]').forEach(t=>{ const [sid,field]=t.dataset.mis.split('|'); state.misconceptions[sid]=state.misconceptions[sid]||{}; t.value=state.misconceptions[sid][field]||''; t.addEventListener('input',()=>{ state.misconceptions[sid][field]=t.value; save(); refresh(); }); });
}
function skillCard(s){
  const ins = edgesTo[s.id]||[];
  let edgesHtml = ins.length ? ins.map(e=>\`
    <div class="edge">
      <p class="q">Why must <b>\${esc(e.fromTitle)}</b> <span class="arrow">→</span> come before <b>\${esc(e.toTitle)}</b>?</p>
      <textarea rows="2" data-rat="\${e.id}" placeholder="An educator's reason this prerequisite holds…"></textarea>
      <div class="weight"><label>Encompassing — how much does practising this skill re-exercise "\${esc(e.fromTitle)}"?</label>
        <input type="range" min="0" max="1" step="0.05" data-w="\${e.id}" data-default="\${e.weight}"><span class="val"></span></div>
    </div>\`).join('') : '<p class="q" style="color:var(--faint)">A starting skill — no prerequisites.</p>';
  return \`<div class="card" id="card-\${s.id}">
    <div class="card-head"><h3>\${esc(s.title)}</h3><p class="stmt">\${esc(s.statement)}</p><span class="sid">\${esc(s.id)} · layer \${s.layer}</span></div>
    <div class="block"><div class="block-label">Prerequisite rationales <span class="req">\${ins.length} edge\${ins.length===1?'':'s'}</span><span class="done-tick" data-tick="rat-\${s.id}">✓ done</span></div>\${edgesHtml}</div>
    <div class="block"><div class="block-label mis">Misconception this skill corrects <span class="req">names the wrong reading</span><span class="done-tick" data-tick="mis-\${s.id}">✓ done</span></div>
      <p class="given">Current repair note (starting point): <b>\${esc(s.repair||'—')}</b></p>
      <div class="two">
        <div><label>The wrong reading (what a learner mistakenly believes)</label><textarea rows="2" data-mis="\${s.id}|description" placeholder="e.g. treats every source as a ruling to apply…"></textarea></div>
        <div><label>The signal (what a learner does when they hold it)</label><textarea rows="2" data-mis="\${s.id}|signal" placeholder="e.g. skips the question and looks for a verdict…"></textarea></div>
      </div>
    </div>
  </div>\`;
}

// ---- coverage gaps ----
function gaps(){
  const root=document.getElementById('gaps'); let h='';
  for(const a of DATA.approximate){ h+=\`<div class="gap-row"><span class="gid">\${esc(a.gradId)}</span> — approximate match to <b>\${esc(a.graphTitle)}</b>
    <p class="note">\${esc(a.note)}</p>
    <label style="font-size:12px;color:var(--muted);font-weight:600;display:block;margin-bottom:4px">Confirm, correct the target skill id, or say "needs a new skill":</label>
    <input type="text" data-gap="\${esc(a.gradId)}" placeholder="confirm · or a graph skill id · or 'new skill: …'"></div>\`; }
  for(const u of DATA.unmapped){ h+=\`<div class="gap-row"><span class="gid">\${esc(u.gradId)}</span> — no graph home
    <p class="note">\${esc(u.note)}</p>
    <label style="font-size:12px;color:var(--muted);font-weight:600;display:block;margin-bottom:4px">Which graph skill should own this, or does the graph need a new node?</label>
    <input type="text" data-gap="\${esc(u.gradId)}" placeholder="a graph skill id · or 'new skill: …'"></div>\`; }
  root.innerHTML=h;
  root.querySelectorAll('[data-gap]').forEach(i=>{ i.value=state.gaps[i.dataset.gap]||''; i.addEventListener('input',()=>{ state.gaps[i.dataset.gap]=i.value; save(); refresh(); }); });
}

// ---- progress ----
function refresh(){
  const rat = DATA.edges.filter(e=>(state.rationales[e.id]||'').trim()).length;
  const mis = DATA.skills.filter(s=>{ const m=state.misconceptions[s.id]; return m && (m.description||'').trim() && (m.signal||'').trim(); }).length;
  const gap = Object.values(state.gaps).filter(v=>(v||'').trim()).length;
  document.getElementById('p-rat').textContent=rat;
  document.getElementById('p-mis').textContent=mis;
  document.getElementById('p-gap').textContent=gap;
  document.querySelectorAll('[data-tick]').forEach(t=>{ const [k,id]=t.dataset.tick.split('-'); let ok=false;
    if(k==='rat'){ const ins=edgesTo[id]||[]; ok=ins.length>0 && ins.every(e=>(state.rationales[e.id]||'').trim()); }
    else { const m=state.misconceptions[id]; ok=m && (m.description||'').trim() && (m.signal||'').trim(); }
    t.classList.toggle('on',ok); });
  updateMapColors();
}

// ---- export ----
document.getElementById('export').addEventListener('click',()=>{
  const out={ workbench:'jla-educator-audit', graphVersion:DATA.graphVersion, exportedAt:new Date().toISOString(),
    edgeRationales:state.rationales, encompassingWeights:state.weights, misconceptions:state.misconceptions, coverageDecisions:state.gaps };
  const blob=new Blob([JSON.stringify(out,null,2)],{type:'application/json'});
  const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=\`jla-audit-\${DATA.graphVersion}-\${new Date().toISOString().slice(0,10)}.json\`; a.click(); URL.revokeObjectURL(a.href);
});

drawMap(); cards(); gaps(); refresh();
</script>
</body>
</html>
`;

writeFileSync(new URL('../docs/educator-audit-workbench.html', import.meta.url), html);
console.log(`Wrote docs/educator-audit-workbench.html`);
console.log(`  ${DATA.counts.skills} skills · ${DATA.counts.edges} edge rationales · ${DATA.counts.misconceptions} misconceptions · ${DATA.counts.approximate + DATA.counts.unmapped} coverage gaps`);
