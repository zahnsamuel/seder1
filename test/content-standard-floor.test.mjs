import test from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { auditAll } from '../scripts/audit-content.mjs';

// Corpus-wide guard for docs/content-standard.md. Every content unit (SederCourse arcs/units,
// tractate labs, canon six-session courses) must audit at >= 8. This locks in the 2026-07 pass
// that raised the whole corpus to standard, so a future distractor edit or a new unit cannot
// silently drop below it. The score itself (six dimensions, length-bias among them) is defined
// in scripts/audit-content.mjs; this asserts the documented floor rather than any single metric,
// because a unit can legitimately reach 8 with a partial length-bias score.
const root = fileURLToPath(new URL('..', import.meta.url));

test('every content unit meets the score-8 content standard', () => {
  const results = auditAll(root);
  assert.ok(results.length >= 90, `expected the full corpus to load, got ${results.length} units`);
  const below = results
    .filter((r) => r.score < 8)
    .map((r) => `${r.id} (score ${r.score}, length-bias ${r.correctLongest}/${r.mcCount}, prod ${r.production}, steps ${r.n})`);
  assert.deepEqual(below, [], `these units are below the score-8 standard:\n  ${below.join('\n  ')}`);
});
