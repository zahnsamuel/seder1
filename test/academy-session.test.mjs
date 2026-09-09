import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const html = fs.readFileSync('academy-session.html', 'utf8');
const js = fs.readFileSync('academy-session.js', 'utf8');
const lesson = fs.readFileSync('academy-session-lesson.mjs', 'utf8');
const css = fs.readFileSync('academy-session.css', 'utf8');

const HOOKS = [
  'id="title"', 'id="statement"', 'id="why"', 'id="kp-steps"', 'id="step"',
  'id="step-label"', 'id="source-ref"', 'id="source-hebrew"', 'id="source-translation"',
  'id="source-setting"', 'id="teach-block"', 'id="teach-copy"', 'id="teaching-move"',
  'id="source-footer"', 'id="source-link"', 'id="ask-panel"', 'id="check-title"',
  'id="choices"', 'id="feedback"', 'id="advance"', 'id="complete"', 'id="complete-title"', 'id="complete-copy"', 'id="complete-eyebrow"',
  'id="complete-chip"', 'id="complete-next"', 'id="complete-academy"',
  'id="real-content"', 'id="real-content-title"', 'id="real-content-list"'
];

test('academy session is a graph-driven 15-minute experience', () => {
  assert.match(html, /SEE IT, THEN ANSWER.*15 MINUTES/);
  assert.match(html, /id="ask-eyebrow">YOUR QUESTION</);
  assert.doesNotMatch(html, /no typing|typing required/i);
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
  assert.match(html, /<p class="jla-eyebrow">SEE IT, THEN ANSWER · ABOUT 15 MINUTES<\/p>/);
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

test('academy-session learner chrome does not use “the move” as the ask frame', () => {
  const chrome = `${html}\n${js}`;
  assert.doesNotMatch(chrome, /make the move/i);
  assert.doesNotMatch(chrome, /see the move/i);
  assert.doesNotMatch(chrome, /that is the move/i);
  assert.doesNotMatch(chrome, /Make the move:/);
  assert.doesNotMatch(chrome, /Show me the move/i);
  assert.doesNotMatch(html, /\bthe move\b/i);
  assert.doesNotMatch(js, /\bthe move\b/i);
});

test('foundation session chrome is see it / try it / new source with a clear ask', () => {
  assert.match(html, /<small>see it<\/small>/);
  assert.match(html, /<small>try it<\/small>/);
  assert.match(html, /<small>new source<\/small>/);
  assert.doesNotMatch(html, /see the move/i);
  assert.doesNotMatch(html, /make the move/i);
  assert.match(html, /id="ask-eyebrow">YOUR QUESTION</);
  assert.doesNotMatch(html, /no typing|typing required/i);
  assert.match(html, /WHAT TO NOTICE/);
  assert.match(html, /id="teach-copy"/);
  assert.match(html, /id="ask-panel"/);
  assert.match(html, /id="source-footer"/);
  assert.match(html, /Look up later \(optional\)/);
  assert.doesNotMatch(html, /Open full text in Sefaria/);
  assert.doesNotMatch(html, /Full text \(optional\)/);
  assert.ok(html.indexOf('id="teach-block"') < html.indexOf('id="source-footer"'));
  assert.ok(html.indexOf('id="source-footer"') < html.indexOf('id="ask-panel"'));
  assert.match(js, /foundation-authored-items\.json/);
  assert.match(js, /foundation-source-excerpts\.json/);
  assert.match(js, /foundation-teach\.json/);
  assert.match(js, /hideOutbound/);
  assert.match(js, /Got it — ask me|continueTeach|holdAsk|awaitingAsk/);
  assert.ok(html.indexOf('id="ask-panel"') < html.indexOf('id="advance"'));
  assert.ok(html.indexOf('id="advance"') < html.indexOf('id="complete"'));
  assert.match(html, /<\/div>\s*<button id="advance"/);
  assert.match(html, /href="daily-router.html">Continue to Today/);
  assert.doesNotMatch(html, /href="path.html">Back to your path/);
  assert.match(lesson, /You'll practice:/);
  assert.match(lesson, /Got it — ask me/);
  assert.match(lesson, /SOURCE_TYPE_TEACH/);
  assert.doesNotMatch(html + js, /Make the move:/);
  assert.doesNotMatch(html + js, /Show me the move/);
  assert.doesNotMatch(html + js, /INTRODUCE · SEE THE MOVE/);
});

test('finishing a starter session names emerging or secure and returns to Today', () => {
  assert.match(html, /id="complete-eyebrow">THIS CAPABILITY</);
  assert.match(html, /id="complete-chip"/);
  assert.match(html, /id="complete-next"[^>]*href="daily-router\.html"/);
  assert.match(html, /Continue on Today/);
  assert.match(html, /id="complete-academy"/);
  assert.match(html, /See this on Academy/);
  assert.doesNotMatch(html, /Back to your path/);
  assert.doesNotMatch(html, /SKILL PRACTISED ACROSS THE CANON/);
  assert.doesNotMatch(js, /You practised/);
  assert.match(js, /skillCapabilityState/);
  assert.match(js, /jla-last-foundation-skill/);
  assert.match(js, /academy\.html\?skill=/);
  assert.match(js, /jla-chip is-\$\{stateKey\}/);
  assert.doesNotMatch(js, /0 XP|\$\{[^}]*\} XP/);
});

test('academy-session CSS uses jla tokens and a single-column lesson', () => {
  assert.match(css, /--ink:\s*var\(--jla-ink/);
  assert.match(css, /max-width:\s*640px/);
  assert.match(css, /flex-direction:\s*column/);
  assert.match(css, /min-height:\s*44px/);
  assert.doesNotMatch(css, /grid-template-columns:\s*1\.35fr/);
  assert.match(css, /\.complete\[hidden\][\s\S]*display:\s*none/);
  assert.match(css, /\.source-footer/);
  assert.match(css, /\.source-fulltext[\s\S]*color:\s*var\(--jla-text-soft/);
  assert.doesNotMatch(css, /\.source-link\s*\{[^}]*font-weight:\s*700/);
  assert.doesNotMatch(css, /\.source-link\s*\{[^}]*color:\s*var\(--jla-accent\)/);
});
