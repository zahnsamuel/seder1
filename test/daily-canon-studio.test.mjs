import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
const studio=JSON.parse(await readFile(new URL('../data/daily-canon-studio.json',import.meta.url),'utf8'));
test('daily canon studio rotates complete source-work rhythms',()=>{assert.equal(studio.paths.length,6);for(const path of studio.paths){assert.ok(path.sourceReader&&path.anchor&&path.practice&&path.retrieval);assert.equal(path.choices.length,3);}});
