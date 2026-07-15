import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('the learner journey groups 100 source encounters into six earned levels', async () => {
  const [html, script, styles] = await Promise.all(['journey.html', 'journey.js', 'journey.css'].map((file) => readFile(new URL(`../${file}`, import.meta.url), 'utf8')));
  assert.match(html, /100 MOVES/);
  assert.match(html, /6 EARNED LEVELS/);
  assert.match(html, /YOUR CURRENT FOCUS/);
  assert.match(html, /long-term mastery map/);
  assert.match(script, /phaseGuides/);
  assert.match(script, /const levels = \[/);
  assert.match(script, /YOUR CURRENT LEVEL/);
  assert.match(script, /renderFocus/);
  assert.match(script, /Retrieve what is due/);
  assert.match(script, /unlock by earning the level before it/);
  assert.match(script, /complete all \$\{phases\.length\} phase checkpoints to level up/);
  assert.match(script, /checkpoint required/);
  assert.match(styles, /phase-checkpoint/);
  assert.match(styles, /\.focus/);
});
