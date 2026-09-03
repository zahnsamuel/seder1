#!/usr/bin/env node
/**
 * Idempotent presentation transform for interactive `*-arc.html` pages.
 * Berakhot is an index arc (handled separately). Every other arc is a
 * course-engine lesson whose step map used to compete with the current step.
 *
 * - Lesson stays first-paint.
 * - `#map` moves into a collapsed <details class="jla-disclose arc-path">.
 * - `#xp`, scoring hooks, and pedagogy files are untouched.
 */
import { readdir, readFile, writeFile } from 'node:fs/promises';

const dry = process.argv.includes('--dry-run');
const files = (await readdir('.')).filter((name) => name.endsWith('-arc.html') && name !== 'berakhot-arc.html');
const layoutRe = /<section class="course-layout"><aside class="map">([\s\S]*?)<\/aside>(<section class="lesson">[\s\S]*?<\/section>)<\/section>/;

let changed = 0;
let skipped = 0;
for (const name of files) {
  const original = await readFile(name, 'utf8');
  if (original.includes('class="jla-disclose arc-path"') || original.includes('class="arc-path"')) {
    skipped += 1;
    continue;
  }
  if (!layoutRe.test(original)) {
    throw new Error(`${name}: expected a course-layout + aside.map + section.lesson structure`);
  }
  let html = original.replace('deep-course.css?v=1', 'deep-course.css?v=2');
  html = html.replace('<main>', '<main class="jla-main">');
  html = html.replace(/<button id="continue"([^>]*)>/, (match, attrs) => {
    if (/\bclass=/.test(attrs)) return match;
    const rest = attrs.trim();
    return `<button id="continue" class="jla-btn jla-btn-primary"${rest ? ` ${rest}` : ''}>`;
  });
  html = html.replace(
    layoutRe,
    '$2<details class="jla-disclose arc-path"><summary>See the full path</summary><aside class="map">$1</aside></details>'
  );
  if (html === original) throw new Error(`${name}: transform produced no change`);
  if (!html.includes('id="map"') || !html.includes('id="continue"') || !html.includes('id="xp"')) {
    throw new Error(`${name}: missing a required JS hook after transform`);
  }
  if (!html.includes('<details class="jla-disclose arc-path">')) {
    throw new Error(`${name}: details wrapper missing after transform`);
  }
  if (html.includes('class="course-layout"')) {
    throw new Error(`${name}: course-layout should have been unwrapped`);
  }
  if (!dry) await writeFile(name, html);
  changed += 1;
  console.log(`${dry ? 'would change' : 'changed'} ${name}`);
}
console.log(`${dry ? 'dry-run ' : ''}changed=${changed} skipped=${skipped} total=${files.length}`);
