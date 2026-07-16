import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('Foundation tractate arcs share a tractate-specific Daf workbench handoff', async () => {
  const [engine, workbench] = await Promise.all([
    readFile(new URL('../course-engine.js', import.meta.url), 'utf8'),
    readFile(new URL('../flagship-daf-workbench.js', import.meta.url), 'utf8')
  ]);
  const tractates = ['shabbat', 'pesachim', 'eruvin', 'sukkah', 'bava-metzia', 'bava-kamma', 'ketubot', 'chullin', 'niddah'];
  for (const tractate of tractates) {
    assert.match(engine, new RegExp(`'${tractate}-tractate-arc':\\{tractate:'${tractate}',url:'flagship-daf-workbench\\.html\\?tractate=${tractate}'`));
    assert.ok(workbench.includes(`sources.${tractate}=`) || workbench.includes(`${tractate}: {`) || workbench.includes(`'${tractate}': {`), `workbench packet for ${tractate}`);
    assert.match(workbench, new RegExp(`lab\\.html\\?tractate=${tractate}`));
  }
  assert.match(workbench, /Practice this .* reading move/);
  assert.doesNotMatch(workbench, /href="\$\{source\.arc\}"/);
  assert.match(workbench, /Mishnah Niddah 1:1/);
  assert.match(workbench, /not practical guidance/);
});
