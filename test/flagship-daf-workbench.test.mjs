import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('six flagship Gemara openings share a visible-source map and an adaptive repair route', async () => {
  const [html, source, sequences, curriculum] = await Promise.all([
    'flagship-daf-workbench.html', 'flagship-daf-workbench.js', 'data/gemara-source-sequences.json', 'data/curriculum-engine.mjs'
  ].map((file) => readFile(file, 'utf8')));
  for (const tractate of ['shabbat', 'pesachim', 'eruvin', 'sukkah', 'bava-metzia', 'bava-kamma']) {
    assert.match(source, new RegExp(`['"]?${tractate}['"]?:`));
    assert.match(source, new RegExp(`tractate=${tractate}`));
  }
  for (const phrase of ['Mishnah case', 'Claim / distinction', 'Procedure / response', 'Context question', 'Textual grounding', 'source_annotation', 'Try a focused repair', 'Map complete']) assert.match(html + source, new RegExp(phrase));
  assert.match(html, /not provide personal halakhic guidance/i);
  assert.match(curriculum, /flagship-daf-workbench\.html\?tractate=shabbat/);
  const data = JSON.parse(sequences);
  for (const tractate of ['shabbat', 'pesachim', 'eruvin', 'sukkah', 'bava', 'bava-kamma']) {
    const sequence = data.sequences.find((item) => item.tractate === tractate);
    assert.match(sequence.packets[0][2], /flagship-daf-workbench/);
  }
});
