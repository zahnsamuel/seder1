import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('learner-facing Today links use the single evidence-led daily router', async () => {
  const [profile, path, daily, today, berakhot, mastery, shell] = await Promise.all(
    ['profile.html', 'path.js', 'daily.html', 'today.html', 'berakhot-deep.html', 'mastery.html', 'jla-shell.js']
      .map((file) => readFile(new URL(`../${file}`, import.meta.url), 'utf8')));
  assert.match(profile, /href="daily-router\.html">Today/);
  assert.match(path, /daily\.href = 'daily-router\.html'/);
  // The duplicate "today" session page was retired: today.html and daily.html now both redirect to
  // the single daily router, and the legacy content-page "Today" links were repointed statically
  // (no runtime shim needed).
  assert.match(daily, /daily-router\.html/);
  assert.match(today, /url=daily-router\.html/);
  assert.match(today, /location\.replace\('daily-router\.html'/);
  // berakhot-deep still carries the static Today link; mastery now gets Today from the shared shell.
  assert.match(berakhot, /href="daily-router\.html">Today/);
  assert.doesNotMatch(berakhot, /href="today\.html"/);
  assert.match(mastery, /jla-shell\.js/);
  assert.match(shell, /href="daily-router\.html">Today/);
});
