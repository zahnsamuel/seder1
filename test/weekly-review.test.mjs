import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
test('weekly review turns learner evidence into recall and connection prompts', async () => {
  const [html, js] = await Promise.all(['weekly-review.html', 'weekly-review.js'].map((file) => readFile(new URL(`../${file}`, import.meta.url), 'utf8')));
  assert.match(html, /WEEKLY REVIEW/);
  assert.match(js, /RELIABLE SKILLS/);
  assert.match(js, /ONE CONNECTION TO CARRY FORWARD/);
  assert.match(js, /reviewQueue/);
  assert.match(js, /foundation-skill-graph\.json/);
  assert.match(js, /nextFoundation/);
});
