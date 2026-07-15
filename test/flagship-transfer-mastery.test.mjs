import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('flagship transfer requires learner explanation and repairs the exact earlier Daf map', async () => {
  const [html, source, retention] = await Promise.all([
    'flagship-transfer.html', 'flagship-transfer-mastery.js', 'flagship-daf-retention.js'
  ].map((file) => readFile(new URL(`../${file}`, import.meta.url), 'utf8')));
  assert.match(html, /flagship-transfer-mastery\.js/);
  for (const phrase of ['what reading habit carried', 'Save my transfer explanation', 'seder-transfer-explanation-', 'transfer_explanation', 'flagship-daf-workbench.html?tractate=']) assert.match(source, new RegExp(phrase.replace(/[.?]/g, '\\$&')));
  assert.match(retention, /Next: prove this move in a contrasting source/);
});
