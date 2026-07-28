import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import {
  checkJlaAcademyChoice,
  loadJlaAcademySession
} from '../jla-academy-session.js';

const sessions = JSON.parse(
  await readFile(new URL('../data/jla-academy-sessions.json', import.meta.url), 'utf8')
);
const slice = JSON.parse(
  await readFile(new URL('../data/jla-foundation-skill-slice.json', import.meta.url), 'utf8')
);

test('every Academy session is well formed and maps to a real graduation skill', () => {
  const sliceById = new Map(slice.map((skill) => [skill.id, skill]));
  for (const session of sessions) {
    const skill = sliceById.get(session.skillId);
    assert.ok(skill, `session ${session.skillId} has no matching graduation-slice skill`);
    assert.equal(session.graduationLevel, skill.graduationLevel, `${session.skillId}: level disagrees with the slice`);
    assert.ok(session.sourceWindow.sourceRef);
    assert.match(session.sourceWindow.sourceUrl, /^https:\/\/www\.sefaria\.org\//);
    assert.ok(session.teachingMove);
    assert.match(session.evidencePreview, /^I can /);
    // A real guided check: a prompt, distinct choices, and a correct id that exists among them.
    assert.ok(session.prompt);
    const ids = session.choices.map(({ id }) => id);
    assert.equal(new Set(ids).size, ids.length, `${session.skillId}: duplicate choice ids`);
    assert.ok(ids.includes(session.correctChoiceId), `${session.skillId}: correctChoiceId not among choices`);
    assert.ok(session.feedback.correct && session.feedback.incorrect, `${session.skillId}: missing feedback`);
  }
});

test('every graduation-slice skill has an Academy session (full coverage)', () => {
  const authored = new Set(sessions.map(({ skillId }) => skillId));
  const uncovered = slice.map(({ id }) => id).filter((id) => !authored.has(id));
  assert.deepEqual(uncovered, [], `graduation skills without an Academy session: ${uncovered.join(', ')}`);
});

test('Academy session loads by skill and does not leak its answer key', () => {
  const session = loadJlaAcademySession({
    skillId: 'source-family-001',
    sessions,
    random: () => 0
  });
  assert.equal(session.skillId, 'source-family-001');
  assert.equal('correctChoiceId' in session, false);
  assert.equal('feedback' in session, false);
  assert.ok(session.choices.every((choice) => !('correct' in choice)));
});

test('guided choices are shuffled rather than rendered in authored order', () => {
  const authoredOrder = sessions[0].choices.map(({ id }) => id);
  const rendered = loadJlaAcademySession({
    skillId: 'source-family-001',
    sessions,
    random: () => 0
  });
  assert.notDeepEqual(rendered.choices.map(({ id }) => id), authoredOrder);
});

test('choice evaluation returns feedback and capability evidence preview', () => {
  const correct = checkJlaAcademyChoice({
    skillId: 'mishnah-case-001',
    choiceId: 'evening-window',
    sessions
  });
  assert.equal(correct.correct, true);
  assert.match(correct.feedback, /case/i);
  assert.match(correct.evidencePreview, /^I can /);

  const incorrect = checkJlaAcademyChoice({
    skillId: 'mishnah-case-001',
    choiceId: 'historical-setting',
    sessions
  });
  assert.equal(incorrect.correct, false);
});

test('unknown skill and choice ids fail clearly', () => {
  assert.throws(
    () => loadJlaAcademySession({ skillId: 'missing', sessions }),
    /No Academy session/
  );
  assert.throws(
    () =>
      checkJlaAcademyChoice({
        skillId: 'source-family-001',
        choiceId: 'missing',
        sessions
      }),
    /Unknown choice/
  );
});
