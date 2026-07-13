import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { sourceReviewItems } from '../data/curriculum-engine.mjs';

test('completed flagship Daf maps schedule a delayed, tractate-specific retrieval', async () => {
  const [workspace, retention, repository, dataFile] = await Promise.all([
    'flagship-daf-workbench.html', 'flagship-daf-retention.js', 'data/repository.mjs', 'data/flagship-retrieval.json'
  ].map((file) => readFile(file, 'utf8')));
  const data = JSON.parse(dataFile);
  assert.match(workspace, /flagship-daf-retention\.js/);
  assert.match(retention, /retrieval_scheduled/);
  assert.match(retention, /delayHours: 24/);
  assert.match(repository, /event\.type === 'retrieval_scheduled'/);
  assert.equal(data.items.length, 6);
  for (const item of data.items) {
    assert.ok(item.skillId && item.hebrew && item.translation && item.prompt);
    assert.equal(item.answers.length, 3);
    assert.ok(item.sourceContext.includes('delayed retrieval'));
  }
  const items = await sourceReviewItems(resolve('.'), ['shabbat-independent-map', 'bava-kamma-independent-map']);
  assert.deepEqual(items.map((item) => item.trueSkillId), ['shabbat-independent-map', 'bava-kamma-independent-map']);
  assert.match(items[0].prompt, /map/i);
});
