import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { loadUnits } from '../scripts/audit-content.mjs';
import { tagFor, genreOf } from '../scripts/build-foundation-content-map.mjs';
import { knowledgeFrontier } from '../data/knowledge-graph.mjs';
import { pickFrontierFoundationSkill, contentSkillToFoundationId } from '../data/next-action.mjs';

const proposal = JSON.parse(readFileSync(new URL('../data/fat-bucket-first-split.json', import.meta.url), 'utf8'));
const graph = JSON.parse(readFileSync(new URL('../data/foundation-skill-graph.json', import.meta.url), 'utf8'));
const starter = JSON.parse(readFileSync(new URL('../data/foundation-starter-set.json', import.meta.url), 'utf8'));
const map = JSON.parse(readFileSync(new URL('../data/foundation-content-map.json', import.meta.url), 'utf8'));
const doc = readFileSync(new URL('../docs/fat-bucket-first-split.md', import.meta.url), 'utf8');

const byId = new Map(graph.skills.map((s) => [s.id, s]));
const starterIds = starter.starterSet.map((s) => s.id);
const childId = proposal.firstSplit.child.id;

function indexSteps() {
  const steps = [];
  for (const unit of loadUnits('.')) {
    const genre = genreOf(unit.id);
    for (const step of unit.steps) {
      if (!step.skill) continue;
      steps.push({
        unit: unit.id,
        genre,
        skill: step.skill,
        mode: step.mode || '',
        competency: step.competency || '',
        fnd: tagFor(step, genre)
      });
    }
  }
  return steps;
}

const steps = indexSteps();
const tagged = (id) => steps.filter((s) => s.fnd === id);

test('fat-bucket first split is a proposal, not a live graph edit', () => {
  assert.equal(proposal.status, 'proposal');
  assert.equal(proposal.graphVersion, graph.version);
  assert.ok(byId.has(proposal.firstSplit.parent), 'parent must already exist');
  assert.ok(!byId.has(childId), `${childId} must not be in the live graph until the implementer PR`);
  assert.equal(starter.starterSet.length, 29);
  assert.ok(!starterIds.includes(childId));
  assert.ok(!starter.frozen.some((s) => s.id === childId));
  assert.match(doc, /fnd-arg-resolve-distinction/);
  assert.match(doc, /DISTINCTION ANSWER/);
});

test('case leftover is already the skill’s own move — do not split it again', () => {
  const leftover = tagged('fnd-case-what-happens');
  assert.ok(leftover.length > 0, 'case-what-happens still has mapped steps');
  const allowed = new Set(proposal.audit.buckets['fnd-case-what-happens'].allowedLeftoverModes);
  const unexpected = [...new Set(leftover.map((s) => s.mode).filter((m) => m && !allowed.has(m)))];
  assert.deepEqual(unexpected, [], `case leftover has modes that are not CASE ORIENTATION / FACT PATTERN: ${unexpected.join(', ')}`);
  for (const id of ['fnd-case-category', 'fnd-case-procedure', 'fnd-case-obligation', 'fnd-case-what-changes']) {
    assert.ok(byId.has(id), `${id} (graph 0.2.0 child) missing — case bucket is not closed`);
    assert.ok(tagged(id).length > 0, `${id} has no content; the prior split would be hollow`);
  }
});

test('role-ruling-vs-discussion still has no remode signal for a child', () => {
  const rows = tagged('fnd-role-ruling-vs-discussion');
  assert.ok(rows.length >= 50, `role bucket unexpectedly thin (${rows.length})`);
  const unmoded = rows.filter((s) => !s.mode).length;
  assert.ok(unmoded >= 30, `expected a large unmoded sourceReasoning catch-all, found ${unmoded}`);
  const distinctive = rows.filter((s) => /RULING|DISCUSSION|ASIDE|TERMINOLOGY/.test(s.mode.toUpperCase()));
  assert.equal(distinctive.length, 0, 'a distinctive role-child mode appeared — update the proposal before splitting');
});

test('proposed retag targets still exist and still tag as declared', () => {
  const bySkill = new Map(steps.map((s) => [s.skill, s]));
  assert.equal(proposal.retag.length, 4);
  for (const row of proposal.retag) {
    const step = bySkill.get(row.contentSkill);
    assert.ok(step, `missing content skill ${row.contentSkill}`);
    assert.equal(step.unit, row.unit);
    assert.equal(step.mode, row.currentMode, `${row.contentSkill} mode drifted (now ${step.mode})`);
    assert.equal(step.fnd, row.currentFoundation, `${row.contentSkill} now tags ${step.fnd}`);
    assert.equal(contentSkillToFoundationId(map, row.contentSkill), row.currentFoundation);
  }
  for (const skill of proposal.leaveOnCompareScope) {
    const step = bySkill.get(skill);
    assert.ok(step, `leave-on-compare skill missing: ${skill}`);
    assert.equal(step.fnd, 'fnd-compare-scope', `${skill} is no longer compare-scope; drop it from leaveOnCompareScope`);
  }
});

test('DISTINCTION ANSWER would be stolen by compare-scope until the rubric is ordered', () => {
  assert.equal(
    tagFor({ mode: 'DISTINCTION ANSWER', competency: 'argument', skill: 'probe' }, 'gemara'),
    'fnd-compare-scope',
    'implementer must insert DISTINCTION ANSWER above the L6 DISTINCTION|CONTRAST rule',
  );
  assert.ok(
    !steps.some((s) => /\bDISTINCTION ANSWER\b/.test(s.mode.toUpperCase())),
    'DISTINCTION ANSWER is already in content — the remode landed without the graph child',
  );
});

test('starter-scoped Today would teach the child instead of unresolved after the split', () => {
  const exceptUnresolved = starterIds.filter((id) => id !== 'fnd-arg-unresolved');
  const { frontier } = knowledgeFrontier(graph, exceptUnresolved);
  const starterFrontier = frontier.filter((id) => starterIds.includes(id)).sort();
  assert.deepEqual(starterFrontier, [proposal.routing.starterScopedAfterResponse.todayPicks]);

  const after = ['fnd-arg-unresolved', childId].sort();
  assert.equal(after[0], proposal.routing.starterScopedAfterResponse.afterSplitPicks);
  assert.equal(
    `academy-session.html?skill=${after[0]}`,
    proposal.routing.starterScopedAfterResponse.href,
  );

  const closure = new Set();
  const walk = (id) => {
    if (closure.has(id)) return;
    closure.add(id);
    for (const p of byId.get(id)?.prerequisites || []) walk(p);
  };
  walk('fnd-arg-response');
  const live = pickFrontierFoundationSkill(graph, {
    foundationScores: Object.fromEntries([...closure].map((id) => [id, 0.8]))
  });
  assert.equal(live.id, proposal.routing.liveFullGraphAfterResponseClosure.todayPicks);
});

test('deferred children stay unauthored — no pedagogy sprawl in this proposal', () => {
  const deferred = proposal.deferredChildren.map((c) => c.id);
  assert.deepEqual(deferred, ['fnd-arg-reinterpret', 'fnd-arg-two-answers']);
  for (const id of deferred) assert.ok(!byId.has(id));
  assert.equal(proposal.firstSplit.child.prerequisites[0], 'fnd-arg-response');
  assert.equal(proposal.firstSplit.rubric.token, 'DISTINCTION ANSWER');
});
