import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('Today supports rhythm recovery without punitive streak language', () => {
  const html = fs.readFileSync('daily-router.html', 'utf8');
  const js = fs.readFileSync('daily-router.js', 'utf8');
  assert.match(html, /id="rhythm-status"/);
  assert.match(html, /id="rhythm-label"/);
  assert.match(js, /dailyStreak/);
  assert.match(js, /recoveryWindow/);
  assert.match(js, /room to return/);
  assert.doesNotMatch(js, /streak broken|you failed|lost your streak/i);
});
