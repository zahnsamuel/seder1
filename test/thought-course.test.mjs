import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
const course=JSON.parse(await readFile(new URL('../data/thought-six-session-course.json',import.meta.url),'utf8'));
test('Freedom course moves from command through tension and independent explanation',()=>{const sessions=course.courses[0].sessions;assert.equal(sessions.length,6);assert.ok(sessions.some(s=>s.skill==='thought-tension'));assert.ok(sessions.some(s=>s.skill==='thought-independent'));});
