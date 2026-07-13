import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import test from 'node:test';

// The daily router's second-foundation map pairs each first arc's stage ID with its
// deepening unit's stage ID and page. These IDs live in separate files, so this test
// guards the mapping against drift: every stage the router names must be the stage the
// unit file actually declares, and every page it links must exist.
const routerSource = await readFile(new URL('../daily-router.js', import.meta.url), 'utf8');

const expectedPairs = [
  ['halakha-blessings-arc', 'halakha-arc.js', 'halakha-honor-parents-arc', 'halakha-honor-parents.js', 'halakha-honor-parents.html'],
  ['chumash-shema-arc', 'chumash-arc.js', 'chumash-akeidah-arc', 'chumash-akeidah.js', 'chumash-akeidah.html'],
  ['tefillah-siddur-arc', 'tefillah-arc.js', 'tefillah-kaddish-arc', 'tefillah-kaddish.js', 'tefillah-kaddish.html'],
  ['mussar-humility-arc', 'mussar-arc.js', 'mussar-truth-arc', 'mussar-truth.js', 'mussar-truth.html'],
  ['chassidus-joy-awe-arc', 'chassidus-arc.js', 'chassidus-ahavat-yisrael-arc', 'chassidus-ahavat-yisrael.js', 'chassidus-ahavat-yisrael.html'],
  ['history-community-arc', 'history-arc.js', 'history-yavneh-arc', 'history-yavneh.js', 'history-yavneh.html'],
  ['widerworld-law-reason-arc', 'widerworld-arc.js', 'widerworld-encounter-arc', 'widerworld-encounter.js', 'widerworld-encounter.html'],
  ['jewish-thought-question-atlas', 'philosophy-questions.js', 'jewish-thought-suffering', 'thought-suffering.js', 'thought-suffering.html'],
  ['halakha-honor-parents-arc', 'halakha-honor-parents.js', 'halakha-machloket-arc', 'halakha-machloket.js', 'halakha-machloket.html'],
  ['tefillah-kaddish-arc', 'tefillah-kaddish.js', 'tefillah-amidah-arc', 'tefillah-amidah.js', 'tefillah-amidah.html'],
  ['mussar-truth-arc', 'mussar-truth.js', 'mussar-anger-arc', 'mussar-anger.js', 'mussar-anger.html']
];

test('daily router deepening map matches the stage IDs the unit files declare', async () => {
  for (const [firstStage, firstFile, secondStage, secondFile, page] of expectedPairs) {
    const first = await readFile(new URL(`../${firstFile}`, import.meta.url), 'utf8');
    const second = await readFile(new URL(`../${secondFile}`, import.meta.url), 'utf8');
    assert.ok(first.includes(`stage:'${firstStage}'`), `${firstFile} should declare stage ${firstStage}`);
    assert.ok(second.includes(`stage:'${secondStage}'`), `${secondFile} should declare stage ${secondStage}`);
    assert.ok(routerSource.includes(`'${firstStage}'`), `daily-router.js should reference ${firstStage}`);
    assert.ok(routerSource.includes(`'${secondStage}'`), `daily-router.js should reference ${secondStage}`);
    assert.ok(routerSource.includes(`'${page}'`), `daily-router.js should link ${page}`);
    await access(new URL(`../${page}`, import.meta.url));
  }
});

test('deepening only fires when the first arc is done and the second unit is not', async () => {
  assert.match(routerSource, /doneStages\.has\(firstStage\) && !doneStages\.has\(secondStage\)/);
  // Gemara stays the default spine: deepenings only claim every third day.
  assert.match(routerSource, /day % 3 === 2/);
  // The Gemara fallback must remain the final default in the chain.
  assert.match(routerSource, /deepening \? \{ title: deepening\[2\]/);
  assert.match(routerSource, /tractate-mastery\.html\?tractate=\$\{tractate\}/);
});
