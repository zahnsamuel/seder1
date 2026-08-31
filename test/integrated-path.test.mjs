import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile, stat} from 'node:fs/promises';

test('eight-week journey is learner-facing, sequential, and does not confuse self-reported study with mastery', async () => {
  const [html, css, source, dataFile, legacyPath, hub] = await Promise.all([
    'integrated-path.html', 'integrated-path.css', 'integrated-path.js', 'data/eight-week-integrated-path.json', 'path.html', 'academy.html'
  ].map((file) => readFile(file, 'utf8')));
  const path = JSON.parse(dataFile);
  for (const phrase of ['YOUR FIRST EIGHT WEEKS', 'XP EARNED', 'SKILLS WITH EVIDENCE', 'WEEKS READY FOR REVIEW']) assert.match(html, new RegExp(phrase));
  for (const phrase of ['READY TO BEGIN', 'IN PROGRESS', 'RETRIEVAL READY', 'COMING NEXT', 'integrated_week_started', 'evidenceFor', 'readyForReview']) assert.match(source, new RegExp(phrase));
  assert.match(source, /Evidence: \$\{evidence\}/);
  assert.match(html, /mastery evidence separate from simply opening a page/);
  assert.match(css, /\.journey:before/);
  assert.match(legacyPath, /url=berakhot-deep\.html\?entry=placement/);
  assert.match(legacyPath, /Opening your first Gemara lesson/);
  // Simplification: the 8-week journey is folded into the daily loop — it survives as a daily-router
  // destination (its content, checked above, still matters), but is no longer offered as a navigable
  // choice from the academy hub.
  assert.doesNotMatch(hub, /integrated-path/);
  assert.match(hub, /PROGRESS REFERENCE/);
  assert.match(hub, /Return to Today/);
  assert.equal(path.weeks.length, 8);
  for (const week of path.weeks) {
    assert.ok(week.evidencePrefixes.length);
    assert.ok(week.evidenceTarget >= 2);
    for (const route of [week.gemara, week.canon, week.review]) assert.equal((await stat(route)).isFile(), true);
  }
});
