import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import net from 'node:net';
import { fileURLToPath } from 'node:url';

// The /api/health endpoint reports which build is running so an operator can confirm a deploy
// actually shipped the intended commit. On Render the value comes from the automatic
// RENDER_GIT_COMMIT env var injected at runtime; the Dockerfile also bakes it as SEDER_COMMIT so
// the image is self-describing. These tests pin that the payload surfaces that value, with
// RENDER_GIT_COMMIT winning when both are present (matching server.mjs: RENDER_GIT_COMMIT || SEDER_COMMIT).

const repoRoot = fileURLToPath(new URL('..', import.meta.url));

function freePort() {
  return new Promise((resolve, reject) => {
    const s = net.createServer();
    s.on('error', reject);
    s.listen(0, '127.0.0.1', () => { const { port } = s.address(); s.close(() => resolve(port)); });
  });
}

// Boot the real server with the given env, read /api/health once, then shut it down. No store is
// configured and NODE_ENV is left unset, so it runs in local-development mode — fine here, we only
// assert the commit field, which is independent of the persistence backend.
async function healthWith(env) {
  const port = await freePort();
  const base = `http://127.0.0.1:${port}`;
  const server = spawn(process.execPath, ['server.mjs'], {
    cwd: repoRoot,
    env: { ...process.env, PORT: String(port), SUPABASE_URL: '', SUPABASE_ANON_KEY: '', SEDER_DB: '',
           RENDER_GIT_COMMIT: '', SEDER_COMMIT: '', NODE_ENV: '', ...env },
    stdio: 'ignore'
  });
  try {
    const deadline = Date.now() + 10000;
    while (Date.now() < deadline) {
      try { const r = await fetch(`${base}/api/health`); if (r.ok) return await r.json(); }
      catch { /* not listening yet */ }
      await new Promise((r) => setTimeout(r, 120));
    }
    throw new Error('server did not respond on /api/health within the timeout');
  } finally {
    server.kill();
    await new Promise((r) => { server.once('exit', r); setTimeout(r, 1500); });
  }
}

test('health surfaces the runtime RENDER_GIT_COMMIT Render injects', async () => {
  const health = await healthWith({ RENDER_GIT_COMMIT: 'abc1234deploysha' });
  assert.equal(health.commit, 'abc1234deploysha');
});

test('health falls back to the SEDER_COMMIT baked into the image', async () => {
  const health = await healthWith({ SEDER_COMMIT: 'baked5678imagesha' });
  assert.equal(health.commit, 'baked5678imagesha');
});

test('RENDER_GIT_COMMIT wins when both are set', async () => {
  const health = await healthWith({ RENDER_GIT_COMMIT: 'runtime999', SEDER_COMMIT: 'baked000' });
  assert.equal(health.commit, 'runtime999');
});

test('health reports commit: null when neither is set', async () => {
  const health = await healthWith({});
  assert.equal(health.commit, null);
});
