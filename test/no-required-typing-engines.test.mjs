import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('shared engines match production checks to their competency', async () => {
  const [course, lab, canon] = await Promise.all(['course-engine.js', 'lab.js', 'canon-course.js'].map((file) => readFile(new URL(`../${file}`, import.meta.url), 'utf8')));
  assert.match(course, /if\(step\.typed\)\{renderTyped/);
  assert.match(course, /const input=document\.createElement\('input'\)/);
  assert.match(course, /step\.acceptable/);
  assert.doesNotMatch(course, /shuffle\(\[correct/);
  assert.ok(lab.indexOf('[step.translation') < lab.indexOf("const input = document.createElement('input')"));
  assert.ok(lab.indexOf('[step.translation') < lab.indexOf('const wrap = document.createElement'));
  assert.ok(canon.indexOf('SOURCE EXPLANATION CHECK') < canon.indexOf('typedInput'));
  for (const source of [course, lab, canon]) assert.match(source, /Math\.random/);
});
