import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const js = readFileSync(new URL('../scripts/go-live-check.mjs', import.meta.url), 'utf8');

test('the go-live check exercises the pilot-critical paths and gates on failure', () => {
  // Confirms SQLite hosted mode, not just any 200.
  assert.match(js, /persistence !== 'sqlite-ready'/);
  // The learner journey.
  for (const path of ['/api/auth/signup', '/api/graph/diagnostic', "type: 'answer_submitted'", "type: 'feedback'"]) {
    assert.match(js, new RegExp(path.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')));
  }
  // The security invariants a pilot must not ship without.
  assert.match(js, /ISOLATION IS BROKEN/);        // one learner must not read another
  assert.match(js, /operator analytics is gated/); // admin endpoint rejects an unauthenticated caller
  // It fails the process on any failed check so it can gate a deploy.
  assert.match(js, /process\.exit\(failed \? 1 : 0\)/);
});
