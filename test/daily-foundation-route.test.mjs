import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('daily router opens an explicit Academy foundation skill session', () => {
  const source = fs.readFileSync('daily-router.js', 'utf8');
  assert.match(source, /URLSearchParams\(location\.search\).*foundationSkill/);
  assert.match(source, /academy-session\.html\?skill=/);
  assert.match(source, /isFoundation/);
  assert.match(source, /Retrieve/);
  assert.match(source, /Encounter/);
});
