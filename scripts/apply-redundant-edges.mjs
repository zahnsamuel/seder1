#!/usr/bin/env node
// Apply the decomposition proposer's VERIFIABLE proposals only: drop transitively-redundant long
// prerequisite edges (a dependent that still reaches the prerequisite through another path). This is
// the one decomposition move that needs no authoring — it is standard transitive reduction, and it
// preserves the graph's reachability exactly (every prerequisite a skill had, directly or indirectly,
// it still has). It NEVER touches the insert-intermediate proposals — those are a human's to author.
//
// Safety: re-verifies redundancy against the CURRENT graph (never trusts a stale proposals file),
// drops one edge at a time rebuilding the dependency map between each (so a drop can never strand
// another edge's only path), defaults to a dry run, and — on --write — re-runs the integrity gate and
// restores the graph if it fails. After applying it regenerates the prerequisite-derived layers.
//
//   node scripts/apply-redundant-edges.mjs            (dry run — shows what it would drop)
//   node scripts/apply-redundant-edges.mjs --write    (npm run graph:apply-redundant -- --write)
//   ... [--span N]   (layer-span threshold for "long", default 3 — matches the proposer)
import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

// Pure: returns { drops, graph } — a deep copy of `graph` with transitively-redundant long edges
// removed, and the list of what was dropped. Does not mutate the input.
export function computeRedundantDrops(graph, spanThreshold = 3) {
  const g = JSON.parse(JSON.stringify(graph));
  const byId = new Map(g.skills.map((s) => [s.id, s]));
  const layerOf = (id) => byId.get(id)?.layer;
  const buildDeps = () => { const d = new Map(g.skills.map((s) => [s.id, []])); for (const s of g.skills) for (const p of s.prerequisites || []) d.get(p)?.push(s.id); return d; };
  const altPath = (deps, from, to) => {
    const q = (deps.get(from) || []).filter((x) => x !== to); const seen = new Set(q);
    while (q.length) { const c = q.shift(); if (c === to) return true; for (const x of deps.get(c) || []) if (!seen.has(x)) { seen.add(x); q.push(x); } }
    return false;
  };
  const drops = [];
  for (;;) {
    const deps = buildDeps();
    let dropped = null;
    outer: for (const s of g.skills) {
      for (const p of s.prerequisites || []) {
        if (layerOf(s.id) - layerOf(p) < spanThreshold) continue;
        if (altPath(deps, p, s.id)) { dropped = { from: p, to: s.id, span: layerOf(s.id) - layerOf(p) }; break outer; }
      }
    }
    if (!dropped) break;
    byId.get(dropped.to).prerequisites = byId.get(dropped.to).prerequisites.filter((x) => x !== dropped.from);
    drops.push(dropped);
  }
  return { drops, graph: g };
}

// --- CLI ---
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('apply-redundant-edges.mjs')) {
  const args = process.argv.slice(2);
  const write = args.includes('--write');
  const spanI = args.indexOf('--span');
  const span = spanI >= 0 ? Number(args[spanI + 1]) : 3;
  const graphUrl = new URL('../data/foundation-skill-graph.json', import.meta.url);
  const original = readFileSync(graphUrl, 'utf8');
  const graph = JSON.parse(original);
  const titleOf = new Map(graph.skills.map((s) => [s.id, s.title]));
  const { drops, graph: next } = computeRedundantDrops(graph, span);

  const B = (t) => `\x1b[1m${t}\x1b[0m`;
  console.log(B('Apply redundant edges — transitive reduction'));
  console.log(`graph ${graph.version} · ${drops.length} transitively-redundant edge(s) spanning ≥${span} layers\n`);
  for (const d of drops) console.log(`  DROP ${titleOf.get(d.from)} → ${titleOf.get(d.to)}  (span ${d.span}; ${d.to} still reaches ${d.from} another way)`);
  if (!drops.length) { console.log('Nothing to drop. The graph has no redundant long edges.'); process.exit(0); }

  if (!write) {
    console.log(`\nDry run — nothing changed. Re-run with --write to apply, re-gate, and regenerate the edge & knowledge-point layers.`);
    process.exit(0);
  }

  writeFileSync(graphUrl, `${JSON.stringify(next, null, 2)}\n`);
  try {
    execFileSync(process.execPath, ['scripts/check-foundation-graph.mjs'], { cwd: new URL('..', import.meta.url), stdio: 'pipe' });
  } catch (e) {
    writeFileSync(graphUrl, original);
    console.error('\nIntegrity gate FAILED — graph restored, no changes applied.');
    console.error(String(e.stdout || '') + String(e.stderr || ''));
    process.exit(1);
  }
  // Keep the prerequisite-derived layers in sync with the reduced graph.
  for (const script of ['scripts/build-skill-edges.mjs', 'scripts/build-knowledge-points.mjs']) {
    execFileSync(process.execPath, [script], { cwd: new URL('..', import.meta.url), stdio: 'pipe' });
  }
  console.log(`\nApplied ${drops.length} drop(s). Graph passes the integrity gate; edge & knowledge-point layers regenerated.`);
  console.log('Refresh the analysis reports if you use them: npm run graph:gaps && npm run graph:decompose && npm run graph:quality');
}
