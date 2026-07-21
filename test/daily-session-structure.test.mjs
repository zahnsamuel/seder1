import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('Today presents a focused daily seder with adaptive session roles', async () => {
  const html = await readFile(new URL('../daily-router.html', import.meta.url), 'utf8');
  const js = await readFile(new URL('../daily-router.js', import.meta.url), 'utf8');
  assert.match(html, /TODAY'S SEDER/);
  assert.match(html, /id="session-duration"/);
  assert.match(html, /id="session-steps"/);
  for (const role of ['Recall', 'Study', 'Transfer', 'Connect']) assert.match(js, new RegExp(role));
  assert.match(js, /renderSessionPlan\(recommendation\.url, needsPlacement, Boolean\(recommendation\.foundation\), rhythmMinutes\)/);
  assert.match(js, /rhythmMinutes/);
  assert.match(js, /weekly-review\.html/);
});
