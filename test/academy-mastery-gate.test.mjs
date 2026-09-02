import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { canMasterJourneyStage } from '../data/curriculum-engine.mjs';

test('academy days require two correct source checks before their mastery marker can be written', async () => {
  const root = new URL('..', import.meta.url).pathname;
  const blank = { events: [] };
  assert.equal(await canMasterJourneyStage(root, blank, 'academy-day-1'), false);
  const one = { events: [{ type: 'answer_submitted', correct: true, sourceContext: 'academy day 1 check 1' }] };
  assert.equal(await canMasterJourneyStage(root, one, 'academy-day-1'), false);
  const two = { events: [...one.events, { type: 'answer_submitted', correct: true, sourceContext: 'academy day 1 check 2' }] };
  assert.equal(await canMasterJourneyStage(root, two, 'academy-day-1'), true);
  const weeklyChecks = { events: [{ type: 'answer_submitted', correct: true, sourceContext: 'academy day 7 check 1' }, { type: 'answer_submitted', correct: true, sourceContext: 'academy day 7 check 2' }] };
  assert.equal(await canMasterJourneyStage(root, weeklyChecks, 'academy-day-7'), false);
  weeklyChecks.events.push({ type: 'journey_artifact_saved', artifactType: 'academy-source-maps', artifactId: 'academy-day-7', note: 'This source begins with a question; I mapped the claim and would compare its evidence in a new source.' });
  assert.equal(await canMasterJourneyStage(root, weeklyChecks, 'academy-day-7'), true);
  assert.equal(await canMasterJourneyStage(root, two, 'academy-day-91'), false);
});

test('academy makes daily source evidence, rather than opening a link, the unlock condition', async () => {
  const [academy, evidence, html] = await Promise.all(['academy.js', 'academy-evidence.js', 'academy-evidence.html'].map((file) => readFile(file, 'utf8')));
  assert.match(academy, /academy-day-/);
  // The demonstrate/evidence step is now the second node of the today path ("Demonstrate the move →"
  // linking to academy-evidence). Still the unlock condition, not a plain open-link.
  assert.match(academy, /Demonstrate the move/);
  assert.match(academy, /academy-evidence\.html\?day=/);
  assert.match(evidence, /academy day \$\{day\} check/);
  assert.match(evidence, /stage_mastered/);
  assert.match(evidence, /academy-source-maps/);
  assert.match(evidence, /const firstMonth = \[/);
  assert.match(evidence, /const secondMonth = \[/);
  assert.match(evidence, /const thirdMonth = \[/);
  for (const citation of ['Berakhot 2a', 'Pesachim 2a', 'Eruvin 2a', 'Bava Metzia 2a', 'Bava Kamma 2a', 'Mishnah Sukkah 1:1']) assert.match(evidence, new RegExp(citation.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  for (const citation of ['Genesis 22:1', 'Kaddish', 'Yavneh: Gittin 56b', 'Psalm 23', 'Halakhic machloket']) assert.match(evidence, new RegExp(citation.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  for (const citation of ['Cairo Geniza study protocol', 'Shabbat 21b', 'Gemara unseen check', 'Canon journey']) assert.match(evidence, new RegExp(citation.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.match(html, /EARN TOMORROW/);
});
