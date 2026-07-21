import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('Academy foundation sessions expose the exact source and Sefaria handoff', () => {
  const html = fs.readFileSync('academy-session.html', 'utf8');
  const js = fs.readFileSync('academy-session.js', 'utf8');
  assert.match(html, /id="source-ref"/);
  assert.match(html, /id="source-link"/);
  assert.match(html, /Open this source in Sefaria/);
  assert.match(js, /sefaria\.org\/search/);
  assert.match(js, /context\.ref/);
});
