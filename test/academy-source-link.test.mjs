import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('Academy foundation sessions expose the exact source and Sefaria as a secondary handoff', () => {
  const html = fs.readFileSync('academy-session.html', 'utf8');
  const js = fs.readFileSync('academy-session.js', 'utf8');
  const css = fs.readFileSync('academy-session.css', 'utf8');
  const lesson = fs.readFileSync('academy-session-lesson.mjs', 'utf8');
  assert.match(html, /id="source-ref"/);
  assert.match(html, /id="source-hebrew"/);
  assert.match(html, /id="source-translation"/);
  assert.match(html, /id="source-link"/);
  assert.match(html, /id="source-footer"/);
  assert.match(html, /Full text \(optional\)/);
  assert.doesNotMatch(html, /Open full text in Sefaria/);
  assert.doesNotMatch(html, /class="source-link"/);
  assert.ok(html.indexOf('id="teach-block"') < html.indexOf('id="source-footer"'));
  assert.ok(html.indexOf('id="source-footer"') < html.indexOf('id="ask-panel"'));
  assert.match(css, /\.source-fulltext[\s\S]*color:\s*var\(--jla-text-soft/);
  assert.doesNotMatch(css, /\.source-link\s*\{[^}]*font-weight:\s*700/);
  assert.match(lesson, /sefaria\.org\/search/);
  assert.match(lesson, /context\.ref/);
  assert.match(js, /fillSourceCard/);
  assert.match(js, /source-footer/);
});
