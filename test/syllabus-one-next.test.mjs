import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (file) => readFile(new URL(`../${file}`, import.meta.url), 'utf8');
const SHARED_UI = ['class="jla"', 'id="jla-shell-mount"', 'jla-system.css', 'jla-shell.js', 'seder-auth.js'];

test('course dashboard resumes one course and hides the catalog', async () => {
  const [html, js] = await Promise.all(['course-dashboard.html', 'course-dashboard.js'].map(read));
  for (const token of SHARED_UI) assert.match(html, new RegExp(token.replace(/[.?]/g, '\\$&')));
  assert.equal((html.match(/id="next-cta"/g) || []).length, 1);
  assert.match(html, /<summary>See all courses<\/summary>/);
  assert.match(html, /<summary>See canon connections<\/summary>/);
  assert.ok(html.indexOf('<summary>See all courses</summary>') < html.indexOf('id="courses"'));
  assert.match(html, /id="summary"/);
  assert.match(html, /id="convergence"/);
  assert.match(html, /id="source-sequences"/);
  assert.match(js, /canon-course\.html\?course=\$\{course\.id\}/);
  assert.match(js, /canon-capstone\.html\?course=\$\{course\.id\}/);
  assert.match(js, /fillHero/);
  assert.match(js, /nextCourse/);
});

// tractate-mastery stays a one-next-move surface; the Full Bavli Map (shas-map-v2) and the
// Gemara path were folded into the single Canon Journey map and now redirect there.
test('tractate mastery exposes one next move', async () => {
  const [html, js] = await Promise.all(['tractate-mastery.html', 'tractate-mastery.js'].map(read));
  for (const token of SHARED_UI) assert.match(html, new RegExp(token.replace(/[.?]/g, '\\$&')));
  assert.match(html, /jla-next-action\.css/);
  assert.equal((html.match(/id="next-cta"/g) || []).length, 1);
  assert.match(html, /<summary>See the full path<\/summary>/);
  assert.doesNotMatch(html, /\sopen[\s>]/);
  assert.doesNotMatch(html, /<header>/);
  assert.ok(html.indexOf('<summary>See the full path</summary>') < html.indexOf('id="steps"'));
  assert.match(js, /#next-cta/);
});
