import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('daily session honors the learner rhythm without changing the next skill', () => {
  const html = fs.readFileSync('daily-router.html', 'utf8');
  const client = fs.readFileSync('daily-router.js', 'utf8');
  const server = fs.readFileSync('server.mjs', 'utf8');
  assert.match(html, /session-duration/);
  assert.match(client, /learner\.rhythm/);
  assert.match(client, /three-times-weekly/);
  assert.match(server, /rhythmMinutes/);
  assert.match(server, /learner\.rhythm/);
});
