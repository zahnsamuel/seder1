#!/usr/bin/env node
// Generate the ITEM-AUTHORING workbench: a self-contained HTML tool that walks all 53 graph skills and
// lets an author (educator or the team) write the graded item banks the software cannot invent — the
// >=3-items-per-skill gap (docs/foundation-graph-schema.md step 10) the assessment builder leaves open.
// Each skill card shows its statement, the check it must test, its teaching move, and its real source
// contexts (as a datalist), then provides item slots: a source ref, a stem, up to four choices with the
// correct one marked, and feedback. Entries autosave in the browser and export as JSON that folds back
// through scripts/import-authored-items.mjs (npm run graph:import-items). This is the item sibling of the
// educator-audit workbench; it prepares the human work, it does not fabricate it.
//
//   node scripts/build-item-authoring-worksheet.mjs   (npm run graph:authoring)  ->  docs/item-authoring-workbench.html
import { readFileSync, writeFileSync } from 'node:fs';

const read = (p) => JSON.parse(readFileSync(new URL(`../${p}`, import.meta.url), 'utf8'));
const graph = read('data/foundation-skill-graph.json');
const contexts = read('data/foundation-content-contexts.json').contexts || [];
const authored = read('data/foundation-authored-items.json').items || {};

const refsBySkill = {};
for (const c of contexts) { (refsBySkill[c.skill] = refsBySkill[c.skill] || []); if (!refsBySkill[c.skill].includes(c.ref)) refsBySkill[c.skill].push(c.ref); }

const skills = graph.skills.map((s) => ({
  id: s.id, layer: s.layer, title: s.title, statement: s.statement,
  check: (s.checks || [])[0] || '', teachingMove: s.teachingMove || '',
  refs: (refsBySkill[s.id] || []).slice(0, 8),
  have: (authored[s.id] || []).length
}));

