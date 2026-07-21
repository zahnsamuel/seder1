import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync(new URL('../server.mjs', import.meta.url), 'utf8');

test('server recommendation has a safe Academy foundation path for new graph-scored learners', () => {
  assert.match(source, /academyFoundationRecommendation/);
  assert.match(source, /foundationScores/);
  assert.match(source, /daily-router\.html\?foundationSkill=/);
  assert.match(source, /foundationGraduated/);
});
