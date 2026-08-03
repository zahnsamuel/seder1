import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { foldAuthoredItems, itemProblem } from '../data/item-authoring-fold.mjs';
import { authoredReviewItem } from '../data/curriculum-engine.mjs';

const repoRoot = fileURLToPath(new URL('..', import.meta.url));
const skillIds = JSON.parse(readFileSync(new URL('../data/foundation-skill-graph.json', import.meta.url), 'utf8')).skills.map((s) => s.id);
const goodItem = { sourceRef: 'Gemara Berakhot 2a', stem: 'Which move is this?', choices: ['State the claim', 'Name the speaker', 'Give a ruling'], correct: 0, feedback: 'Yes.' };

test('itemProblem accepts a well-formed item and names each defect', () => {
  assert.equal(itemProblem(goodItem), null);
  assert.equal(itemProblem({ ...goodItem, stem: '  ' }), 'empty-stem');
  assert.equal(itemProblem({ ...goodItem, choices: ['only one'] }), 'need-2-to-5-choices');
  assert.equal(itemProblem({ ...goodItem, choices: ['a', ''] }), 'empty-choice');
  assert.equal(itemProblem({ ...goodItem, choices: ['a', 'a'] }), 'duplicate-choices');
  assert.equal(itemProblem({ ...goodItem, correct: 9 }), 'correct-out-of-range');
  assert.equal(itemProblem({ ...goodItem, correct: -1 }), 'correct-out-of-range');
});

test('foldAuthoredItems folds valid items, rejects the rest, and is per-skill replace', () => {
  const exportObj = { items: {
    'fnd-arg-claim': [goodItem, { ...goodItem, stem: '' }],
    'not-a-real-skill': [goodItem]
  } };
  const { authored, rejected, bankSizes, banksComplete } = foldAuthoredItems({}, exportObj, skillIds);
  assert.equal(authored['fnd-arg-claim'].length, 1, 'the one valid item is kept');
  assert.ok(!authored['not-a-real-skill'], 'unknown skill is not written');
  assert.ok(rejected.some((r) => r.skill === 'fnd-arg-claim' && r.reason === 'empty-stem'));
  assert.ok(rejected.some((r) => r.skill === 'not-a-real-skill' && r.reason === 'unknown-skill'));
  assert.equal(bankSizes['fnd-arg-claim'], 1);
  assert.equal(banksComplete, 0);

  // Re-authoring one skill replaces only its bank; another skill's items are untouched.
  const existing = { 'fnd-orient-source-type': [goodItem, goodItem] };
  const merged = foldAuthoredItems(existing, { items: { 'fnd-arg-claim': [goodItem, goodItem, goodItem] } }, skillIds);
  assert.equal(merged.authored['fnd-orient-source-type'].length, 2, 'other skill preserved');
  assert.equal(merged.authored['fnd-arg-claim'].length, 3);
  assert.equal(merged.banksComplete, 1, 'the 3-item bank counts as complete');
});

test('authoredReviewItem turns an authored item into a client-scorable retrieval', () => {
  const item = authoredReviewItem('fnd-arg-claim', [goodItem], 0);
  assert.equal(item.trueSkillId, 'fnd-arg-claim');
  assert.deepEqual(item.answers, goodItem.choices);
  assert.equal(item.answers[item.correct], 'State the claim');
  assert.match(item.variantId, /^authored-/);
  assert.match(item.label, /Berakhot 2a/);
});

test('the item-authoring workbench generates as a self-contained page covering every skill', () => {
  execFileSync(process.execPath, ['scripts/build-item-authoring-worksheet.mjs'], { cwd: repoRoot });
  const html = readFileSync(new URL('../docs/item-authoring-workbench.html', import.meta.url), 'utf8');
  assert.ok(html.startsWith('<!doctype html>'));
  assert.doesNotMatch(html, /<script src=/); // self-contained, nothing to fetch
  const data = JSON.parse(html.match(/id="wb-data">(.*?)<\/script>/s)[1]);
  assert.equal(data.skills.length, skillIds.length, 'every graph skill has a card');
  assert.equal(data.target, 3);
});
