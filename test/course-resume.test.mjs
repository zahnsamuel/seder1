import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('shared source courses resume the saved step and clear it at completion', async () => {
  const source = await readFile(new URL('../course-engine.js', import.meta.url), 'utf8');
  assert.match(source, /seder-course-progress:\$\{courseLearner\}:\$\{config\.stage\}/);
  assert.match(source, /localStorage\.getItem\(courseProgressKey\)/);
  assert.match(source, /localStorage\.setItem\(courseProgressKey,String\(courseIndex\)\)/);
  assert.match(source, /localStorage\.removeItem\(courseProgressKey\)/);
});
