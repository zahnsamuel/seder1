import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const html = fs.readFileSync('placement.html', 'utf8');
const js = fs.readFileSync('placement.js', 'utf8');

test('placement exposes a readable starting profile before My Path', () => {
  assert.match(html, /id="placement-results"/);
  assert.match(html, /id="results-grid"/);
  assert.match(html, /Continue to My Path/);
  assert.match(js, /function renderResults\(\)/);
  assert.match(js, /STARTING PROFILE READY/);
  assert.match(js, /then\(\(\) => renderResults\(\)\)/);
  assert.doesNotMatch(js, /location\.href = ['"]path\.html\?v=6/);
});
