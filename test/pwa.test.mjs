import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';

test('PWA manifest is valid and installable-shaped', async () => {
  const manifest = JSON.parse(await readFile(new URL('../manifest.webmanifest', import.meta.url), 'utf8'));
  assert.equal(manifest.short_name, 'Seder');
  assert.ok(manifest.start_url.startsWith('daily-router.html'), 'the installed app should open on the daily habit loop');
  assert.equal(manifest.display, 'standalone');
  assert.ok(manifest.icons.length >= 1 && manifest.icons[0].src === 'icon.svg');
});

test('service worker never touches learner data and seder-auth wires the PWA', async () => {
  const [sw, auth, server] = await Promise.all(['../sw.js', '../seder-auth.js', '../server.mjs'].map((file) => readFile(new URL(file, import.meta.url), 'utf8')));
  // The /api/ guard is the data-freshness invariant: learner state must never come from cache.
  assert.match(sw, /url\.pathname\.startsWith\('\/api\/'\)\) return/);
  assert.match(sw, /request\.method !== 'GET'/);
  assert.match(auth, /navigator\.serviceWorker\.register\('sw\.js'\)/);
  assert.match(auth, /link\.href = 'manifest\.webmanifest'/);
  assert.match(auth, /setAppBadge/);
  // Static server must give the manifest and icon real content types.
  assert.match(server, /'\.webmanifest': 'application\/manifest\+json/);
  assert.match(server, /'\.svg': 'image\/svg\+xml'/);
});
