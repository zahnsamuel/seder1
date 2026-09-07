import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { itemProblem } from '../data/item-authoring-fold.mjs';

const load = async (f) => JSON.parse(await readFile(new URL(`../${f}`, import.meta.url), 'utf8'));
const HEBREW = /[֐-׿]/;
const JARGON = /make the move|reading move|make this .*move/i;

test('fnd-orient-source-type checks identify genre from an on-page excerpt', async () => {
  const bank = (await load('data/foundation-authored-items.json')).items;
  const items = bank['fnd-orient-source-type'];
  assert.ok(Array.isArray(items) && items.length >= 4, 'at least 4 genre-identification checks');

  for (const [i, item] of items.entries()) {
    // Valid, unbiased, teaching item.
    assert.equal(itemProblem(item), null, `item ${i} invalid: ${itemProblem(item)}`);
    assert.ok(item.sourceRef && item.sourceRef.trim(), `item ${i} missing sourceRef`);
    assert.ok(item.feedback && item.feedback.length >= 25, `item ${i} feedback must teach`);
    assert.doesNotMatch(`${item.stem} ${item.feedback}`, JARGON, `item ${i} avoids "make the move" jargon`);
    // Carries its own on-page excerpt (real Hebrew in the stem, not a Sefaria link).
    assert.match(item.stem, HEBREW, `item ${i} stem carries a Hebrew on-page excerpt`);
    assert.doesNotMatch(item.stem, /sefaria/i, `item ${i} shows the text, not a Sefaria link`);
    // No length-bias exploit.
    const lengths = item.choices.map((c) => c.length);
    assert.ok(lengths[item.correct] <= 1.5 * Math.min(...lengths), `item ${i} length-bias`);
  }

  // The bank as a whole exercises all four basic genres.
  const blob = items.flatMap((it) => it.choices).join(' ').toLowerCase();
  for (const genre of ['torah', 'mishnah', 'gemara', 'commentary']) {
    assert.ok(blob.includes(genre), `choices cover ${genre}`);
  }
});
