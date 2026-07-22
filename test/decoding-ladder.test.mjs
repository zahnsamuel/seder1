import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { validateLadder } from '../scripts/check-decoding-ladder.mjs';

const ladder = JSON.parse(readFileSync('data/hebrew-decoding-ladder.json', 'utf8'));

test('hebrew decoding ladder is structurally sound', () => {
  const { errors } = validateLadder(ladder);
  assert.deepEqual(errors, [], `decoding ladder has structural errors:\n${errors.join('\n')}`);
});

test('decoding ladder bands and skills are coherent', () => {
  const bandIds = ladder.bands.map((b) => b.id);
  assert.deepEqual(bandIds, ['0.1', '0.2', '0.3', '0.4'], 'ladder covers Bands 0.1-0.4');
  assert.ok(ladder.skills.length >= 25, `expected >=25 skills, got ${ladder.skills.length}`);
  for (const s of ladder.skills) {
    assert.match(s.id, /^dec-/, `${s.id} must be a dec- id`);
    assert.ok(bandIds.includes(s.band), `${s.id} sits in a declared band`);
    // Decoding is genre-less: unlike the foundation graph, a ladder skill must NOT carry canon
    // sourceContexts — that separation is the whole reason this is its own dataset.
    assert.ok(!('sourceContexts' in s), `${s.id} must not carry canon sourceContexts`);
  }
  assert.equal(ladder.pronunciation, 'modern-israeli');
});

test('every graduation-required decoding skill exists', () => {
  const ids = new Set(ladder.skills.map((s) => s.id));
  for (const req of ladder.graduationContract.requiredSkills) {
    assert.ok(ids.has(req), `graduation requires ${req}, which must be a real skill`);
  }
});
