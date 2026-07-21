import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

// The front door was deliberately simplified (mentor reset: "the daily interface remains
// deliberately narrow; never require learners to understand the whole curriculum map before
// beginning"). This test now GUARDS that simplicity: one promise, one next action — and none of
// the old multi-section clutter creeping back onto the first screen.
test('landing page leads with one clear next action, not the whole curriculum', async () => {
  const page = await readFile(new URL('../seder.html', import.meta.url), 'utf8');
  assert.match(page, /Become someone who can open Jewish texts\./);
  assert.match(page, /id="nextAction"/);
  assert.match(page, /id="todayTitle"/);
  // The overwhelming surfaces were removed from the front door (they remain reachable via the
  // daily flow); guard against a regression that re-floods the first screen.
  assert.doesNotMatch(page, /THE LEARNING LOOP/);
  assert.doesNotMatch(page, /See Jewish Learning Academy in four moves/);
  assert.doesNotMatch(page, /Open the full six-level journey/);
});
