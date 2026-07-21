import test from 'node:test'; import assert from 'node:assert/strict'; import { readFile } from 'node:fs/promises';
// The inline mastery-status dashboard was removed from the daily page (mentor reset); the adaptive
// Gemara skill map remains its own page for learners who want the wider view.
test('the daily page no longer embeds the mastery dashboard; the adaptive skill map remains its own page', async () => { const [html, map] = await Promise.all(['daily-router.html', 'adaptive-gemara-map.js'].map((file) => readFile(new URL(`../${file}`, import.meta.url), 'utf8'))); assert.doesNotMatch(html, /id="mastery-status"/); assert.match(map, /Read an unfamiliar sugya/); });
