import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (p) => JSON.parse(readFileSync(new URL(`../${p}`, import.meta.url), 'utf8'));
const graph = read('data/foundation-skill-graph.json');
const sessions = read('data/jla-academy-sessions.json');
const gradMap = read('data/graduation-skill-map.json').map;
const layer = read('data/foundation-assessment-items.json');
const skillIds = new Set(graph.skills.map((s) => s.id));
const sessionBySlice = new Map(sessions.map((s) => [s.skillId, s]));
const FAMILIES = new Set(['tanakh', 'rabbinic', 'halakhic', 'liturgical', 'thought', 'historical']);

test('the assessment-item layer is in sync with the graph version', () => {
  assert.equal(layer.graphVersion, graph.version);
  assert.match(layer.generatedBy, /build-assessment-items\.mjs/);
});

test('NO answer key is ever shipped — correct stays server-side', () => {
  // This is the security-critical invariant: a client-safe layer must never carry `correct`.
  for (const item of layer.items) {
    assert.ok(!('correct' in item), `${item.id} does not ship a correct answer`);
    assert.ok(!('correctChoiceId' in item), `${item.id} does not ship correctChoiceId`);
    assert.equal(item.scoredBy.file, 'data/jla-academy-sessions.json');
    assert.equal(item.scoredBy.skillId, item.sliceItem);
  }
});

test('every item attaches to a real graph skill via a real, authored, mapped academy item', () => {
  for (const item of layer.items) {
    assert.ok(skillIds.has(item.skill), `${item.id} skill is a real graph node`);
    const session = sessionBySlice.get(item.sliceItem);
    assert.ok(session, `${item.sliceItem} is a real academy session`);
    assert.equal(gradMap[item.sliceItem]?.graphSkill, item.skill, 'map pairing matches');
    assert.equal(item.confidence, gradMap[item.sliceItem]?.confidence, 'confidence carried from the map, not invented');
  }
});

test('stems and choices are the authored item verbatim — nothing invented', () => {
  for (const item of layer.items) {
    const session = sessionBySlice.get(item.sliceItem);
    assert.equal(item.stem, session.prompt);
    assert.equal(item.choices.length, session.choices.length);
    for (const [i, choice] of item.choices.entries()) {
      assert.equal(choice.id, session.choices[i].id);
      assert.equal(choice.text, session.choices[i].text);
    }
  }
});

test('every item has a recognized source family and the pending-calibration fields', () => {
  for (const item of layer.items) {
    assert.ok(FAMILIES.has(item.sourceFamily), `${item.id} family ${item.sourceFamily} is recognized`);
    assert.equal(item.type, 'recognition');
    assert.deepEqual(item.misconceptions, []); // named in the audit
    assert.equal(item.difficulty, null);       // calibrated in the pilot
    assert.equal(item.discrimination, null);
  }
});

test('ids are unique and coverage is reported honestly (no fake item banks)', () => {
  const ids = layer.items.map((i) => i.id);
  assert.equal(new Set(ids).size, ids.length, 'item ids are unique');
  assert.equal(layer.coverage.items, layer.items.length);
  assert.equal(layer.coverage.graphSkillsWithItem, new Set(layer.items.map((i) => i.skill)).size);
  // Materializing existing items does NOT manufacture >=3-item banks; that gap must stay visible.
  assert.equal(layer.coverage.graphSkillsWithItemBank, 0);
});

test('unmapped academy items get no node (they have no graph home yet)', () => {
  const mappedSlices = new Set(layer.items.map((i) => i.sliceItem));
  for (const session of sessions) {
    const mapped = Boolean(gradMap[session.skillId]?.graphSkill);
    if (!mapped) assert.ok(!mappedSlices.has(session.skillId), `${session.skillId} (unmapped) has no item node`);
  }
});
