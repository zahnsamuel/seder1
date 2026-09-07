import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('Academy foundation sessions expose the exact source and Sefaria as a secondary handoff', () => {
  const html = fs.readFileSync('academy-session.html', 'utf8');
  const js = fs.readFileSync('academy-session.js', 'utf8');
  const lesson = fs.readFileSync('academy-session-lesson.mjs', 'utf8');
  assert.match(html, /id="source-ref"/);
  assert.match(html, /id="source-hebrew"/);
  assert.match(html, /id="source-translation"/);
  assert.match(html, /id="source-link"/);
  assert.match(html, /Open full text in Sefaria/);
  assert.match(lesson, /sefaria\.org\/search/);
  assert.match(lesson, /context\.ref/);
  assert.match(js, /fillSourceCard/);
});
