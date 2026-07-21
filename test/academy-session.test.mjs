import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('academy session is a graph-driven, no-typing 20-minute experience', () => {
  const html = fs.readFileSync('academy-session.html', 'utf8');
  const js = fs.readFileSync('academy-session.js', 'utf8');
  assert.match(html, /ONE SKILL.*20 MINUTES/);
  assert.match(html, /NO TYPING REQUIRED/);
  assert.match(html, /choices/);
  assert.match(js, /foundation-skill-graph\.json/);
  assert.match(js, /answer_submitted/);
  assert.match(js, /foundationSkillId/);
});
