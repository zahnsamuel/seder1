import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { readFileSync } from 'node:fs';

// Load the browser drills file (window.DecodingDrills = {...}) in a minimal sandbox.
const src = await readFile(new URL('../decoding-drills.js', import.meta.url), 'utf8');
const window = {};
new Function('window', src)(window);
const drills = window.DecodingDrills;

test('decoding manifest and lesson content agree, and cover the built bands', () => {
  const lessonIds = new Set(Object.keys(drills.lessons));
  const manifest = drills.bands.flatMap((b) => b.lessons);
  for (const id of manifest) assert.ok(lessonIds.has(id), `manifest lesson "${id}" has no content`);
  for (const id of lessonIds) assert.ok(manifest.includes(id), `lesson "${id}" is not placed in any band`);
  assert.ok(manifest.length >= 9, `expected >=9 built lessons, got ${manifest.length}`);
  assert.deepEqual(drills.bands.map((b) => b.id), ['0.1', '0.2', '0.3', '0.4', '0.5', '0.6']);
});

test('every lesson is wired to real ladder skills for spaced review', () => {
  const ladder = JSON.parse(readFileSync(new URL('../data/hebrew-decoding-ladder.json', import.meta.url), 'utf8'));
  const skillIds = new Set(ladder.skills.map((s) => s.id));
  const manifest = drills.bands.flatMap((b) => b.lessons);
  for (const id of manifest) {
    const skills = drills.lessonSkills[id];
    assert.ok(Array.isArray(skills) && skills.length, `lesson "${id}" has no lessonSkills for review scheduling`);
    for (const s of skills) assert.ok(skillIds.has(s), `lesson "${id}" references "${s}", which is not a decoding-ladder skill`);
  }
});

test('every decoding item is a well-formed glyph-card multiple-choice question', () => {
  for (const [id, lesson] of Object.entries(drills.lessons)) {
    assert.ok(lesson.items.length >= 6, `${id}: needs >=6 items`);
    assert.match(lesson.bandLabel, /LESSON/);
    for (const [i, item] of lesson.items.entries()) {
      const where = `${id}[${i}]`;
      assert.ok(item.glyph, `${where}: missing glyph`);
      assert.ok(item.prompt && item.prompt.length > 10, `${where}: thin prompt`);
      assert.ok(Array.isArray(item.answers) && item.answers.length === 3, `${where}: needs exactly 3 answers`);
      assert.equal(item.correct, 0, `${where}: correct must be index 0 (the engine shuffles at render)`);
      assert.equal(new Set(item.answers).size, 3, `${where}: duplicate answers`);
      assert.ok(item.feedback && item.feedback.length > 20, `${where}: thin feedback`);
    }
  }
});
