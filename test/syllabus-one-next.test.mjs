import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (file) => readFile(new URL(`../${file}`, import.meta.url), 'utf8');
const SHARED_UI = ['class="jla"', 'id="jla-shell-mount"', 'jla-system.css', 'jla-shell.js', 'seder-auth.js'];

test('Shas map recommends one tractate and keeps the catalog in a disclosure', async () => {
  const [html, js] = await Promise.all(['shas-map-v2.html', 'shas-map-v2.js'].map(read));
  for (const token of SHARED_UI) assert.match(html, new RegExp(token.replace(/[.?]/g, '\\$&')));
  assert.match(html, /jla-next-action\.css/);
  assert.equal((html.match(/id="next-cta"/g) || []).length, 1);
  assert.match(html, /class="jla-next-action__cta"/);
  assert.match(html, /<summary>See all tractates<\/summary>/);
  assert.ok(html.indexOf('<details class="jla-disclose shas-all">') < html.indexOf('id="map"'));
  assert.doesNotMatch(html, /\sopen[\s>]/);
  assert.doesNotMatch(html, /<header>/);
  assert.match(js, /fillHero/);
  assert.match(js, /recommendedTractate/);
  assert.match(js, /berakhot-arc\.html/);
  assert.match(js, /querySelector\('#map'\)/);
});

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

test('tractate mastery and Gemara path expose one next move', async () => {
  const [masteryHtml, masteryJs, pathHtml, pathJs] = await Promise.all([
    'tractate-mastery.html', 'tractate-mastery.js', 'gemara-path.html', 'gemara-path.js'
  ].map(read));
  for (const html of [masteryHtml, pathHtml]) {
    for (const token of SHARED_UI) assert.match(html, new RegExp(token.replace(/[.?]/g, '\\$&')));
    assert.match(html, /jla-next-action\.css/);
    assert.equal((html.match(/id="next-cta"/g) || []).length, 1);
    assert.match(html, /<summary>See the full path<\/summary>/);
    assert.doesNotMatch(html, /\sopen[\s>]/);
    assert.doesNotMatch(html, /<header>/);
  }
  assert.ok(masteryHtml.indexOf('<summary>See the full path</summary>') < masteryHtml.indexOf('id="steps"'));
  assert.ok(pathHtml.indexOf('<summary>See the full path</summary>') < pathHtml.indexOf('id="path"'));
  assert.match(masteryJs, /#next-cta/);
  assert.match(pathJs, /#next-title/);
  assert.match(pathHtml, /id="xp" hidden/);
});
