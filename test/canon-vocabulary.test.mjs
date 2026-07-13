import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
const vocab=JSON.parse(await readFile(new URL('../data/canon-vocabulary.json',import.meta.url),'utf8'));
test('canon vocabulary spans five non-Gemara reading domains',()=>{assert.equal(vocab.terms.length,10);assert.ok(new Set(vocab.terms.map(x=>x.domain)).size>=5);});
