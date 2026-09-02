import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('daily path explains the graph evidence behind its next skill', async () => {
  const [html, source] = await Promise.all(['daily-router.html', 'jla-next-action.js'].map((file) => readFile(new URL(`../${file}`, import.meta.url), 'utf8')));
  assert.match(html, /jla-next-action\.css/);
  assert.match(html, /jla-next-action\.js/);
  for (const phrase of ['next-action', 'title', 'reason', 'next_action_started']) assert.match(source, new RegExp(phrase));
  assert.doesNotMatch(source, /mastery|reviewQueue|skillId/);
});

test('every flagship Gemara path has guided practice and fresh-source transfer', async () => {
  const data = JSON.parse(await readFile(new URL('../data/gemara-source-sequences.json', import.meta.url), 'utf8'));
  assert.equal(data.sequences.length, 8);
  for (const sequence of data.sequences) {
    assert.equal(sequence.packets.length, 3);
    assert.match(sequence.packets[0][2], sequence.tractate === 'yoma' ? /yoma-daf-workbench/ : /daf-workbench/);
    assert.match(sequence.packets[1][2], /lab\.html|berakhot-unit-5|(?:shabbat|pesachim|eruvin|sukkah|yoma|bava-metzia|bava-kamma)-arc/);
    assert.equal(sequence.packets[2][2], 'gemara-unseen-check.html');
  }
});
