import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('course dashboard makes Gemara-to-canon connections visible in the learner path', async () => {
  const [html, source] = await Promise.all(['course-dashboard.html', 'course-connections.js'].map((file) => readFile(new URL(`../${file}`, import.meta.url), 'utf8')));
  assert.match(html, /id="convergence"/);
  assert.match(html, /course-connections\.js/);
  assert.match(source, /Berakhot and Shema/);
  assert.match(source, /Shabbat and responsibility/);
  assert.match(source, /skills established/);
});
