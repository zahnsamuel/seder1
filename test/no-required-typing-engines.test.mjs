import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('shared course, lab, and canon-course production gates offer choices before any legacy typing code', async () => {
  const [course, lab, canon] = await Promise.all(['course-engine.js', 'lab.js', 'canon-course.js'].map((file) => readFile(new URL(`../${file}`, import.meta.url), 'utf8')));
  assert.ok(course.indexOf('shuffle([correct') < course.indexOf("const input=document.createElement('input')"));
  assert.ok(course.indexOf('shuffle([correct') < course.indexOf('const wrap=document.createElement'));
  assert.ok(lab.indexOf('[step.translation') < lab.indexOf("const input = document.createElement('input')"));
  assert.ok(lab.indexOf('[step.translation') < lab.indexOf('const wrap = document.createElement'));
  assert.ok(canon.indexOf('SOURCE EXPLANATION CHECK') < canon.indexOf('typedInput'));
  for (const source of [course, lab, canon]) assert.match(source, /Math\.random/);
});
