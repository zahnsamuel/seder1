import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (p) => JSON.parse(readFileSync(new URL(`../${p}`, import.meta.url), 'utf8'));
const graph = read('data/foundation-skill-graph.json');
const contentMap = read('data/foundation-content-map.json');
const layer = read('data/foundation-content-contexts.json');
const skillIds = new Set(graph.skills.map((s) => s.id));

const FAMILY = { torah: 'tanakh', mishnah: 'rabbinic', gemara: 'rabbinic', halakha: 'halakhic', tefillah: 'liturgical', thought: 'thought', mussar: 'thought', chassidus: 'thought', history: 'historical' };

test('the content-context layer is in sync with the graph version', () => {
  assert.equal(layer.graphVersion, graph.version);
  assert.match(layer.generatedBy, /build-content-contexts\.mjs/);
});

test('every context is a first-class node referencing a real skill (§2.2 shape)', () => {
  for (const c of layer.contexts) {
    for (const key of ['id', 'skill', 'ref', 'genre', 'family', 'sources']) assert.ok(key in c, `context has ${key}`);
    assert.ok(skillIds.has(c.skill), `context skill ${c.skill} is real`);
    assert.equal(c.family, FAMILY[c.genre] || c.genre, 'family derived from genre');
  }
});

test('no reference is invented — every context traces to inline or the content map', () => {
  const inlineRefs = new Map(graph.skills.map((s) => [s.id, new Set((s.sourceContexts || []).map((x) => x.ref))]));
  const mapRefs = new Map(graph.skills.map((s) => [s.id, new Set((contentMap.bySkill?.[s.id] || []).map((x) => x.ref))]));
  for (const c of layer.contexts) {
    const fromInline = inlineRefs.get(c.skill)?.has(c.ref);
    const fromMap = mapRefs.get(c.skill)?.has(c.ref);
    assert.ok(fromInline || fromMap, `context ${c.id} (${c.ref}) traces to a real source`);
    // `sources` provenance must be accurate, and only from the two real sources.
    for (const src of c.sources) assert.ok(['inline', 'content-map'].includes(src), `source ${src} is valid`);
    if (c.sources.includes('inline')) assert.ok(fromInline, 'inline provenance is accurate');
    if (c.sources.includes('content-map')) assert.ok(fromMap, 'content-map provenance is accurate');
  }
});

test('contexts are deduplicated by ref within a skill', () => {
  const seen = new Set();
  for (const c of layer.contexts) {
    const key = `${c.skill}::${c.ref}`;
    assert.ok(!seen.has(key), `no duplicate context ${key}`);
    seen.add(key);
  }
});

test('per-skill tallies and meetsStep8 are accurate', () => {
  const tally = {};
  for (const c of layer.contexts) {
    tally[c.skill] = tally[c.skill] || { contexts: 0, families: new Set() };
    tally[c.skill].contexts += 1;
    tally[c.skill].families.add(c.family);
  }
  for (const skill of graph.skills) {
    const p = layer.perSkill[skill.id];
    assert.ok(p, `perSkill has ${skill.id}`);
    assert.equal(p.contexts, tally[skill.id]?.contexts || 0);
    assert.equal(p.families, tally[skill.id]?.families.size || 0);
    assert.equal(p.meetsStep8, p.contexts >= 3 && p.families >= 2);
  }
});

test('merging the two real sources materially advances step 8, and shortfalls are reported honestly', () => {
  const meeting = Object.values(layer.perSkill).filter((p) => p.meetsStep8).length;
  // The merge must clearly beat the sparse inline baseline (6/49 had >=3 contexts).
  assert.ok(meeting >= 40, `step 8 coverage ${meeting}/49 is a real advance`);
  assert.equal(layer.skillsMeetingStep8, `${meeting}/${graph.skills.length}`);
  // shortfall lists exactly the skills that do not meet step 8 — not padded to hide the gap.
  const shortIds = new Set(layer.shortfall.map((s) => s.skill));
  const expectedShort = new Set(Object.entries(layer.perSkill).filter(([, p]) => !p.meetsStep8).map(([id]) => id));
  assert.deepEqual([...shortIds].sort(), [...expectedShort].sort());
});
