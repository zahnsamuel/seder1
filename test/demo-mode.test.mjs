import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('presentation demo hub exposes the complete learner walkthrough', () => {
  const html = fs.readFileSync(new URL('../demo.html', import.meta.url), 'utf8');
  for (const route of ['seder.html', 'diagnostic.html', 'daily-router.html', 'daf-workbench.html?tractate=berakhot', 'path.html']) {
    assert.ok(html.includes(`href="${route}"`), `missing demo route: ${route}`);
  }
  assert.match(html, /diagnose.*teach.*retrieve.*transfer.*repair/i);
});
