import test from 'node:test';
import assert from 'node:assert/strict';
import { loadUnits } from '../scripts/audit-content.mjs';

const repairedArcs = ['gittin-arc', 'yevamot-arc', 'horayot-arc', 'keritot-arc'];

test('repaired tractate arcs expose Hebrew source anchors at runtime', () => {
  const units = loadUnits('.');
  for (const id of repairedArcs) {
    const unit = units.find((candidate) => candidate.id === id);
    assert.ok(unit, `${id} must be discoverable by the content loader`);
    assert.ok(unit.steps.length >= 8, `${id} should retain its full learning arc`);
    assert.ok(
      unit.steps.every((step) => /[\u0590-\u05ff]/u.test(step.hebrew || '')),
      `${id} contains a non-Hebrew learner-facing source anchor`
    );
  }
});

test('Keritot preserves its karet category rather than Shabbat labor categories', () => {
  const unit = loadUnits('.').find((candidate) => candidate.id === 'keritot-arc');
  const text = unit.steps.map((step) => `${step.hebrew} ${step.translation}`).join(' ');
  assert.match(text, /כ.{0,3}ר.{0,3}ת/u);
  assert.doesNotMatch(text.toLowerCase(), /avot melachot/);
});
