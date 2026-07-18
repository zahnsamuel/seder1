import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { loadUnits } from '../scripts/audit-content.mjs';
import { nonGemaraSkillGraph } from '../data/non-gemara-skill-graph.mjs';
import { contentSkillGraph } from '../data/content-skill-graph.mjs';
import { nextGraphPractice } from '../data/curriculum-engine.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const core = JSON.parse(readFileSync(join(root, 'data', 'skill-graph.json'), 'utf8')).skills;
const merged = [...core, ...nonGemaraSkillGraph, ...contentSkillGraph];
const byId = new Map(merged.map((skill) => [skill.id, skill]));

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

test('content skills participate in the teachable frontier, not just the catalog', async () => {
  // Master everything except one lab-entry skill; the frontier must surface exactly that
  // skill, with the lab route attached, proving content nodes flow through the engine.
  const mastery = Object.fromEntries(merged.map((skill) => [skill.id, .9]));
  delete mastery['lab-shabbat-count'];
  const next = await nextGraphPractice(root, { mastery });
  assert.equal(next?.skill?.id, 'lab-shabbat-count');
  assert.equal(next?.url, 'lab.html?tractate=shabbat');
});
