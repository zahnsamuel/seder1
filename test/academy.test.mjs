import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('ninety-day academy gives beginners a single sequenced, evidence-led entry into the canon', async () => {
  const [html, source] = await Promise.all(['academy.html', 'academy.js'].map((file) => readFile(file, 'utf8')));

  // Adopted the shared JLA shell + design system (see docs/jla-ui-system-adoption.md): the legacy
  // hand-rolled <header> is gone, replaced by the mounted shell.
  for (const sharedUi of ['class="jla"', 'id="jla-shell-mount"', 'jla-system.css', 'capability-state.js', 'jla-shell.js']) {
    assert.match(html, new RegExp(sharedUi.replace(/[.?]/g, '\\$&')));
  }
  assert.doesNotMatch(html, /<header>/);
  // Brand + the still-present anchors: 90-Day Academy (title), Today's Study + Full map (shell links),
  // and the 8-week journey kept reachable contextually rather than in prominent nav.
  assert.match(html, /90-Day Academy/);
  assert.match(html, /daily-router\.html/);
  assert.match(html, /seder-curriculum\.html/);
  assert.match(html, /integrated-path\.html/);
  assert.doesNotMatch(html, /8-week journey<\/a>/); // demoted out of the top nav

  // Progressive foundations: one shown at a time, the rest behind a disclosure.
  assert.match(html, /id="foundationNext"/);
  assert.match(html, /<summary>See all foundations<\/summary>/);
  assert.match(html, /id="foundationAll"/);
  for (const id of ['foundation-hebrew-decoding', 'foundation-reading-orientation', 'foundation-independent-reading']) {
    assert.match(source, new RegExp(id));
  }
  // Decoding completion is a localStorage flag, not a server stage — the render must honour that,
  // or the first foundation would never advance.
  assert.match(source, /seder-decoding-done/);

  // One primary action for the day, with the evidence step kept VISIBLE (not hidden in a disclosure):
  // the two steps render as a sequence, so Demonstrate — which records the gating evidence — stays seen.
  assert.match(source, /Read today’s source/);
  assert.match(source, /Demonstrate the move/);
  assert.match(source, /jla-path today-steps/);

  // The sequencing engine (unchanged) still drives which session is next.
  for (const route of ['language.html', 'tractate-mastery.html?tractate=berakhot', 'halakha-chanukah.html', 'history-geniza.html', 'independent-reading.html', 'weekly-review.html']) assert.match(source, new RegExp(route.replace(/[.?]/g, '\\$&')));
  for (const removed of ['YOUR 90-DAY COURSE', 'THE FIRST NINETY DAYS', 'id="milestones"']) assert.doesNotMatch(html, new RegExp(removed));
  assert.match(source, /const plan = \[/);
  assert.match(source, /diagnostic\.html/);
  assert.match(source, /source evidence/);
  assert.match(source, /whyNext\(day\)/);
  assert.match(source, /dayMap/);
  assert.match(source, /continuationBlocks/);
  assert.match(source, /seder-90-day/);
  assert.match(source, /Month 3 · Independence/);
});
