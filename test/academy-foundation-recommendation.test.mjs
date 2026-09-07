import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync(new URL('../server.mjs', import.meta.url), 'utf8');
const graph = JSON.parse(fs.readFileSync(new URL('../data/foundation-skill-graph.json', import.meta.url), 'utf8'));

test('server recommendation has a safe Academy foundation path for new graph-scored learners', () => {
  assert.match(source, /academyFoundationRecommendation/);
  assert.match(source, /foundationScores/);
  assert.match(source, /daily-router\.html\?foundationSkill=/);
  assert.match(source, /foundationGraduated/);
});

test('Academy foundation sequence cites real foundation-graph skill ids', () => {
  const start = source.indexOf('function academyFoundationRecommendation');
  const end = source.indexOf('function keyPrerequisiteRemediationFor');
  const block = source.slice(start, end);
  const ids = [...block.matchAll(/\['(fnd-[a-z0-9-]+)'/g)].map((match) => match[1]);
  assert.ok(ids.length >= 10, 'foundation ladder lists transferable fnd- skills');
  const graphIds = new Set(graph.skills.map((skill) => skill.id));
  for (const id of ids) assert.ok(graphIds.has(id), `${id} must exist on the foundation graph`);
});
