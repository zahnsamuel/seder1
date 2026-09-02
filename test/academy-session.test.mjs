import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const html = fs.readFileSync('academy-session.html', 'utf8');
const js = fs.readFileSync('academy-session.js', 'utf8');
const css = fs.readFileSync('academy-session.css', 'utf8');

const HOOKS = [
  'id="title"', 'id="statement"', 'id="why"', 'id="kp-steps"', 'id="step"',
  'id="step-label"', 'id="source-ref"', 'id="source-hebrew"', 'id="source-translation"',
  'id="source-setting"', 'id="teaching-move"', 'id="source-link"', 'id="check-title"',
  'id="choices"', 'id="feedback"', 'id="advance"', 'id="complete"', 'id="complete-title"',
  'id="complete-copy"', 'id="real-content"', 'id="real-content-title"', 'id="real-content-list"'
];

test('academy session is a graph-driven, no-typing 20-minute experience', () => {
  assert.match(html, /ONE SKILL.*20 MINUTES/);
  assert.match(html, /NO TYPING REQUIRED/);
  assert.match(html, /choices/);
  assert.match(js, /foundation-skill-graph\.json/);
  assert.match(js, /answer_submitted/);
  assert.match(js, /foundationSkillId/);
});

test('academy session is one next move on the shared shell, not a dual-column syllabus', () => {
  for (const sharedUi of ['class="jla"', 'id="jla-shell-mount"', 'jla-system.css', 'capability-state.js', 'jla-shell.js', 'seder-auth.js']) {
    assert.match(html, new RegExp(sharedUi.replace(/[.?]/g, '\\$&')));
  }
  for (const hook of HOOKS) assert.match(html, new RegExp(hook.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), hook);
  assert.match(html, /fonts\.googleapis\.com\/css2\?family=DM\+Mono/);
  assert.match(html, /family=Fraunces/);
  assert.match(html, /family=Inter/);
  assert.match(html, /family=Noto\+Sans\+Hebrew/);
  assert.match(html, /class="jla-main"/);
  assert.match(html, /<p class="jla-eyebrow">ONE SKILL · ONE SOURCE · 20 MINUTES<\/p>/);
  assert.match(html, /id="advance" class="jla-btn jla-btn-primary"/);
  assert.equal((html.match(/id="advance"/g) || []).length, 1);
  assert.equal((html.match(/class="jla-btn jla-btn-primary"/g) || []).length, 2); // continue + complete
  assert.match(html, /source-card jla-card/);
  assert.match(html, /<details class="real-content"/);
  assert.match(html, /<summary>Practice this skill in real sources<\/summary>/);
  assert.ok(html.indexOf('<details class="real-content"') < html.indexOf('id="real-content-list"'));
  assert.doesNotMatch(html, /\sopen[\s>]/);
  assert.doesNotMatch(html, /<header>/);
  assert.doesNotMatch(html, /chatbot|ChatGPT|ask the assistant/i);
  const authOrder = html.indexOf('seder-auth.js');
  const capOrder = html.indexOf('capability-state.js');
  const shellOrder = html.indexOf('jla-shell.js');
  const pageOrder = html.indexOf('academy-session.js');
  assert.ok(authOrder < capOrder && capOrder < shellOrder && shellOrder < pageOrder);
});

test('scaffold path marks exactly one current step and keeps scoring hooks', () => {
  assert.match(js, /classList\.toggle\('is-current'/);
  assert.match(js, /classList\.toggle\('is-done'/);
  assert.match(js, /jla-choice/);
  assert.match(js, /jla-feedback/);
  assert.match(js, /\/api\/jla\/academy-session\//);
  assert.match(js, /choiceId: button\.dataset\.choiceId/);
  assert.match(js, /kp-\$\{skillId\}-2/);
  assert.match(js, /kp-\$\{skillId\}-3/);
  const currentChips = html.match(/class="jla-chip(?: is-current)?" data-step="/g) || [];
  assert.equal(currentChips.length, 3);
  assert.equal((html.match(/class="jla-chip is-current"/g) || []).length, 1);
});

test('academy-session CSS uses jla tokens and a single-column lesson', () => {
  assert.match(css, /--ink:\s*var\(--jla-ink/);
  assert.match(css, /max-width:\s*640px/);
  assert.match(css, /flex-direction:\s*column/);
  assert.match(css, /min-height:\s*44px/);
  assert.doesNotMatch(css, /grid-template-columns:\s*1\.35fr/);
  assert.match(css, /\.complete\[hidden\][\s\S]*display:\s*none/);
});
