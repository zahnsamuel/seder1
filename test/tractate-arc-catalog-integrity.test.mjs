import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { constants } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

test('every catalog tractate has a source arc, page, and mastery route', async () => {
  const [catalog, engine] = await Promise.all([
    readFile(resolve(root, 'data/gemara-tractates.json'), 'utf8').then(JSON.parse),
    readFile(resolve(root, 'course-engine.js'), 'utf8')
  ]);
  // Berakhot is the intentional first-entry placement experience; every later
  // tractate must use the shared source-arc contract.
  const tractates = catalog.tractates.filter((tractate) => !tractate.entry && tractate.title !== 'Gemara Foundations');
  assert.ok(tractates.length >= 35, `expected the post-entry tractate catalog, found ${tractates.length}`);
  for (const tractate of tractates) {
    assert.equal(tractate.stage, 'tractate-arc', `${tractate.title} must remain on the source-arc path`);
    assert.match(tractate.arcUrl, /-arc\.html$/, `${tractate.title} needs an arc page`);
    await access(resolve(root, tractate.arcUrl), constants.F_OK);
    const slug = tractate.title.toLowerCase().replace(/\s+/g, '-');
    assert.match(engine, new RegExp(`'${slug}-tractate-arc':\\{tractate:'${slug}'`), `${tractate.title} needs a mastery route`);
  }
});
