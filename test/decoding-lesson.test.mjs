import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (file) => readFile(new URL(`../${file}`, import.meta.url), 'utf8');

const HOOKS = ['id="map"', 'id="band"', 'id="bar"', 'id="count"', 'id="glyph"', 'id="hear"', 'id="prompt"', 'id="answers"', 'id="feedback"', 'id="continue"', 'id="xp"', 'id="band-title"', 'class="lesson'];

test('decoding lesson is one next move on the shared shell, not a dual-column syllabus', async () => {
  const html = await read('decoding-lesson.html');
  for (const sharedUi of ['class="jla"', 'id="jla-shell-mount"', 'jla-system.css', 'capability-state.js', 'jla-shell.js', 'seder-auth.js']) {
    assert.match(html, new RegExp(sharedUi.replace(/[.?]/g, '\\$&')));
  }
  for (const hook of HOOKS) assert.match(html, new RegExp(hook.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), hook);
  assert.match(html, /fonts\.googleapis\.com\/css2\?family=DM\+Mono/);
  assert.match(html, /family=Fraunces/);
  assert.match(html, /family=Inter/);
  assert.match(html, /family=Noto\+Sans\+Hebrew/);
  assert.match(html, /<p class="jla-eyebrow">DECODING<\/p>/);
  assert.match(html, /id="band-title"/);
  assert.match(html, /class="glyph-card jla-glyph-card"/);
  assert.match(html, /class="glyph jla-glyph"/);
  assert.match(html, /class="hear jla-hear"/);
  assert.equal((html.match(/id="continue"/g) || []).length, 1);
  assert.match(html, /id="continue" class="jla-btn jla-btn-primary"/);
  assert.match(html, /<details class="decoding-this-lesson">/);
  assert.match(html, /<summary>This lesson<\/summary>/);
  assert.match(html, /id="map"/);
  assert.ok(html.indexOf('<details class="decoding-this-lesson">') < html.indexOf('id="map"'));
  assert.doesNotMatch(html, /\sopen[\s>]/);
  assert.match(html, /id="xp" hidden/);
  assert.match(html, /hebrew-decoding\.html/);
  assert.match(html, /data-links='\[\{"label":"The ladder","href":"hebrew-decoding\.html"\}\]'/);
  assert.doesNotMatch(html, /<header>/);
  assert.doesNotMatch(html, /deep-course\.css/);
  assert.doesNotMatch(html, /<aside/);
  assert.doesNotMatch(html, /course-layout|course-head/);
  assert.doesNotMatch(html, /chatbot|ChatGPT|ask the assistant/i);
  assert.match(html, /decoding-engine\.js/);
  assert.match(html, /decoding-drills\.js/);
  assert.match(html, /feedback\.js/);
  const authOrder = html.indexOf('seder-auth.js');
  const shellOrder = html.indexOf('jla-shell.js');
  const engineOrder = html.indexOf('decoding-engine.js');
  assert.ok(authOrder < shellOrder && shellOrder < engineOrder);
});

test('decoding engine keeps drill wiring and drops XP from learner-facing feedback', async () => {
  const js = await read('decoding-engine.js');
  for (const hook of ['#map', '#band', '#bar', '#count', '#glyph', '#hear', '#prompt', '#answers', '#feedback', '#continue', '#xp', '#band-title', '.lesson']) {
    assert.match(js, new RegExp(hook.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), hook);
  }
  assert.match(js, /decShuffle/);
  assert.match(js, /seder-decoding-done:/);
  assert.match(js, /seder-decoding-progress:/);
  assert.match(js, /seder-decoding-review:/);
  assert.match(js, /fnd-decode-/);
  assert.match(js, /recordGraphMasteryIfBandComplete/);
  assert.match(js, /scheduleReview/);
  assert.match(js, /className = 'jla-choice'/);
  assert.match(js, /is-correct/);
  assert.match(js, /is-wrong/);
  assert.match(js, /classList\.add\(correct \? 'correct' : 'incorrect'\)/);
  assert.match(js, /jla-btn jla-btn-primary/);
  assert.match(js, /xp\.textContent = `\$\{decXp\} XP`/);
  assert.doesNotMatch(js, /\+10 XP/);
  assert.doesNotMatch(js, /\+5 XP/);
  assert.match(js, /fb\.textContent = item\.feedback/);
  assert.match(js, /class="mastery"/);
  assert.match(js, /decoding-lesson\.html\?lesson=/);
});

test('glyph card is a reusable jla-system primitive', async () => {
  const css = await read('jla-system.css');
  assert.match(css, /\.jla-glyph-card\s*\{/);
  assert.match(css, /\.jla-glyph\s*\{/);
  assert.match(css, /Noto Sans Hebrew/);
  assert.match(css, /\.jla-hear\s*\{/);
});
