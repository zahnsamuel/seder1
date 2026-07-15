import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('Gemara mastery dashboard makes the flagship evidence ladder and next move visible', async () => {
  const [html, source, mastery] = await Promise.all(['gemara-mastery.html', 'gemara-mastery.js', 'mastery.js'].map((file) => readFile(new URL(`../${file}`, import.meta.url), 'utf8')));
  for (const phrase of ['GUIDED', 'MAPPING', 'INDEPENDENT', 'TRANSFER', 'tractates']) assert.match(html, new RegExp(phrase));
  for (const tractate of ['pesachim', 'eruvin', 'sukkah', 'bava-metzia', 'bava-kamma']) assert.match(source, new RegExp(`\\b${tractate}\\b`));
  for (const phrase of ['source_map', 'second_source_explanation', 'transfer_explanation', 'retrieval_scheduled', 'Complete due retrieval']) assert.match(source, new RegExp(phrase));
  assert.match(mastery, /gemara-mastery\.html/);
});
