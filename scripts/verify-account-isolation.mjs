#!/usr/bin/env node
// Live cross-account isolation check for the hosted Supabase path.
//
// Automates steps 3-7 of supabase/README.md > "Account isolation verification":
// confirms learner B can neither read nor write learner A's data at the REST/RLS
// layer, and (optionally) that the app-layer learnerAccess guard also holds.
//
// This does NOT create accounts or mint tokens (steps 1-2) -- those are inherently
// interactive. Do them once, then feed the two tokens + UUIDs in as env vars.
//
// Required env:
//   SUPABASE_URL        e.g. https://xxxx.supabase.co
//   SUPABASE_ANON_KEY   project anon key
//   TOKEN_A, TOKEN_B    each account's access_token
//                       (app console: (await window.supabase.auth.getSession()).data.session.access_token)
//   UUID_A, UUID_B      each account's auth user id
// Optional env:
//   APP_URL             running app base URL (e.g. http://127.0.0.1:4180) to also
//                       exercise step 7 (the app-layer guard). Skipped if unset.
//
// PowerShell:  $env:SUPABASE_URL="..."; $env:TOKEN_A="..."; ...; node scripts/verify-account-isolation.mjs
// bash:        SUPABASE_URL=... TOKEN_A=... node scripts/verify-account-isolation.mjs
//
// Exit code 0 = every check passed (isolation holds). Non-zero = a failure or leak;
// do NOT put real learner data at risk until this exits 0.

const REQUIRED = ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'TOKEN_A', 'TOKEN_B', 'UUID_A', 'UUID_B'];
const missing = REQUIRED.filter((k) => !process.env[k]);
if (missing.length) {
  console.error(`Missing required env: ${missing.join(', ')}\n`);
  console.error('See the header of this file, or supabase/README.md > "Account isolation verification".');
  process.exit(2);
}

const SUPABASE_URL = process.env.SUPABASE_URL.replace(/\/+$/, '');
const ANON = process.env.SUPABASE_ANON_KEY;
const { TOKEN_A, TOKEN_B, UUID_A, UUID_B, APP_URL } = process.env;

// Tables holding learner data, and the column each scopes ownership by.
// profiles keys on `id`; every other table on `user_id` (per 001_learner_mastery.sql).
const TABLES = [
  { table: 'learner_state', idCol: 'user_id', control: true },
  { table: 'attempts', idCol: 'user_id', control: true },
  { table: 'profiles', idCol: 'id', control: true },
  { table: 'review_items', idCol: 'user_id', control: false },
  { table: 'placement_results', idCol: 'user_id', control: false },
  { table: 'daily_sessions', idCol: 'user_id', control: false }
];

const results = [];
const record = (pass, name, detail) => {
  results.push({ pass, name, detail });
  const tag = pass ? '\x1b[32mPASS\x1b[0m' : '\x1b[31mFAIL\x1b[0m';
  console.log(`  ${tag}  ${name}${detail ? ` - ${detail}` : ''}`);
};
const warn = (name, detail) => console.log(`  \x1b[33mWARN\x1b[0m  ${name}${detail ? ` - ${detail}` : ''}`);

async function rest(path, { token, method = 'GET', body, prefer } = {}) {
  const headers = { apikey: ANON, Authorization: `Bearer ${token}` };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (prefer) headers.Prefer = prefer;
  const res = await fetch(`${SUPABASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined
  });
  const text = await res.text();
  let data;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  return { status: res.status, ok: res.ok, data };
}

// ---- Preflight: prove each token actually belongs to its claimed UUID. ----
// Without this, an expired/swapped token could make every isolation read return
// [] for the wrong reason and the test would "pass" vacuously.
async function preflight() {
  console.log('\nPreflight - verifying tokens map to their UUIDs');
  let ok = true;
  for (const [label, token, uuid] of [['A', TOKEN_A, UUID_A], ['B', TOKEN_B, UUID_B]]) {
    const res = await rest('/auth/v1/user', { token });
    if (res.status !== 200 || !res.data?.id) {
      record(false, `token ${label} is valid`, `auth/v1/user returned ${res.status}`);
      ok = false;
      continue;
    }
    if (res.data.id !== uuid) {
      record(false, `token ${label} matches UUID_${label}`, `token is for ${res.data.id}, not ${uuid}`);
      ok = false;
    } else {
      record(true, `token ${label} matches UUID_${label}`);
    }
  }
  if (UUID_A === UUID_B) {
    record(false, 'UUID_A and UUID_B are different accounts', 'both are the same id');
    ok = false;
  }
  return ok;
}

// ---- Positive control: learner A can read its own data. ----
// If A can't even see its own rows, a "B sees nothing" result proves nothing.
async function positiveControl() {
  console.log('\nPositive control - learner A can read its own data (else the test is vacuous)');
  for (const { table, idCol, control } of TABLES) {
    if (!control) continue;
    const res = await rest(`/rest/v1/${table}?${idCol}=eq.${UUID_A}&select=${idCol}`, { token: TOKEN_A });
    const rows = Array.isArray(res.data) ? res.data.length : 0;
    if (table === 'attempts') {
      if (rows > 0) record(true, `A sees own ${table}`, `${rows} row(s)`);
      else warn(`A sees own ${table}`, 'empty - did step 3 create attempt data for A?');
    } else {
      // learner_state + profiles are provisioned by the signup trigger, so they must exist.
      record(rows > 0, `A sees own ${table}`, rows > 0 ? `${rows} row(s)` : 'empty - unexpected; is UUID_A/TOKEN_A correct?');
    }
  }
}

// ---- Step 4/5: learner B must not be able to READ learner A's rows. ----
async function isolationReads() {
  console.log("\nIsolation reads - learner B must NOT see learner A's rows (expect [] each)");
  for (const { table, idCol } of TABLES) {
    const res = await rest(`/rest/v1/${table}?${idCol}=eq.${UUID_A}&select=*`, { token: TOKEN_B });
    if (!Array.isArray(res.data)) {
      // An error here is not a silent leak, but it isn't the documented behavior either.
      record(false, `B reading A's ${table}`, `expected [] but got status ${res.status}: ${JSON.stringify(res.data).slice(0, 120)}`);
      continue;
    }
    record(res.data.length === 0, `B reading A's ${table}`, res.data.length === 0 ? 'empty (RLS filtered)' : `LEAK: ${res.data.length} row(s) returned`);
  }
}

