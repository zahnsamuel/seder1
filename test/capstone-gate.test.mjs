import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('capstones remain course-specific and require all course moves', async () => {
  const js = await readFile('canon-capstone.js', 'utf8');
  assert.match(js, /course-capstones/);
  assert.match(js, /canon-six-session-courses/);
  assert.match(js, /completed\.size<required/);
  assert.match(js, /canon-course\.html\?course=\$\{cap\.id\}/);
});
