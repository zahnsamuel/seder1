import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('placement lets learners choose a sustainable Academy rhythm', () => {
  const html = fs.readFileSync('placement.html', 'utf8');
  const js = fs.readFileSync('placement.js', 'utf8');
  const repository = fs.readFileSync('data/repository.mjs', 'utf8');
  assert.match(html, /YOUR LEARNING RHYTHM/);
  for (const rhythm of ['daily', 'three-times-weekly', 'weekly']) assert.match(html, new RegExp(`data-rhythm="${rhythm}"`));
  assert.match(js, /learning_rhythm_set/);
  assert.match(repository, /learning_rhythm_set/);
});
