import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { loadArc, checkArcAnswer } from '../data/arc-session.mjs';

const { arcs } = JSON.parse(await readFile(new URL('../data/arcs.json', import.meta.url), 'utf8'));

test('loadArc strips the answer key from interactive arcs and id-shuffles the choices', () => {
  const arc = loadArc({ tractate: 'shabbat', arcs, random: () => 0 });
  assert.equal(arc.shape, 'interactive');
  for (const s of arc.sessions) {
    assert.ok(!('correct' in s), 'correct must not ship to the browser');
    assert.ok(!('feedback' in s), 'feedback must not ship to the browser');
    assert.ok(!('answers' in s), 'raw answers array is replaced by id-d choices');
    assert.ok(Array.isArray(s.choices) && s.choices.every((c) => c.id && typeof c.text === 'string'));
  }
  assert.doesNotMatch(JSON.stringify(arc), /"correct"\s*:|"feedback"\s*:/);
});

test('loadArc returns index arcs (berakhot) unchanged — link-outs, no key', () => {
  const arc = loadArc({ tractate: 'berakhot', arcs });
  assert.equal(arc.shape, 'index');
  assert.ok(arc.sessions.every((s) => s.url && s.title));
});

test('checkArcAnswer scores by the authored index the client never received', () => {
  const raw = arcs.shabbat.sessions[0];
  const correctId = `a${raw.correct}`;
  const wrongId = `a${(raw.correct + 1) % raw.answers.length}`;
  assert.equal(checkArcAnswer({ tractate: 'shabbat', sessionIndex: 0, choiceId: correctId, arcs }).correct, true);
  assert.equal(checkArcAnswer({ tractate: 'shabbat', sessionIndex: 0, choiceId: wrongId, arcs }).correct, false);
  assert.throws(() => checkArcAnswer({ tractate: 'shabbat', sessionIndex: 0, choiceId: 'a99', arcs }));
});

test('the server refuses to serve raw arcs.json (answer keys) as a static file', async () => {
  const server = await readFile(new URL('../server.mjs', import.meta.url), 'utf8');
  assert.match(server, /relativePath === 'data\/arcs\.json'/);
  assert.match(server, /loadArc\(\{ tractate/);
  assert.match(server, /checkArcAnswer\(\{ tractate/);
});