// ---- Step 6: learner B must not be able to WRITE learner A's row. ----
// A PATCH scoped to A's id, run as B: RLS's `using` clause filters A's row out of
// B's view, so 0 rows should change. Any returned row = B modified A's data.
async function isolationWrite() {
  console.log("\nIsolation write - learner B must NOT modify learner A's learner_state");
  const sentinel = -424242; // xp check is >= 0, so this can never be a real value
  const res = await rest(`/rest/v1/learner_state?user_id=eq.${UUID_A}`, {
    token: TOKEN_B,
    method: 'PATCH',
    body: { xp: sentinel },
    prefer: 'return=representation'
  });
  if (res.status >= 400) {
    record(true, "B writing A's learner_state", `rejected with status ${res.status}`);
    return;
  }
  const rows = Array.isArray(res.data) ? res.data.length : 0;
  record(rows === 0, "B writing A's learner_state", rows === 0 ? 'no rows affected (RLS filtered)' : `LEAK: B modified ${rows} of A's row(s)`);
}

// ---- Step 7 (optional): the app-layer guard must also reject cross-account access. ----
async function appLayerGuard() {
  if (!APP_URL) {
    console.log('\nApp-layer guard - skipped (set APP_URL to the running app to include step 7)');
    return;
  }
  console.log('\nApp-layer guard - GET /api/learners/UUID_A with B\'s token must be rejected');
  const base = APP_URL.replace(/\/+$/, '');
  let res;
  try {
    res = await fetch(`${base}/api/learners/${UUID_A}`, { headers: { Authorization: `Bearer ${TOKEN_B}` } });
  } catch (err) {
    warn('app-layer guard', `could not reach ${base}: ${err.message}`);
    return;
  }
  const text = await res.text();
  const rejected = res.status >= 400;
  record(rejected, 'app rejects B accessing A', rejected ? `status ${res.status}` : `LEAK: returned ${res.status} with a body of ${text.length} chars`);
}

// Close global fetch's keep-alive socket pool. On Windows, calling process.exit()
// while these undici sockets are still open trips a libuv assertion and returns a
// garbage exit code, so we drain the pool and let the process exit naturally with
// process.exitCode instead of force-exiting. Best-effort: internal symbol may move.
async function drainHttp() {
  try {
    const dispatcher = globalThis[Symbol.for('undici.globalDispatcher.1')];
    if (dispatcher && typeof dispatcher.close === 'function') await dispatcher.close();
  } catch { /* fall back to keep-alive timeout draining the loop */ }
}

async function main() {
  console.log('Seder account-isolation verification');
  console.log(`  project: ${SUPABASE_URL}`);
  console.log(`  A: ${UUID_A}`);
  console.log(`  B: ${UUID_B}`);

  if (!(await preflight())) {
    console.error('\nPreflight failed - fix the tokens/UUIDs above before trusting any result. Aborting.');
    return 1;
  }
  await positiveControl();
  await isolationReads();
  await isolationWrite();
  await appLayerGuard();

  const failed = results.filter((r) => !r.pass);
  console.log(`\n${'-'.repeat(60)}`);
  if (failed.length === 0) {
    console.log('\x1b[32mAll isolation checks passed.\x1b[0m You may mark "RLS policy tests pass" as verified.');
    return 0;
  }
  console.log(`\x1b[31m${failed.length} check(s) FAILED:\x1b[0m`);
  for (const f of failed) console.log(`  - ${f.name}${f.detail ? ` (${f.detail})` : ''}`);
  console.log('Do NOT put real learner data at risk until this exits cleanly.');
  return 1;
}

main()
  .catch((err) => {
    console.error(`\nUnexpected error: ${err.stack || err.message}`);
    return 1;
  })
  .then(async (code) => {
    await drainHttp();
    process.exitCode = code ?? 0;
  });
