import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('the learner journey presents 100 source encounters as sixteen earned phases', async () => {
  const [html, script, styles] = await Promise.all(['journey.html', 'journey.js', 'journey.css'].map((file) => readFile(new URL(`../${file}`, import.meta.url), 'utf8')));
  assert.match(html, /100 MOVES/);
  assert.match(html, /16 EARNED PHASES/);
  assert.match(html, /long-term mastery map/);
  assert.match(script, /phaseGuides/);
  assert.match(script, /checkpoint required/);
  assert.match(styles, /phase-checkpoint/);
});
