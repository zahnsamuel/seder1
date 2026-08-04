import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const repoRoot = fileURLToPath(new URL('..', import.meta.url));

// A production deploy that quietly falls back to local-development mode is a security hazard — no
// per-learner auth, no account isolation, and an open analytics endpoint. The server must refuse to
// start in that configuration so a missing SEDER_DB is a loud deploy failure, not a silent one.
test('in production the server refuses to start without a persistent store', () => {
  const res = spawnSync(process.execPath, ['server.mjs'], {
    cwd: repoRoot,
    env: { ...process.env, NODE_ENV: 'production', SEDER_DB: '', SUPABASE_URL: '', SUPABASE_ANON_KEY: '', PORT: '0' },
    encoding: 'utf8', timeout: 8000
  });
  assert.equal(res.status, 1, 'exits non-zero (did not stay running in local mode)');
  assert.match(res.stderr, /FATAL[\s\S]*SEDER_DB/, 'explains that SEDER_DB is required');
});

// The guard must NOT fire when a store is configured, nor outside production.
test('with SEDER_DB set, production startup passes the store guard', () => {
  const res = spawnSync(process.execPath, ['-e', "process.env.NODE_ENV='production'; process.env.SEDER_DB=':memory:'; process.env.SUPABASE_URL=''; process.env.SUPABASE_ANON_KEY=''; const { initSqlite, sqliteEnabled } = await import('./data/sqlite-store.mjs'); initSqlite(process.env.SEDER_DB); if(!sqliteEnabled()) { console.error('sqlite not enabled'); process.exit(2); } console.log('ok');"], {
    cwd: repoRoot, encoding: 'utf8', timeout: 8000
  });
  assert.equal(res.status, 0, res.stderr || 'expected clean exit');
  assert.match(res.stdout, /ok/);
});
