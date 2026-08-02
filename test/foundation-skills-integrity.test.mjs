import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const graph = JSON.parse(fs.readFileSync(new URL('../data/foundation-skill-graph.json', import.meta.url), 'utf8'));

test('foundation graph has unique skills with resolvable prerequisites', () => {
  const ids = graph.skills.map((skill) => skill.id);
  assert.equal(new Set(ids).size, ids.length);
  const known = new Set(ids);
  for (const skill of graph.skills) {
    assert.ok(skill.title && Number.isInteger(skill.layer) && skill.teachingMove && skill.transfer); // layer 0 (decoding) is valid
    for (const prerequisite of skill.prerequisites) assert.ok(known.has(prerequisite), `${skill.id} has missing prerequisite ${prerequisite}`);
  }
});

test('foundation graph is acyclic and every skill has a transfer context', () => {
  const byId = new Map(graph.skills.map((skill) => [skill.id, skill]));
  const visiting = new Set();
  const visited = new Set();
  const visit = (id) => {
    if (visiting.has(id)) throw new Error(`cycle at ${id}`);
    if (visited.has(id)) return;
    visiting.add(id);
    for (const prerequisite of byId.get(id).prerequisites) visit(prerequisite);
    visiting.delete(id); visited.add(id);
  };
  for (const skill of graph.skills) { visit(skill.id); assert.ok(skill.transfer.length > 0); assert.ok(skill.sourceContexts?.length > 0); assert.ok(skill.checks?.length > 0); }
  assert.ok(graph.skills.length >= 40);
});
