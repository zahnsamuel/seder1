import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
test('every flagship tractate completion enters its unified mastery loop', async () => {
  const source = await readFile('course-engine.js', 'utf8');
  for (const [stage, tractate] of Object.entries({'shabbat-tractate-arc':'shabbat','pesachim-tractate-arc':'pesachim','eruvin-tractate-arc':'eruvin','sukkah-tractate-arc':'sukkah','bava-metzia-tractate-arc':'bava-metzia','bava-kamma-tractate-arc':'bava-kamma','yoma-tractate-arc':'yoma','berakhot-baraita-disagreement':'berakhot','ketubot-tractate-arc':'ketubot','chullin-tractate-arc':'chullin','niddah-tractate-arc':'niddah'})) assert.match(source,new RegExp(`'${stage}':'${tractate}'`));
  assert.match(source,/tractate-mastery\.html\?tractate=/);
});
