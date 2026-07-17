import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('capstones remain course-specific, require all course moves, and use guided comparison', async () => {
  const [js, html] = await Promise.all(['canon-capstone.js', 'canon-capstone.html'].map((file) => readFile(file, 'utf8')));
  assert.match(js, /course-capstones/);
  assert.match(js, /canon-six-session-courses/);
  assert.match(js, /completed\.size\s*<\s*required/);
  assert.match(js, /canon-course\.html\?course=\$\{cap\.id\}/);
  assert.match(js, /judgment !== 'context'/);
  assert.doesNotMatch(html, /textarea/i);
});
