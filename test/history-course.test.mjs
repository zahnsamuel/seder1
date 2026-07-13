import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
const course=JSON.parse(await readFile(new URL('../data/history-six-session-course.json',import.meta.url),'utf8'));
test('History course covers audience, place, institution, memory, and comparison',()=>{const sessions=course.courses[0].sessions;assert.equal(sessions.length,6);assert.ok(sessions.some(s=>s.skill==='history-institution'));assert.ok(sessions.some(s=>s.skill==='comparative-reading'));});
