#!/usr/bin/env node
// Build a static, login-free demo of the learner graph map (my-graph.html) for pitches. Bakes a
// realistic mid-journey learner's state into a self-contained HTML — no server, no login, no API —
// and reuses the live page's exact renderer (my-graph.js in its embedded-data mode) and styles
// (my-graph.css), so the demo can never drift from the real thing. Publish docs/demo-map.html as an
// Artifact to share.
//
//   node scripts/build-demo-map.mjs   (npm run graph:demo-map)
import { readFileSync, writeFileSync } from 'node:fs';

const read = (p) => JSON.parse(readFileSync(new URL(`../${p}`, import.meta.url), 'utf8'));
const readText = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const graph = read('data/foundation-skill-graph.json');
const css = readText('my-graph.css');
const js = readText('my-graph.js');

// Demo learner: mid-journey. Secure a Layer-4 move and (by the same downward inference the placement
// wiring uses) its whole prerequisite chain — giving a green base, a gold frontier band, and the rest
// ahead. This mirrors a real placement-seeded learner (the 12 / 10 / 27 split we verified live).
const byId = new Map(graph.skills.map((s) => [s.id, s]));
const demonstrated = 'fnd-arg-claim';
const secured = new Set();
(function close(id) { if (secured.has(id) || !byId.has(id)) return; for (const p of byId.get(id).prerequisites || []) close(p); secured.add(id); })(demonstrated);

const trimmedGraph = {
  layers: (graph.layers || []).map((l) => ({ n: l.n, title: l.title })),
  skills: graph.skills.map((s) => ({ id: s.id, layer: s.layer, title: s.title, statement: s.statement, prerequisites: s.prerequisites || [] }))
};
const learner = { foundationScores: Object.fromEntries([...secured].map((id) => [id, 1])) };
const demoData = JSON.stringify({ learner, graph: trimmedGraph });

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Your Map Through the Graph — JLA (demo)</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>
${css}
.demo-banner{background:var(--frontier-soft);color:var(--gold);border-bottom:1px solid var(--line);font:600 12px 'DM Mono',monospace;letter-spacing:.04em;text-align:center;padding:8px 16px}
header a[href="#"]{cursor:default}
</style>
</head>
<body>
<div class="demo-banner">DEMO · an illustrative learner's progress — the live map reads each learner's own evidence</div>
<header><a href="#">Jewish Learning Academy</a><nav><span style="color:var(--muted);font-size:13px">Skill graph · foundation year</span></nav></header>
<main>
  <section class="intro">
    <span class="eyebrow">YOUR MAP THROUGH THE GRAPH</span>
    <h1>Every reading move, and where you are.</h1>
    <p id="summary">Reading your evidence…</p>
    <div class="legend" role="list">
      <span role="listitem"><i class="k mastered"></i> Mastered</span>
      <span role="listitem"><i class="k frontier"></i> Ready now</span>
      <span role="listitem"><i class="k locked"></i> Ahead</span>
    </div>
    <p id="placement-cta" class="placement-cta" hidden></p>
  </section>
  <section class="map-wrap" aria-label="The knowledge graph">
    <div class="map-scroll"><svg id="map" class="map"></svg></div>
  </section>
  <section id="detail" class="detail"><p class="hint">Tap any move on the map to see what it builds on and unlocks.</p></section>
</main>
<script type="application/json" id="demo-data">${demoData}</script>
<script>${js}</script>
</body>
</html>
`;

writeFileSync(new URL('../docs/demo-map.html', import.meta.url), html);
const mastered = secured.size;
console.log(`Wrote docs/demo-map.html (self-contained, no login)`);
console.log(`  demo learner: ${mastered} mastered (secured ${demonstrated} + its prerequisites); the rest computed live in the page`);
