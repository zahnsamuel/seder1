import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const html = fs.readFileSync('path.html', 'utf8');

test('My Path is a real integrated learner dashboard', () => {
  assert.doesNotMatch(html, /http-equiv="refresh"/);
  assert.match(html, /id="xp"/);
  assert.match(html, /class="today"/);
  assert.match(html, /id="review-section"/);
  assert.match(html, /aria-label="Integrated mastery milestones"/);
  assert.match(html, /daily-router\.html/);
});
