import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('the Seder front door previews the current journey instead of rendering all 100 moves', async () => {
  const [html, script] = await Promise.all(['seder.html', 'seder.js'].map((file) => readFile(new URL(`../${file}`, import.meta.url), 'utf8')));
  assert.match(html, /YOUR NEXT MOVES/);
  assert.match(html, /Open the full six-level journey/);
  assert.match(html, /href="journey\.html"/);
  assert.match(html, /Start with a fresh learner/);
  assert.match(html, /href="profile\.html"/);
  assert.match(script, /const journeyPreview/);
  assert.match(script, /journeyPreview\(journey\.nodes\)/);
});
