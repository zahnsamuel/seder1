import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const html = fs.readFileSync('path.html', 'utf8');

test('My Path is a real integrated learner dashboard', () => {
  assert.doesNotMatch(html, /http-equiv="refresh"/);
  assert.doesNotMatch(html, /0 XP/);
  assert.doesNotMatch(html, /Your Jewish literacy level/);
  assert.match(html, /Your reading capabilities/);
  assert.match(html, /capability-state\.js/);
  assert.match(html, /class="today"/);
  assert.match(html, /id="review-section"/);
  assert.match(html, /aria-label="Integrated capability milestones"/);
  assert.match(html, /daily-router\.html/);
  assert.match(html, /id="skill-progress"/);
  assert.match(html, /KNOWLEDGE FRONTIER/);
});
