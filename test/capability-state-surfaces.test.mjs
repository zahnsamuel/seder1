import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const files = [
  'path.html',
  'path.js',
  'academy.html',
  'academy.js',
  'academy-next.html',
  'academy-next.js',
  'academy-evidence.html',
  'academy-evidence.js',
  'daily-recall.html',
  'daily-recall.js',
  'review.html',
  'review.js',
  'my-graph.html',
  'my-graph.js',
  'integrated-path.html',
  'integrated-path.js',
  'study-record.html',
  'study-record.js',
  'diagnostic.js',
  'jla-practice.html',
  'jla-practice.js'
];

const load = (file) => readFile(new URL(`../${file}`, import.meta.url), 'utf8');

const SCOREBOARD = [
  ['0 XP', /0 XP/],
  ['XP interpolation', /\$\{[^}]*\} XP/],
  ['XP template', /`[^`]* XP`/],
  ['plus-ten XP', /\+10 XP/],
  ['plus-five XP', /\+5 XP/],
  ['XP earned', /XP EARNED/],
  ['percent progress', /levelProgress\}%/],
  ['percent demonstrated', /%\s*demonstrated/i],
  ['percent secure', /%\s*secure/i],
  ['mastery markers', /MASTERY MARKERS/],
  ['literacy level', /literacy level/i],
  ['reading level', /reading level/i],
  ['your next level', /your next level/i],
  ['permanent level', /permanent level/i],
  ['demonstrated mastery', /demonstrated mastery/i],
  ['day mastered', /DAY MASTERED/],
  ['mastery in motion', /Mastery in motion/]
];

test('path and academy reference surfaces do not show leftover XP / % / level copy', async () => {
  for (const file of files) {
    const source = await load(file);
    for (const [label, pattern] of SCOREBOARD) {
      assert.doesNotMatch(source, pattern, `${file} still has learner-facing ${label}`);
    }
  }
});

test('path and academy reference surfaces speak emerging / secure / transferable / durable', async () => {
  const [pathHtml, pathJs, academyHtml, academyJs, nextHtml, nextJs] = await Promise.all(files.slice(0, 6).map(load));

  assert.match(pathHtml, /capability-state\.js/);
  assert.match(academyHtml, /capability-state\.js/);
  assert.match(nextHtml, /capability-state\.js/);

  assert.match(pathJs, /capabilityHeaderText/);
  assert.match(pathJs, /capabilityStates/);
  assert.match(pathHtml, /Emerging|Secure|Transferable|Durable|leadingCapabilityState/);
  assert.match(pathHtml, /THIS CAPABILITY/);
  assert.doesNotMatch(pathHtml, /MASTERY TARGET/);

  assert.match(academyJs, /capabilityChrome/);
  assert.match(academyJs, /capabilitySentence/);
  assert.match(academyJs, /not yet secure/);
  assert.match(academyJs, /Continue on Today/);

  assert.match(nextJs, /capabilitySentence/);
  assert.match(nextJs, /least secure evidence/);
  assert.match(nextJs, /transferable/);
  assert.doesNotMatch(nextJs, /percent\(/);
});

test('leftover progress surfaces speak capability states instead of XP / level / %', async () => {
  const [
    evidenceHtml, evidenceJs, recallHtml, recallJs, reviewHtml, reviewJs,
    graphHtml, graphJs, pathHtml, pathJs, recordHtml, recordJs, diagnosticJs
  ] = await Promise.all([
    'academy-evidence.html', 'academy-evidence.js', 'daily-recall.html', 'daily-recall.js',
    'review.html', 'review.js', 'my-graph.html', 'my-graph.js', 'integrated-path.html',
    'integrated-path.js', 'study-record.html', 'study-record.js', 'diagnostic.js'
  ].map(load));

  assert.match(evidenceHtml, /capability-state\.js/);
  assert.match(evidenceJs, /capabilityHeaderText/);
  assert.match(evidenceJs, /EVIDENCE RECORDED/);
  assert.match(evidenceHtml, /OPEN TOMORROW/);

  assert.match(recallHtml, /capability-state\.js/);
  assert.match(recallJs, /capabilityHeaderText/);

  assert.match(reviewHtml, /capability-state\.js/);
  assert.match(reviewJs, /capabilityHeaderText/);
  assert.match(reviewJs, /item\.feedback/);

  assert.match(graphHtml, />Secure</);
  assert.doesNotMatch(graphHtml, />Mastered</);
  assert.match(graphJs, /stateLabel = \{ mastered: 'Secure'/);
  assert.match(graphJs, /You have secured/);

  assert.match(pathHtml, /capability-state\.js/);
  assert.match(pathHtml, /ON YOUR OWN/);
  assert.match(pathJs, /capabilityHeaderText/);

  assert.match(recordHtml, /capability-state\.js/);
  assert.match(recordHtml, /Capabilities in motion/);
  assert.match(recordJs, /capabilityEyebrow/);
  assert.match(recordJs, /class="state secure">Secure/);

  assert.match(diagnosticJs, /not a score/);
  assert.match(diagnosticJs, /already look secure/);
  assert.match(diagnosticJs, /status = 'Emerging'/);
  assert.match(diagnosticJs, /status = 'Secure'/);
});
