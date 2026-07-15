import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('flagship transfer requires a guided reading-habit check and repairs the exact earlier Daf map', async () => {
  const [html, source, retention] = await Promise.all([
    'flagship-transfer.html', 'flagship-transfer-mastery.js', 'flagship-daf-retention.js'
  ].map((file) => readFile(new URL(`../${file}`, import.meta.url), 'utf8')));
  assert.match(html, /flagship-transfer-mastery\.js/);
  for (const phrase of ['What made your reading transferable?', 'NAME THE TRANSFER HABIT', 'transfer-choice-set', 'seder-transfer-explanation-', 'transfer_explanation', 'flagship-daf-workbench.html?tractate=', 'Math.random']) assert.ok(source.includes(phrase), `missing ${phrase}`);
  assert.doesNotMatch(source, /textarea|Save my transfer explanation|Write one sentence/);
  assert.match(retention, /Next: prove this move in a contrasting source/);
});
