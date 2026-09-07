import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { loadUnits } from '../scripts/audit-content.mjs';
import { nonGemaraSkillGraph } from '../data/non-gemara-skill-graph.mjs';
import { contentSkillGraph } from '../data/content-skill-graph.mjs';
import { nextGraphPractice } from '../data/curriculum-engine.mjs';
import { buildContentSkillGraph, serializeContentSkillGraph } from '../scripts/build-skill-graph.mjs';

const lf = (s) => s.replace(/\r\n/g, '\n');
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const core = JSON.parse(readFileSync(join(root, 'data', 'skill-graph.json'), 'utf8')).skills;
const merged = [...core, ...nonGemaraSkillGraph, ...contentSkillGraph];
const byId = new Map(merged.map((skill) => [skill.id, skill]));

test('content-skill-graph.mjs is in sync with assessed content', () => {
  const committed = readFileSync(join(root, 'data', 'content-skill-graph.mjs'), 'utf8');
  assert.equal(lf(committed), lf(serializeContentSkillGraph(buildContentSkillGraph(root))),
    'data/content-skill-graph.mjs is stale — run: node scripts/build-skill-graph.mjs');
});

test('every skill assessed in a content unit is reachable in the adaptive graph', () => {
  const assessed = new Set();
  for (const unit of loadUnits(root)) for (const step of unit.steps) if (step.skill) assessed.add(step.skill);
  const missing = [...assessed].filter((id) => !byId.has(id));
  assert.deepEqual(missing, [], `skills assessed but absent from the graph (run: node scripts/build-skill-graph.mjs): ${missing.slice(0, 8).join(', ')}${missing.length > 8 ? ` … +${missing.length - 8} more` : ''}`);
});

test('the merged graph has no duplicate ids and every prerequisite resolves', () => {
  assert.equal(byId.size, merged.length, 'duplicate skill ids across skill-graph.json / non-gemara / content modules');
  const broken = merged.flatMap((skill) => (skill.prerequisites || []).filter((id) => !byId.has(id)).map((id) => `${skill.id} -> ${id}`));
  assert.deepEqual(broken, [], `unresolvable prerequisites: ${broken.slice(0, 6).join('; ')}`);
});

test('content-move nodes stay an index: they never win as the graph-practice skill', async () => {
  const mastery = Object.fromEntries(merged.map((skill) => [skill.id, .9]));
  delete mastery['lab-shabbat-count'];
  delete mastery['hebrew-page-orientation'];
  const next = await nextGraphPractice(root, { mastery });
  assert.notEqual(next?.skill?.id, 'lab-shabbat-count');
  assert.notEqual(next?.skill?.id, 'hebrew-page-orientation');
  if (next) {
    assert.match(next.skill.id, /^fnd-/);
    assert.ok(next.contentSkill);
    assert.notEqual(next.contentSkill, next.skill.id);
  }
  const forFoundation = await nextGraphPractice(root, { mastery }, 'fnd-arg-claim');
  assert.equal(forFoundation?.skill?.id, 'fnd-arg-claim');
  assert.equal(forFoundation?.url, 'gemara-toolkit.html');
  assert.equal(forFoundation?.contentSkill, 'tentative-inference');
});
