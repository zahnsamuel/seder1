// Phase-4 prep: extract every *-arc.js session array (FULL fidelity) + *-arc.html hero meta into
// one data/arcs.json keyed by slug. Pure data — touches no arc file, no router, no server.
//
// Two shapes surfaced (this is itself the key Phase-4 finding):
//  - 'index'       — only berakhot: sessions are {title,copy,stage,url,skill} that LINK to separate
//                    session pages (berakhot-deep.html, etc.).
//  - 'interactive' — the other 44: each session is a self-contained authored question
//                    {short,mode,title,ref,hebrew,translation,prompt,answers,correct,feedback,skill,competency}.
// The interactive arcs are CLIENT-SCORED today: `correct`/`feedback` already ship to the browser in
// each *-arc.js, so keeping them here is not a new exposure. Phase 4 should decide whether to move
// arc scoring server-side (the academy-session key-stripping pattern) — a real security upgrade.
import fs from 'node:fs';
import path from 'node:path';

const dir = process.argv[2] || '.';
const arcHtml = fs.readdirSync(dir).filter((f) => /-arc\.html$/.test(f)).sort();

function extractSessions(js) {
  const start = js.indexOf('[', js.indexOf('const arc'));
  if (start < 0) return null;
  let depth = 0, end = -1;
  for (let i = start; i < js.length; i++) {
    if (js[i] === '[') depth++;
    else if (js[i] === ']') { depth--; if (depth === 0) { end = i; break; } }
  }
  if (end < 0) return null;
  return Function(`"use strict";return (${js.slice(start, end + 1)});`)();
}

const pick = (html, re) => { const m = html.match(re); return m ? m[1].trim() : null; };

const arcs = {};
const problems = [];
let interactiveCount = 0, indexCount = 0, sessionTotal = 0;

for (const file of arcHtml) {
  const slug = file.replace(/-arc\.html$/, '');
  const html = fs.readFileSync(path.join(dir, file), 'utf8');
  const jsFile = path.join(dir, `${slug}-arc.js`);
  if (!fs.existsSync(jsFile)) { problems.push(`${slug}: no ${slug}-arc.js`); continue; }
  let raw;
  try { raw = extractSessions(fs.readFileSync(jsFile, 'utf8')); }
  catch (e) { problems.push(`${slug}: parse failed — ${e.message}`); continue; }
  if (!Array.isArray(raw)) { problems.push(`${slug}: no arc array`); continue; }

  const shape = raw[0] && 'url' in raw[0] && !('answers' in raw[0]) ? 'index' : 'interactive';
  if (shape === 'index') indexCount++; else interactiveCount++;
  sessionTotal += raw.length;

  arcs[slug] = {
    slug,
    shape,
    pageTitle: pick(html, /<title>([^<]*)<\/title>/),
    kicker: pick(html, /<section class="(?:hero|course-head)"[^>]*><span[^>]*>([^<]*)<\/span>/),
    title: pick(html, /<h1>([^<]*)<\/h1>/),
    intro: pick(html, /<h1>[^<]*<\/h1><p>([^<]*)<\/p>/),
    outcome: {
      heading: pick(html, /<aside><span>[^<]*<\/span><h2>([^<]*)<\/h2>/),
      body: pick(html, /<aside><span>[^<]*<\/span><h2>[^<]*<\/h2><p>([^<]*)<\/p>/)
    },
    sessionCount: raw.length,
    sessions: raw   // FULL fidelity, every field preserved verbatim
  };
}

const out = {
  _readme: 'Phase-4 prep — consolidated arc index/lesson data for the future arc.html?tractate=<slug> ' +
    'template, so it reads ONE file instead of 45. Extracted from *-arc.js (sessions, verbatim) + ' +
    '*-arc.html (hero meta). Regenerate: scripts/extract-arcs.mjs. NOT yet wired to anything.',
  _findings: {
    shapes: 'berakhot is a link-out INDEX arc; the other 44 are self-contained INTERACTIVE lessons — ' +
      'the template must handle both (or berakhot gets migrated to the interactive shape).',
    scoring: 'interactive arcs are CLIENT-SCORED — correct/feedback already ship in each *-arc.js today. ' +
      'Phase 4 should decide whether to move to server scoring (academy-session key-stripping pattern). ' +
      'That server work is Codex\'s domain — see docs/codex-assignment.md.',
    session_urls: 'index-arc sessions[].url point to separate session pages that are OUT of Phase-4 scope ' +
      '(Phase 4 collapses the 45 index pages, not the per-session pages).'
  },
  counts: { arcs: Object.keys(arcs).length, interactive: interactiveCount, index: indexCount, sessions: sessionTotal },
  arcs
};
fs.writeFileSync(path.join(dir, 'data', 'arcs.json'), JSON.stringify(out, null, 2) + '\n');
console.log(`Wrote data/arcs.json: ${out.counts.arcs} arcs (${interactiveCount} interactive, ${indexCount} index), ${sessionTotal} sessions.`);
console.log('meta gaps:', Object.values(arcs).filter((a) => !a.kicker || !a.outcome.heading).map((a) => a.slug).join(', ') || 'none');
console.log(problems.length ? 'PROBLEMS:\n' + problems.join('\n') : 'No parse problems.');
