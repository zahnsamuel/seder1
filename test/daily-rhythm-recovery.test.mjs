import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

// The visible rhythm-status section was removed from the simplified daily page; the non-punitive
// recovery LOGIC (smaller session for a lapsed learner) stays in daily-router.js.
test('Today supports rhythm recovery without punitive streak language', () => {
  const js = fs.readFileSync('daily-router.js', 'utf8');
  assert.match(js, /dailyStreak/);
  assert.match(js, /recoveryWindow/);
  assert.match(js, /room to return/);
  assert.doesNotMatch(js, /streak broken|you failed|lost your streak/i);
});
