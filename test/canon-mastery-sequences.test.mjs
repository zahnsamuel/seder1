import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('every wider-canon domain has guided reading, deliberate practice, and transfer', async () => {
  const data = JSON.parse(await readFile(new URL('../data/canon-source-sequences.json', import.meta.url), 'utf8'));
  assert.deepEqual(data.sequences.map((item) => item.id), ['torah', 'tefillah', 'halakha', 'thought', 'history', 'character', 'wider-world']);
  for (const sequence of data.sequences) {
    for (const step of ['guided', 'practice', 'transfer']) assert.ok(sequence[step]?.[0] && sequence[step]?.[1], `${sequence.id} needs ${step}`);
    assert.match(sequence.transfer[1], /independent-reading\.html/);
  }
});

test('course dashboard and daily path surface a canon mastery rhythm and a Gemara connection', async () => {
  // The cross-canon connections were removed from the simplified daily page; the connection data
  // still lives in daily-cross-canon.js and the mastery rhythm on the course dashboard.
  const [dashboard, sequence, connection] = await Promise.all(['course-dashboard.html', 'canon-source-sequences.js', 'daily-cross-canon.js'].map((file) => readFile(new URL(`../${file}`, import.meta.url), 'utf8')));
  assert.match(dashboard, /source-sequences/);
  assert.match(sequence, /Read → practice → transfer/);
  for (const phrase of ['Berakhot and Shema', 'Shabbat and responsibility', 'Eruvin and Tefillah']) assert.match(connection, new RegExp(phrase));
});
