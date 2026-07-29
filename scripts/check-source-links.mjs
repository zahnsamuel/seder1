#!/usr/bin/env node
// Verifies the corpus's primary-source links against Sefaria, in two tiers:
//   1. every literal https://www.sefaria.org/... URL in data/, *.js, *.html
//   2. every citation-shaped step ref in the content units (these generate deep links
//      via course-engine's sefariaUrl), validated as a Sefaria text reference
// Terms.html promises a primary-source link with every lesson; a dead link in front of a
// learner breaks exactly the trust that promise builds. Network-dependent by design, so it
// is a pre-launch tool (npm run check:links), not part of npm test.
//
// Sefaria's website soft-404s (HTTP 200 + error page) for bad refs, so we validate through
// the texts API and treat an `error` field in the JSON body as broken, not just non-200.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { loadUnits } from './audit-content.mjs';

const root = '.';
const politeDelay = 150; // ms between requests
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// --- Tier 1: literal URLs, with the file(s) each appears in ---
const literal = new Map(); // url -> Set(files)
const files = [
  ...readdirSync(root).filter((f) => /\.(js|html)$/.test(f)),
  ...readdirSync(join(root, 'data')).filter((f) => f.endsWith('.json')).map((f) => `data/${f}`)
];
for (const file of files) {
  const text = readFileSync(join(root, file), 'utf8');
  for (const m of text.matchAll(/https:\/\/www\.sefaria\.org\/([^"'\\ )<`$?#]+)/g)) {
    if (!m[1] || /[{}]/.test(m[1])) continue; // template-literal fragments, not real links
    if (text[m.index + m[0].length] === '$') continue; // generator prefix like .../Mishnah_${...}
    if (m[1] === 'search') continue; // /search?q=... is a valid Sefaria navigation page, not a text reference to validate
    if (!literal.has(m[1])) literal.set(m[1], new Set());
    literal.get(m[1]).add(file);
  }
}

// --- Tier 2: citation-shaped refs from unit steps (mirror sefariaUrl's link-worthy shapes) ---
const citation = /^(Mishnah [A-Za-z ]+ \d+:\d+|Pirkei Avot \d+:\d+|(Genesis|Exodus|Leviticus|Numbers|Deuteronomy|Psalms?|Proverbs|Job|Micah|Jeremiah|Hosea|Lamentations|Ezekiel|Isaiah) \d+:\d+(-\d+)?|[A-Z][a-z]+( [A-Z][a-z]+)? \d+[ab])$/;
const refs = new Map(); // ref -> Set(unit ids)
for (const unit of loadUnits(root)) {
  for (const step of unit.steps) {
    const clean = String(step.ref || '').split('·')[0].trim();
    if (!citation.test(clean)) continue;
    if (!refs.has(clean)) refs.set(clean, new Set());
    refs.get(clean).add(unit.id);
  }
}

async function checkRef(tref) {
  try {
    const res = await fetch(`https://www.sefaria.org/api/texts/${encodeURIComponent(tref)}?commentary=0&context=0&pad=0`, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) return `HTTP ${res.status}`;
    const body = await res.json();
    if (body.error) return body.error.slice(0, 80);
    return null; // resolves
  } catch (err) {
    return `fetch failed: ${err.name}`;
  }
}

const broken = [];
let checked = 0;
const total = literal.size + refs.size;

for (const [path, where] of literal) {
  // Sefaria's API accepts the site's own URL form (underscores + dotted sections) as a tref.
  // Decode first: paths may carry pre-encoded characters (e.g. %2C commas in Siddur refs),
  // and checkRef re-encodes — passing them encoded would double-encode and false-flag.
  const problem = await checkRef(decodeURIComponent(path.split('?')[0]));
  checked += 1;
  if (problem) broken.push({ kind: 'url', target: `sefaria.org/${path}`, where: [...where].join(', '), problem });
  if (checked % 20 === 0) console.log(`  ...${checked}/${total}`);
  await sleep(politeDelay);
}
for (const [ref, units] of refs) {
  const problem = await checkRef(ref);
  checked += 1;
  if (problem) broken.push({ kind: 'ref', target: ref, where: [...units].slice(0, 4).join(', '), problem });
  if (checked % 20 === 0) console.log(`  ...${checked}/${total}`);
  await sleep(politeDelay);
}

console.log(`\nChecked ${literal.size} literal Sefaria URLs and ${refs.size} citation refs against the Sefaria API.`);
if (broken.length === 0) {
  console.log('\x1b[32mAll primary-source links and citations resolve.\x1b[0m');
} else {
  console.log(`\x1b[31m${broken.length} broken:\x1b[0m`);
  for (const b of broken) console.log(`  [${b.kind}] ${b.target}\n      in: ${b.where}\n      problem: ${b.problem}`);
}

// Drain fetch's keep-alive pool so Windows exits with the real code (see preflight.mjs).
try {
  const dispatcher = globalThis[Symbol.for('undici.globalDispatcher.1')];
  if (dispatcher && typeof dispatcher.close === 'function') await dispatcher.close();
} catch { /* keep-alive timeout will drain */ }
process.exitCode = broken.length === 0 ? 0 : 1;
