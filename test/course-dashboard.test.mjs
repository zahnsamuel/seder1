import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('course dashboard links each course to its own resumable route and capstone', async () => {
  const [html, js] = await Promise.all(['course-dashboard.html', 'course-dashboard.js'].map((file) => readFile(file)));
  assert.match(html.toString(), /course-dashboard\.js/);
  assert.match(js.toString(), /canon-course\.html\?course=\$\{course\.id\}/);
  assert.match(js.toString(), /canon-capstone\.html\?course=\$\{course\.id\}/);
  assert.match(js.toString(), /seder-course-\$\{course\.id\}/);
});
