import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('a final phase checkpoint hands the learner into an earned-level completion screen', async () => {
  const [checkpoint, html, script, styles] = await Promise.all(['phase-checkpoint.js', 'level-complete.html', 'level-complete.js', 'level-complete.css'].map((file) => readFile(file, 'utf8')));
  for (const phase of ['phase-2', 'phase-4', 'phase-6', 'phase-8', 'phase-10', 'phase-12', 'phase-14', 'phase-16']) assert.match(checkpoint, new RegExp(`'${phase}':`));
  assert.match(checkpoint, /level-complete\.html\?level=/);
  for (const phrase of ['LEVEL COMPLETE', 'WHAT YOU ESTABLISHED', 'Begin Level', 'Review this level']) assert.match(html, new RegExp(phrase));
  assert.match(script, /Foundations/);
  assert.match(script, /skillsForLevel/);
  assert.match(script, /recorded mastery evidence/);
  assert.match(styles, /\.evidence/);
  assert.match(styles, /\.next/);
});
