import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

// The adaptive-readiness report (a diagnostic, not a pass/fail gate) must keep running as the
// graph/content/assessment data evolve — a crash here means the report can no longer track the
// v0.1 -> adaptive-graph gap. Also guards that the formal schema doc stays present.

const repoRoot = fileURLToPath(new URL('..', import.meta.url));

test('graph-quality report runs and covers the five layers', () => {
  const out = execFileSync(process.execPath, ['scripts/graph-quality.mjs'], { cwd: repoRoot, encoding: 'utf8' });
  for (const section of ['Skill ontology', 'Edge semantics', 'Content graph', 'Assessment graph', 'Learner model', 'Readiness scorecard']) {
    assert.ok(out.includes(section), `report should include "${section}"`);
  }
  // It reports honest gaps, not a green wash: the typed-edge structure is now built (74/74), but the
  // pedagogical rationales stay unwritten until the educator audit — that gap must still show.
  assert.match(out, /edges typed .*74\/74/);
  assert.match(out, /pedagogical rationale .*0\/74/);
});

test('the formal graph schema doc defines the node classes, edge types, and governance', async () => {
  const doc = await readFile(new URL('../docs/foundation-graph-schema.md', import.meta.url), 'utf8');
  for (const anchor of ['Four node classes', 'Typed edges', 'Capability states', 'versioning', 'Freeze']) {
    assert.ok(doc.includes(anchor), `schema doc should define "${anchor}"`);
  }
});
