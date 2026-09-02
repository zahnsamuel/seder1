import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('Today presents one prominent evidence-led next action', async () => {
  const html = await readFile(new URL('../daily-router.html', import.meta.url), 'utf8');
  const js = await readFile(new URL('../jla-next-action.js', import.meta.url), 'utf8');
  assert.match(html, /data-jla-next-action/);
  assert.equal((html.match(/jla-next-action__cta/g) || []).length, 1);
  assert.doesNotMatch(html, /session-steps|course-dashboard|Full map/);
  assert.match(js, /\/next-action/);
  assert.match(js, /replaceChildren/);
  assert.doesNotMatch(js, /innerHTML/);
});