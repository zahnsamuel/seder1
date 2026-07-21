import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('first Academy graph skills have an explicit scholarly review register', () => {
  const register = JSON.parse(fs.readFileSync('data/foundation-source-review.json', 'utf8'));
  assert.equal(register.overallStatus, 'awaiting-human-scholar-review');
  assert.deepEqual(register.reviewGates, ['primary-text-verified', 'translation-checked', 'context-checked', 'assessment-reviewed', 'accessibility-checked', 'safety-boundary-checked']);
  assert.equal(register.skills.length, 10);
  for (const skill of register.skills) {
    assert.ok(skill.skillId.startsWith('fnd-'));
    assert.ok(skill.sourceContexts.length >= 2);
    for (const context of skill.sourceContexts) assert.match(context.sefariaUrl, /^https:\/\/www\.sefaria\.org\//);
    assert.equal(skill.reviewStatus, 'awaiting-human-scholar-review');
  }
});
