import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { itemProblem } from '../data/item-authoring-fold.mjs';
import { estimateFrontierFromDiagnostic, nextDiagnosticProbe } from '../data/knowledge-graph.mjs';
import {
  isDecodeSkill,
  isProbeableSkill,
  probeableSkillIds,
  pickDiagnosticItem,
  diagnosticTeachFor
} from '../data/diagnostic-items.mjs';

const load = async (file) => JSON.parse(await readFile(new URL(`../${file}`, import.meta.url), 'utf8'));

const graph = await load('data/foundation-skill-graph.json');
const items = (await load('data/foundation-authored-items.json')).items;
const teachFile = await load('data/foundation-teach.json');
const layerOf = (id) => graph.skills.find((s) => s.id === id)?.layer ?? 99;

test('decode skills and bankless skills are not probeable; authored non-decode skills are', () => {
  for (const skill of graph.skills.filter((s) => s.id.startsWith('fnd-decode-'))) {
    assert.equal(isDecodeSkill(skill.id), true);
    assert.equal(isProbeableSkill(skill.id, items), false, `${skill.id} must not be a placement self-rate or invented glyph check`);
  }
  const probeable = probeableSkillIds(graph, items);
  assert.ok(probeable.length >= 20, `expected a usable authored probe set, got ${probeable.length}`);
  assert.ok(!probeable.some((id) => id.startsWith('fnd-decode-')));
  assert.ok(probeable.includes('fnd-arg-claim'));
  assert.ok(probeable.includes('fnd-orient-source-type'));
  assert.equal(isProbeableSkill('fnd-agency-choose-next', items), false);
});

test('every probeable skill yields a valid authored MC, never a self-rate prompt', () => {
  for (const id of probeableSkillIds(graph, items)) {
    const item = pickDiagnosticItem(id, items, 0);
    assert.ok(item, `${id} must have a pickable item`);
    assert.equal(itemProblem({ stem: item.stem, choices: item.choices, correct: item.correct }), null, `${id} item invalid`);
    assert.doesNotMatch(item.stem, /could you do this reliably/i);
    assert.doesNotMatch(item.choices.join(' '), /I can do this reliably/i);
  }
});

test('genre identification is taught before the placement ask', () => {
  const teach = diagnosticTeachFor('fnd-orient-source-type', teachFile);
  assert.ok(teach.length >= 80);
  assert.match(teach, /torah/i);
  assert.match(teach, /mishnah/i);
  assert.match(teach, /gemara/i);
  assert.match(teach, /commentar/i);
  const item = pickDiagnosticItem('fnd-orient-source-type', items, 0);
  assert.match(item.stem, /what kind of text/i);
});

test('restricted probes never ask a decode skill and still infer it from a pass above', () => {
  const probeable = probeableSkillIds(graph, items);
  const canDo = (id) => layerOf(id) <= 3;
  const responses = {};
  for (let i = 0; i < graph.skills.length + 5; i++) {
    const probe = nextDiagnosticProbe(graph, responses, { probeable });
    if (!probe) break;
    assert.ok(probeable.includes(probe), `${probe} is not probeable`);
    assert.ok(!probe.startsWith('fnd-decode-'));
    responses[probe] = canDo(probe);
  }
  assert.ok(Object.keys(responses).length > 0);
  assert.ok(Object.keys(responses).length < 25, 'still a handful of questions');
  const { known, frontier } = estimateFrontierFromDiagnostic(graph, responses);
  assert.ok(known.some((id) => layerOf(id) === 0), 'decoding layer inferred, not self-rated');
  assert.ok(frontier.length > 0);
});
