import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

// The front door no longer renders the journey map at all — not even a preview. The single
// "today's next step" card and the adaptive primary action carry the "one thing at a time"
// promise; the full six-level map lives on journey.html, off the first screen. This guards that
// the map does not return to the landing page.
test('the front door shows one next step, not the journey map', async () => {
  const [html, script] = await Promise.all(['seder.html', 'seder.js'].map((file) => readFile(new URL(`../${file}`, import.meta.url), 'utf8')));
  assert.match(html, /id="todayTitle"/);
  assert.match(html, /id="nextAction"/);
  assert.doesNotMatch(html, /YOUR NEXT MOVES/);
  assert.doesNotMatch(html, /journeyMap/);
  assert.doesNotMatch(html, /Open the full six-level journey/);
  assert.doesNotMatch(script, /journeyPreview/);
});
