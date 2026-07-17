import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('hosted learner deletion clearly distinguishes learning data from the sign-in identity', async () => {
  const [page, script] = await Promise.all(['profile.html', 'profile.js'].map((file) => readFile(new URL(`../${file}`, import.meta.url), 'utf8')));
  assert.match(page, /id="delete-explainer"/);
  assert.match(page, /does not delete your secure sign-in identity or email address/);
  assert.match(script, /Your secure sign-in identity and email address will remain/);
  assert.match(script, /Your learning data has been deleted\. Your secure sign-in identity remains/);
  assert.match(script, /#delete-explainer'\)\.hidden = false/);
});
