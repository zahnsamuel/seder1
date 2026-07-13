import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('Yoma has a dedicated visible-source workspace from case through proof-text response', async () => {
  const [html, source, mastery, sequences] = await Promise.all([
    'yoma-daf-workbench.html', 'yoma-daf-workbench.js', 'tractate-mastery.js', 'data/gemara-source-sequences.json'
  ].map((file) => readFile(file, 'utf8')));
  for (const phrase of ['Mishnah case', 'Procedure / safeguard', 'Stated concern', 'Objection', 'Context question', 'Textual grounding', 'Response']) {
    assert.match(html, new RegExp(phrase));
    assert.match(source, new RegExp(phrase));
  }
  assert.match(html, /study of a Temple-service text, not practical ritual guidance/i);
  assert.match(html, /https:\/\/www\.sefaria\.org\/Yoma\.2a/);
  assert.match(source, /source_annotation/);
  assert.match(source, /yoma-independent-map/);
  assert.match(mastery, /daf: 'yoma-daf-workbench\.html'/);
  const yoma = JSON.parse(sequences).sequences.find((item) => item.tractate === 'yoma');
  assert.equal(yoma.packets[0][2], 'yoma-daf-workbench.html');
});
