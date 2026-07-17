import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('hosted learner endpoints require an authenticated Supabase session', async () => {
  const server = await readFile(new URL('../server.mjs', import.meta.url), 'utf8');
  assert.match(server, /if \(supabaseConfig\(\)\.configured\) \{/);
  assert.match(server, /if \(!token\) \{/);
  assert.match(server, /A sign-in session is required in hosted mode/);
  assert.match(server, /error\.statusCode = 401/);
  assert.match(server, /sendJson\(response, error\.statusCode \|\| 500/);
});
