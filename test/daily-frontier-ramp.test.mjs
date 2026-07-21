import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('Today includes graph frontier practice and a gentle lapsed-learner ramp', async () => {
  const js = await readFile(new URL('../daily-router.js', import.meta.url), 'utf8');
  assert.match(js, /graph-practice/);
  assert.match(js, /Frontier/);
  assert.match(js, /Welcome back/);
  assert.match(js, /One small retrieval restarts your rhythm/);
  assert.match(js, /__academyLapsed/);
});
