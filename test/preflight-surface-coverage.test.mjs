import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync('scripts/preflight.mjs', 'utf8');

test('launch preflight covers learner, account, and public trust surfaces', () => {
  for (const route of ['/seder.html', '/demo.html', '/sign-in.html', '/placement.html', '/daily-router.html', '/path.html', '/profile.html', '/privacy.html', '/terms.html', '/support.html']) {
    assert.match(source, new RegExp(route.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')));
  }
  assert.match(source, /Key learner routes serve 200/);
});
