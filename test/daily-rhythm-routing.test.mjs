import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('daily session honors the learner rhythm without changing the next skill', () => {
  const html = fs.readFileSync('daily-router.html', 'utf8');
  const client = fs.readFileSync('jla-next-action.js', 'utf8');
  const server = fs.readFileSync('server.mjs', 'utf8');
  assert.match(html, /data-jla-next-action/);
  assert.match(client, /next-action/);
  assert.doesNotMatch(client, /mastery|reviewQueue|skillId/);
  assert.match(server, /rhythmMinutes/);
  assert.match(server, /learner\.rhythm/);
});
