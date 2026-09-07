import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const load = async (f) => JSON.parse(await readFile(new URL(`../${f}`, import.meta.url), 'utf8'));

const GENRES = ['torah', 'mishnah', 'gemara', 'commentary'];
const HEBREW = /[֐-׿]/;
const JARGON = /make the move|reading move|make this .*move/i;

test('foundation-teach.json carries a plain-adult genre gallery with on-page excerpts', async () => {
  const teach = await load('data/foundation-teach.json');

  // The existing skill-level See-it teach is preserved (additive change).
  assert.ok(teach.teach && typeof teach.teach['fnd-orient-source-type'] === 'string', 'skill teach preserved');

  assert.ok(teach.genres && typeof teach.genres === 'object', 'a genres block exists');
  for (const id of GENRES) {
    const g = teach.genres[id];
    assert.ok(g, `genre ${id} is present`);
    assert.ok(typeof g.name === 'string' && g.name.trim(), `${id} has a name`);

    // Plain adult teach: 2-4 real sentences, no "make the move" jargon.
    assert.ok(typeof g.teach === 'string', `${id} has a teach string`);
    assert.ok(g.teach.length >= 80 && g.teach.length <= 700, `${id} teach is 2-4 sentences (${g.teach.length} chars)`);
    assert.doesNotMatch(g.teach, JARGON, `${id} teach avoids "make the move" jargon`);

    // One short on-page excerpt: real Hebrew + a translation + a citable reference.
    assert.ok(g.example && typeof g.example === 'object', `${id} has an example`);
    assert.ok(g.example.sourceRef && g.example.sourceRef.trim(), `${id} example has a sourceRef`);
    assert.match(g.example.hebrew || '', HEBREW, `${id} example carries Hebrew text (an on-page excerpt, not a link)`);
    assert.ok(g.example.translation && g.example.translation.trim(), `${id} example has a translation`);
    assert.doesNotMatch(g.example.sourceRef, /sefaria/i, `${id} sourceRef is a citation, not a Sefaria instruction`);
  }
});
