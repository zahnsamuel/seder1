import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('cohort comparison places a visible second source beside learner explanation', async () => {
  const [page, source, styles] = await Promise.all(['cohort-source-mastery.html', 'cohort-source-mastery.js', 'cohort-source-mastery.css'].map((file) => readFile(new URL(`../${file}`, import.meta.url), 'utf8')));
  for (const marker of ['compareCitation', 'compareSefaria', 'compareHebrew', 'compareTranslation', 'toggleCompareTranslation', 'comparisonLenses']) assert.match(page, new RegExp(marker));
  assert.match(source, /const secondSources=/);
  for (const tractate of ['berakhot', 'shabbat', 'yoma', 'ketubot', 'chullin', 'niddah', 'roshHashanah', 'taanit', 'megillah']) assert.match(source, new RegExp(`${tractate}:`));
  for (const marker of ['Deuteronomy.6.7', 'Mishnah_Eruvin.1.1', 'Leviticus.8.34', 'Mishnah_Rosh_Hashanah.2.1', 'Mishnah_Taanit.1.1', 'Mishnah_Megillah.1.1']) assert.match(source, new RegExp(marker));
  assert.match(styles, /comparison-source/);
  assert.match(styles, /comparison-lenses/);
});
