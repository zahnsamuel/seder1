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

test('initial Academy sessions teach source-family and Mishnah-case capabilities', () => {
  assert.deepEqual(
    sessions.map(({ skillId }) => skillId),
    ['source-family-001', 'mishnah-case-001']
  );
  for (const session of sessions) {
    assert.ok(session.sourceWindow.sourceRef);
    assert.match(session.sourceWindow.sourceUrl, /^https:\/\/www\.sefaria\.org\//);
    assert.ok(session.teachingMove);
    assert.match(session.evidencePreview, /^I can /);
  }
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
