import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const files = [
  'path.html',
  'path.js',
  'academy.html',
  'academy.js',
  'academy-next.html',
  'academy-next.js'
];

const load = (file) => readFile(new URL(`../${file}`, import.meta.url), 'utf8');

const SCOREBOARD = [
  ['0 XP', /0 XP/],
  ['XP interpolation', /\$\{[^}]*\} XP/],
  ['XP template', /`[^`]* XP`/],
  ['percent progress', /levelProgress\}%/],
  ['percent demonstrated', /%\s*demonstrated/i],
  ['mastery markers', /MASTERY MARKERS/],
  ['literacy level', /literacy level/i],
  ['reading level', /reading level/i],
  ['your next level', /your next level/i],
  ['demonstrated mastery', /demonstrated mastery/i]
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
  const [pathHtml, pathJs, academyHtml, academyJs, nextHtml, nextJs] = await Promise.all(files.map(load));

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
