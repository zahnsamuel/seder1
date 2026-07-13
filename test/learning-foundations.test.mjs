import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const readJson = async (file) => JSON.parse(await readFile(new URL(`../${file}`, import.meta.url), 'utf8'));

test('skill graph encodes prerequisites, source forms, and mastery criteria', async () => {
  const graph = await readJson('data/skill-graph.json');
  assert.equal(graph.version, '0.3.0');
  assert.deepEqual(graph.masteryScale && Object.keys(graph.masteryScale), ['emerging', 'secure', 'transfer']);
  for (const skill of graph.skills) {
    for (const field of ['id', 'kind', 'prerequisites', 'languageDependencies', 'sourceForms', 'evidence', 'masteryCriteria', 'reviewContexts']) assert.ok(skill[field] !== undefined, `${skill.id} needs ${field}`);
    assert.ok(skill.sourceForms.length, `${skill.id} needs a source form`);
  }
  const independent = graph.skills.find((skill) => skill.id === 'independent-sugya-reading');
  assert.ok(independent.languageDependencies.includes('aramean-question-particles'));
});

test('language ladder is a five-stage progression from orientation to independent reading', async () => {
  const ladder = await readJson('data/language-ladder.json');
  assert.equal(ladder.stages.length, 5);
  assert.deepEqual(ladder.stages.map((stage) => stage.id), ['language-orientation', 'question-and-source-signals', 'phrase-templates', 'sentence-roles', 'applied-aramaic-reading']);
  for (const stage of ladder.stages) {
    assert.ok(stage.mastery);
    assert.equal(stage.items.length, 3);
    for (const item of stage.items) assert.ok(item.answers[item.correct]);
  }
});

test('source review contract requires accuracy, assessment, accessibility, and safety fields', async () => {
  const schema = await readJson('data/source-review-schema.json');
  for (const field of ['reference', 'primaryText', 'translation', 'context', 'assessment', 'languageSupport', 'safetyBoundary', 'review']) assert.ok(schema.required.includes(field));
  assert.deepEqual(schema.releaseGates, ['primary-text-verified', 'translation-checked', 'context-checked', 'assessment-reviewed', 'accessibility-checked', 'safety-boundary-checked']);
});
