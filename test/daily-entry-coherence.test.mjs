import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('learner-facing Today links use the single evidence-led daily router', async () => {
  const [profile, path, daily, today, berakhot, mastery] = await Promise.all(
    ['profile.html', 'path.js', 'daily.html', 'today.html', 'berakhot-deep.html', 'mastery.html']
      .map((file) => readFile(new URL(`../${file}`, import.meta.url), 'utf8')));
  assert.match(profile, /href="daily-router\.html">Today/);
  assert.match(path, /daily\.href = 'daily-router\.html'/);
  // The duplicate "today" session page was retired: today.html and daily.html now both redirect to
  // the single daily router, and the legacy content-page "Today" links were repointed statically
  // (no runtime shim needed).
  assert.match(daily, /daily-router\.html/);
  assert.match(today, /url=daily-router\.html/);
  assert.match(today, /location\.replace\('daily-router\.html'/);
  for (const page of [berakhot, mastery]) {
    assert.match(page, /href="daily-router\.html">Today/);
    assert.doesNotMatch(page, /href="today\.html"/);
  }
});