const DATA = {
  graphVersion: graph.version,
  target: 3,
  layers: (graph.layers || []).map((l) => ({ n: l.n, title: l.title })),
  skills,
  seed: authored // pre-load any items already imported, so a re-author starts from what exists
};

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Item Authoring Workbench — JLA Knowledge Graph</title>
<style>
:root{--ground:#f4f7f9;--surface:#fff;--surface-2:#eef3f6;--ink:#16232d;--muted:#576975;--faint:#8496a2;--hairline:#d7dfe5;--hairline-2:#e6ecf0;--primary:#1f4e6b;--done:#2e7d5b;--todo:#946717;--done-bg:#e5f0ea;--todo-bg:#f5eede;--field:#fff;--field-border:#c8d3db;--shadow:0 1px 2px rgba(20,40,55,.05),0 6px 22px rgba(20,40,55,.05)}
@media (prefers-color-scheme:dark){:root{--ground:#0e151b;--surface:#151f27;--surface-2:#1b2731;--ink:#e8eef2;--muted:#9aabb6;--faint:#6d818e;--hairline:#26333d;--hairline-2:#202c35;--primary:#77aacb;--done:#5ec392;--todo:#d6ab5c;--done-bg:#132a20;--todo-bg:#2a2410;--field:#0f1820;--field-border:#33434e;--shadow:0 1px 2px rgba(0,0,0,.3),0 8px 30px rgba(0,0,0,.28)}}
:root[data-theme="light"]{--ground:#f4f7f9;--surface:#fff;--surface-2:#eef3f6;--ink:#16232d;--muted:#576975;--faint:#8496a2;--hairline:#d7dfe5;--hairline-2:#e6ecf0;--primary:#1f4e6b;--done:#2e7d5b;--todo:#946717;--done-bg:#e5f0ea;--todo-bg:#f5eede;--field:#fff;--field-border:#c8d3db}
:root[data-theme="dark"]{--ground:#0e151b;--surface:#151f27;--surface-2:#1b2731;--ink:#e8eef2;--muted:#9aabb6;--faint:#6d818e;--hairline:#26333d;--hairline-2:#202c35;--primary:#77aacb;--done:#5ec392;--todo:#d6ab5c;--done-bg:#132a20;--todo-bg:#2a2410;--field:#0f1820;--field-border:#33434e}
*{box-sizing:border-box}
body{margin:0;background:var(--ground);color:var(--ink);font:400 15.5px/1.6 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,system-ui,sans-serif;-webkit-font-smoothing:antialiased}
.wrap{max-width:900px;margin:0 auto;padding:0 22px}
h1{font-family:"Iowan Old Style",Palatino,Georgia,serif;font-weight:600;font-size:1.9rem;margin:0}
h2{font-family:"Iowan Old Style",Palatino,Georgia,serif;font-weight:600;font-size:1.3rem;margin:0}
.eyebrow{font-family:ui-monospace,Menlo,monospace;font-size:11.5px;letter-spacing:.2em;text-transform:uppercase;color:var(--primary);font-weight:600}
a{color:var(--primary)}
.bar{position:sticky;top:0;z-index:20;background:color-mix(in srgb,var(--surface) 92%,transparent);backdrop-filter:blur(8px);border-bottom:1px solid var(--hairline)}
.bar-inner{max-width:900px;margin:0 auto;padding:11px 22px;display:flex;align-items:center;gap:16px;flex-wrap:wrap}
.bar .title{font-family:"Iowan Old Style",Georgia,serif;font-weight:600;font-size:15px;margin-right:auto}
.stat{display:flex;align-items:center;gap:7px;font-family:ui-monospace,Menlo,monospace;font-size:12px;color:var(--muted);font-variant-numeric:tabular-nums}
.stat b{color:var(--ink);font-weight:700}
.stat .k{width:8px;height:8px;border-radius:50%}.k.done{background:var(--done)}.k.todo{background:var(--todo)}
button.export{font:600 12.5px ui-monospace,Menlo,monospace;color:#fff;background:var(--primary);border:0;border-radius:8px;padding:8px 13px;cursor:pointer}
button.export:hover{filter:brightness(1.08)}
button.export:focus-visible{outline:3px solid var(--todo);outline-offset:2px}
header.top{padding:34px 0 6px}
header.top p.lede{color:var(--muted);max-width:68ch;margin:.7rem 0 0}
.how{margin:18px 0 6px;padding:15px 17px;background:var(--surface-2);border:1px solid var(--hairline);border-radius:12px;font-size:.94rem;color:var(--muted)}
.how b{color:var(--ink)}
section.layer{margin:30px 0 0}
.layer-head{display:flex;align-items:baseline;gap:12px;margin:0 0 12px;padding-bottom:8px;border-bottom:1px solid var(--hairline)}
.layer-head .num{font-family:ui-monospace,Menlo,monospace;font-size:12px;color:var(--primary);font-weight:700}
.card{background:var(--surface);border:1px solid var(--hairline);border-radius:13px;box-shadow:var(--shadow);margin:0 0 14px;overflow:hidden;scroll-margin-top:70px}
.card-head{padding:15px 18px;border-bottom:1px solid var(--hairline-2);display:flex;flex-wrap:wrap;gap:6px 12px;align-items:baseline}
.card-head h3{margin:0;font-size:1.05rem;font-weight:650;flex:1 1 auto}
.card-head .count{font:700 11px ui-monospace,Menlo,monospace;padding:3px 9px;border-radius:999px;background:var(--todo-bg);color:var(--todo)}
.card-head .count.ok{background:var(--done-bg);color:var(--done)}
.card-head .stmt{flex-basis:100%;color:var(--muted);font-size:.92rem;margin:2px 0 0}
.card-head .sid{flex-basis:100%;font-family:ui-monospace,Menlo,monospace;font-size:11px;color:var(--faint)}
.guide{padding:11px 18px;border-bottom:1px solid var(--hairline-2);font-size:.9rem;color:var(--muted);background:var(--surface-2)}
.guide b{color:var(--ink)}
.items{padding:6px 18px 14px}
.item{border-top:1px dashed var(--hairline);padding:14px 0 4px}
.item:first-child{border-top:0}
.item .row{margin:0 0 9px}
.item label{display:block;font-size:12px;color:var(--muted);font-weight:600;margin:0 0 4px}
textarea,input[type=text]{width:100%;font:400 14px/1.5 -apple-system,system-ui,sans-serif;color:var(--ink);background:var(--field);border:1px solid var(--field-border);border-radius:8px;padding:8px 10px;resize:vertical}
textarea:focus,input:focus{outline:2px solid var(--primary);outline-offset:-1px;border-color:var(--primary)}
textarea::placeholder,input::placeholder{color:var(--faint)}
.choice-row{display:flex;align-items:center;gap:9px;margin:0 0 6px}
.choice-row input[type=radio]{flex:none;width:18px;height:18px;accent-color:var(--done)}
.choice-row .tag{font:600 10px ui-monospace,Menlo,monospace;color:var(--faint);width:64px;flex:none}
.item-actions{display:flex;gap:12px;align-items:center;margin:4px 0 0}
.item-actions button{font:600 11px ui-monospace,Menlo,monospace;background:none;border:0;color:var(--muted);cursor:pointer;padding:4px 0}
.item-actions button:hover{color:var(--ink)}
.additem{font:600 12px ui-monospace,Menlo,monospace;background:none;border:1px dashed var(--field-border);border-radius:8px;color:var(--primary);cursor:pointer;padding:8px 12px;margin:6px 0 0}
.pill{font:700 10px ui-monospace,Menlo,monospace;color:var(--done);margin-left:6px}
footer{max-width:900px;margin:38px auto 0;padding:24px 22px 60px;border-top:1px solid var(--hairline);color:var(--faint);font-size:12px}
.saved{font-family:ui-monospace,monospace;font-size:11px;color:var(--done)}
</style>
</head>
<body>
<script type="application/json" id="wb-data">${JSON.stringify(DATA)}</script>
<div class="bar"><div class="bar-inner">
  <span class="title">Item Authoring &middot; JLA Graph</span>
  <span class="stat"><span class="k done"></span>Banks complete <b id="p-banks">0</b>/<span id="t-skills"></span></span>
  <span class="stat"><span class="k todo"></span>Items written <b id="p-items">0</b></span>
  <span class="saved" id="saved"></span>
  <button class="export" id="export">Export JSON ↓</button>
</div></div>
<header class="top"><div class="wrap">
  <p class="eyebrow">Graph v<span id="ver"></span> &middot; item banks (step 10)</p>
  <h1>Write the graded items the graph can't invent.</h1>
  <p class="lede">Each skill needs a small bank of real retrieval items — a source, a question, and answer choices where the distractors are <b>plausible wrong readings</b>, not filler. The software derives a stopgap recognition item per skill; these authored items replace it. Aim for <b id="tgt"></b> per skill. Entries autosave here; <b>Export JSON</b> hands them to <span class="mono">npm run graph:import-items</span>.</p>
  <div class="how"><b>What makes a good item.</b> Ground it in one of the skill's real sources (listed per card). Write a stem that asks the learner to <em>make the move</em>, not recall a definition. Make each wrong choice a mistake a real learner makes — the misconception the skill exists to correct. Mark exactly one choice correct.</div>
</div></header>
<div class="wrap"><div id="cards"></div></div>
<footer><div class="mono">JLA item-authoring workbench · graph <span id="ver2"></span> · entries stay in this browser until you export</div></footer>
<script>
const DATA = JSON.parse(document.getElementById('wb-data').textContent);
const KEY = 'jla-items-' + DATA.graphVersion;
const esc = (s) => String(s==null?'':s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const CH = 4; // choice rows per item
function fresh(){ const items={}; for(const s of DATA.skills){ items[s.id] = (DATA.seed[s.id]||[]).map(seedItem); while(items[s.id].length < 1) items[s.id].push(blank()); } return { items }; }
function blank(){ return { sourceRef:'', stem:'', choices:['','','',''], correct:-1, feedback:'' }; }
function seedItem(it){ const choices=(it.choices||[]).slice(0,CH); while(choices.length<CH) choices.push(''); return { sourceRef:it.sourceRef||'', stem:it.stem||'', choices, correct:Number.isInteger(it.correct)?it.correct:-1, feedback:it.feedback||'' }; }
let state = load();
function load(){ try{ const s=JSON.parse(localStorage.getItem(KEY)); if(s&&s.items) return s; }catch(e){} return fresh(); }
let t; function save(){ clearTimeout(t); t=setTimeout(()=>{ localStorage.setItem(KEY,JSON.stringify(state)); const s=document.getElementById('saved'); s.textContent='saved'; setTimeout(()=>s.textContent='',1000); refresh(); },250); }

document.getElementById('ver').textContent=DATA.graphVersion;
document.getElementById('ver2').textContent=DATA.graphVersion;
document.getElementById('t-skills').textContent=DATA.skills.length;
document.getElementById('tgt').textContent=DATA.target;

function itemComplete(it){ const c=(it.choices||[]).map(x=>(x||'').trim()).filter(Boolean); return (it.stem||'').trim() && c.length>=2 && new Set(c).size===c.length && it.correct>=0 && (it.choices[it.correct]||'').trim(); }
function bankComplete(sid){ return (state.items[sid]||[]).filter(itemComplete).length >= DATA.target; }

function cards(){
  const layers=[...new Set(DATA.skills.map(s=>s.layer))].sort((a,b)=>a-b);
  const root=document.getElementById('cards'); let h='';
  for(const L of layers){ const title=(DATA.layers.find(x=>x.n===L)||{}).title||''; const row=DATA.skills.filter(s=>s.layer===L);
    h+='<section class="layer"><div class="layer-head"><span class="num">LAYER '+L+'</span><h2>'+esc(title)+'</h2></div>';
    for(const s of row) h+=skillCard(s);
    h+='</section>';
  }
  root.innerHTML=h;
  bind();
  refresh();
}
function skillCard(s){
  const list = s.refs.map(r=>'<option value="'+esc(r)+'">').join('');
  const items=(state.items[s.id]||[]).map((it,i)=>itemForm(s,it,i)).join('');
  return '<div class="card" id="card-'+s.id+'">'
    +'<div class="card-head"><h3>'+esc(s.title)+'</h3><span class="count" data-count="'+s.id+'">0/'+DATA.target+'</span>'
    +'<p class="stmt">'+esc(s.statement)+'</p><span class="sid">'+esc(s.id)+' · layer '+s.layer+'</span></div>'
    +'<div class="guide"><b>Test:</b> '+esc(s.check||s.statement)+' &nbsp;·&nbsp; <b>Teaching move:</b> '+esc(s.teachingMove||'—')+'</div>'
    +'<datalist id="ctx-'+s.id+'">'+list+'</datalist>'
    +'<div class="items" data-items="'+s.id+'">'+items+'</div>'
    +'<div style="padding:0 18px 16px"><button class="additem" data-add="'+s.id+'">+ add another item</button></div>'
    +'</div>';
}
function itemForm(s,it,i){
  const rows=[0,1,2,3].map(k=>'<div class="choice-row"><input type="radio" name="correct-'+s.id+'-'+i+'" data-correct="'+s.id+'|'+i+'|'+k+'"'+(it.correct===k?' checked':'')+' aria-label="mark choice '+(k+1)+' correct"><span class="tag">choice '+(k+1)+'</span><input type="text" data-ch="'+s.id+'|'+i+'|'+k+'" value="'+esc(it.choices[k]||'')+'" placeholder="'+(k<2?'a plausible reading':'(optional)')+'"></div>').join('');
  return '<div class="item">'
    +'<div class="row"><label>Source (from this skill\\'s real contexts, or your own)</label><input type="text" list="ctx-'+s.id+'" data-f="'+s.id+'|'+i+'|sourceRef" value="'+esc(it.sourceRef)+'" placeholder="e.g. Gemara Berakhot 2a"></div>'
    +'<div class="row"><label>Stem — ask the learner to make the move</label><textarea rows="2" data-f="'+s.id+'|'+i+'|stem" placeholder="Reading &lt;source&gt;, …?">'+esc(it.stem)+'</textarea></div>'
    +'<div class="row"><label>Choices — mark the one correct answer; distractors are real wrong readings</label>'+rows+'</div>'
    +'<div class="row"><label>Feedback (shown after answering)</label><textarea rows="1" data-f="'+s.id+'|'+i+'|feedback" placeholder="Why the answer is the move…">'+esc(it.feedback)+'</textarea></div>'
    +'<div class="item-actions"><button data-del="'+s.id+'|'+i+'">remove item</button></div>'
    +'</div>';
}
function bind(){
  const root=document.getElementById('cards');
  root.querySelectorAll('[data-f]').forEach(el=>el.addEventListener('input',()=>{ const [sid,i,f]=el.dataset.f.split('|'); state.items[sid][+i][f]=el.value; save(); }));
  root.querySelectorAll('[data-ch]').forEach(el=>el.addEventListener('input',()=>{ const [sid,i,k]=el.dataset.ch.split('|'); state.items[sid][+i].choices[+k]=el.value; save(); }));
  root.querySelectorAll('[data-correct]').forEach(el=>el.addEventListener('change',()=>{ const [sid,i,k]=el.dataset.correct.split('|'); state.items[sid][+i].correct=+k; save(); }));
  root.querySelectorAll('[data-add]').forEach(b=>b.addEventListener('click',()=>{ state.items[b.dataset.add].push(blank()); localStorage.setItem(KEY,JSON.stringify(state)); cards(); }));
  root.querySelectorAll('[data-del]').forEach(b=>b.addEventListener('click',()=>{ const [sid,i]=b.dataset.del.split('|'); state.items[sid].splice(+i,1); if(!state.items[sid].length) state.items[sid].push(blank()); localStorage.setItem(KEY,JSON.stringify(state)); cards(); }));
}
function refresh(){
  let banks=0, total=0;
  for(const s of DATA.skills){ const done=(state.items[s.id]||[]).filter(itemComplete).length; total+=done; const ok=done>=DATA.target; if(ok) banks++;
    const c=document.querySelector('[data-count="'+s.id+'"]'); if(c){ c.textContent=done+'/'+DATA.target; c.classList.toggle('ok',ok); } }
  document.getElementById('p-banks').textContent=banks;
  document.getElementById('p-items').textContent=total;
}
// Export: filter each item to its non-empty choices and remap the correct index; drop empty items and
// skills with none. The fold step (import-authored-items) re-validates before writing.
function exportItems(){
  const items={};
  for(const s of DATA.skills){ const out=[];
    for(const it of state.items[s.id]||[]){
      const kept=(it.choices||[]).map((t,i)=>({t:(t||'').trim(),i})).filter(x=>x.t);
      if(!(it.stem||'').trim() || kept.length<2) continue;
      const correct=kept.findIndex(x=>x.i===it.correct);
      out.push({ sourceRef:(it.sourceRef||'').trim(), stem:it.stem.trim(), choices:kept.map(x=>x.t), correct, feedback:(it.feedback||'').trim() });
    }
    if(out.length) items[s.id]=out;
  }
  return { workbench:'jla-item-authoring', graphVersion:DATA.graphVersion, exportedAt:new Date().toISOString(), items };
}
document.getElementById('export').addEventListener('click',async ()=>{
  const json=JSON.stringify(exportItems(),null,2); let via='';
  try{ const b=new Blob([json],{type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(b); a.download='jla-items-'+DATA.graphVersion+'-'+new Date().toISOString().slice(0,10)+'.json'; a.click(); URL.revokeObjectURL(a.href); via='downloaded'; }catch(e){}
  try{ await navigator.clipboard.writeText(json); via=via?via+' + copied':'copied to clipboard'; }catch(e){}
  const s=document.getElementById('saved'); s.textContent=via?('exported — '+via):'export ready'; setTimeout(()=>s.textContent='',2600);
});
cards();
</script>
</body>
</html>
`;

writeFileSync(new URL('../docs/item-authoring-workbench.html', import.meta.url), html);
console.log('Wrote docs/item-authoring-workbench.html');
console.log(`  ${skills.length} skills · target ${DATA.target} items each · ${skills.filter((s) => s.have >= DATA.target).length} banks already complete`);
