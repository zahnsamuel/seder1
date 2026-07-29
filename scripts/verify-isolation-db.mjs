#!/usr/bin/env node
// No-token account-isolation check, run over a direct Postgres connection.
//
// This is the companion to verify-account-isolation.mjs (which needs two signed-in
// users' access tokens). Here we connect as the project owner and *impersonate* each
// learner with `set local role authenticated` + a `request.jwt.claims` sub — exactly the
// mechanism Supabase's RLS reads — so we can prove isolation without minting any token or
// signing anyone in. Every check runs inside a transaction that is ROLLED BACK, so probe
// rows never persist and no learner data is mutated.
//
// Required env (put it in .env at the repo root; this file loads that automatically):
//   DATABASE_URL   postgres URI — Supabase → Project Settings → Database → Connection string → URI
// Optional env:
//   EMAIL_A, EMAIL_B   the two test users' emails (default test-a@example.com / test-b@example.com)
//   UUID_A, UUID_B     skip email lookup and use these auth user ids directly
//
// Exit 0 = isolation holds. Non-zero = a leak or a setup problem; do NOT expose real
// learner data until this exits clean.

import { readFileSync } from 'node:fs';

// --- Load .env (KEY=VALUE, # comments) without adding a dependency. Real env wins. ---
try {
  const text = readFileSync(new URL('../.env', import.meta.url), 'utf8');
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
} catch { /* no .env is fine if the vars are already exported */ }

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('Missing DATABASE_URL. Put it in .env (see this file\'s header) and re-run.');
  process.exit(2);
}
const EMAIL_A = process.env.EMAIL_A || 'test-a@example.com';
const EMAIL_B = process.env.EMAIL_B || 'test-b@example.com';

let pg;
try { pg = (await import('pg')).default; }
catch { console.error('The "pg" package is required for the DB path. Run:  npm install pg'); process.exit(2); }

const results = [];
const record = (pass, name, detail) => {
  results.push({ pass, name });
  const tag = pass ? '\x1b[32mPASS\x1b[0m' : '\x1b[31mFAIL\x1b[0m';
  console.log(`  ${tag}  ${name}${detail ? ` — ${detail}` : ''}`);
};

const client = new pg.Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });

// Run fn inside a transaction that is always rolled back, so nothing we do persists.
async function tx(fn) {
  await client.query('BEGIN');
  try { return await fn(); }
  finally { try { await client.query('ROLLBACK'); } catch { /* already aborted */ } }
}
// Switch the current transaction to act AS the given learner (subject to RLS).
async function impersonate(uuid) {
  await client.query('SET LOCAL ROLE authenticated');
  await client.query("SELECT set_config('request.jwt.claims', $1, true)", [JSON.stringify({ sub: uuid, role: 'authenticated' })]);
}

// Learner-data tables that always have a row for a provisioned user (via the signup trigger).
const OWNED_TABLES = [
  { table: 'learner_state', col: 'user_id', mustExistForA: true },
  { table: 'profiles', col: 'id', mustExistForA: true },
  { table: 'review_items', col: 'user_id', mustExistForA: false },
  { table: 'placement_results', col: 'user_id', mustExistForA: false },
  { table: 'daily_sessions', col: 'user_id', mustExistForA: false }
];

async function main() {
  await client.connect();
  const enc = new URL(DATABASE_URL);
  console.log('Seder account-isolation verification (no-token / direct DB)');
  console.log(`  host: ${enc.host}`);

  // --- Resolve the two accounts. ---
  let A = process.env.UUID_A, B = process.env.UUID_B;
  if (!A || !B) {
    const { rows } = await client.query('select id, email from auth.users where email = any($1::text[])', [[EMAIL_A, EMAIL_B]]);
    const byEmail = Object.fromEntries(rows.map((r) => [r.email, r.id]));
    A = A || byEmail[EMAIL_A];
    B = B || byEmail[EMAIL_B];
    if (!A || !B) {
      console.error(`\nCould not find both test users. Looked for ${EMAIL_A} and ${EMAIL_B}.`);
      console.error('Create them (Authentication → Users → Add user, Auto Confirm on), or set UUID_A/UUID_B in .env.');
      return 2;
    }
  }
  console.log(`  A: ${A}\n  B: ${B}`);
  if (A === B) { console.error('\nUUID_A and UUID_B are the same account.'); return 1; }

  // --- Preflight: A actually has data to protect (else every "B sees 0" is vacuous). ---
  console.log('\nPreflight — learner A has provisioned rows');
  for (const { table, col, mustExistForA } of OWNED_TABLES) {
    if (!mustExistForA) continue;
    const { rows } = await client.query(`select count(*)::int n from public.${table} where ${col} = $1`, [A]);
    record(rows[0].n === 1, `A has a ${table} row`, `${rows[0].n} row(s)`);
  }

  // --- Impersonation is really taking effect (else the whole test is meaningless). ---
  console.log('\nImpersonation control — acting as B, and B can read its OWN data');
  await tx(async () => {
    await impersonate(B);
    const uid = (await client.query('select auth.uid() as u')).rows[0].u;
    record(uid === B, 'auth.uid() resolves to B', uid ? `uid=${uid}` : 'null — claims not applied');
    const n = (await client.query('select count(*)::int n from public.learner_state where user_id = $1', [B])).rows[0].n;
    record(n === 1, 'B can read its own learner_state', `${n} row(s)`);
  });

  // --- Reads: B must see none of A's rows. attempts uses a live probe that definitely exists. ---
  console.log("\nIsolation reads — B must NOT see A's rows");
  await tx(async () => {
    await impersonate(B);
    for (const { table, col } of OWNED_TABLES) {
      const n = (await client.query(`select count(*)::int n from public.${table} where ${col} = $1`, [A])).rows[0].n;
      record(n === 0, `B reading A's ${table}`, n === 0 ? '0 rows (RLS filtered)' : `LEAK: ${n} row(s)`);
    }
  });
  await tx(async () => {
    // Insert an attempt owned by A as the owner role (bypasses RLS), prove it exists, then
    // confirm B still sees zero — RLS hiding a row we KNOW is there is the strongest read test.
    await client.query("insert into public.attempts (user_id, skill_id, competency, correct) values ($1, 'isolation-probe', 'recognition', true)", [A]);
    const asOwner = (await client.query("select count(*)::int n from public.attempts where user_id = $1 and skill_id = 'isolation-probe'", [A])).rows[0].n;
    await impersonate(B);
    const asB = (await client.query('select count(*)::int n from public.attempts where user_id = $1', [A])).rows[0].n;
    record(asOwner === 1 && asB === 0, "B reading A's attempts (with a live probe row)", asB === 0 ? "0 rows (RLS hid A's probe)" : `LEAK: ${asB} row(s)`);
  });

  // --- Writes: B must not be able to forge, update, or delete A's data. ---
  console.log("\nIsolation writes — B must NOT create, modify, or delete A's data");
  await tx(async () => {
    await impersonate(B);
    try {
      await client.query("insert into public.attempts (user_id, skill_id, competency, correct) values ($1, 'forged', 'recognition', true)", [A]);
      record(false, 'B forging an attempt as A', 'LEAK: insert succeeded');
    } catch (e) {
      const rls = e.code === '42501' || /row-level security/i.test(e.message);
      record(rls, 'B forging an attempt as A', `rejected (${e.code || e.message.slice(0, 40)})`);
    }
  });
  await tx(async () => {
    await impersonate(B);
    const r = await client.query('update public.learner_state set xp = xp + 0 where user_id = $1 returning user_id', [A]);
    record(r.rowCount === 0, "B updating A's learner_state", r.rowCount === 0 ? '0 rows affected (RLS filtered)' : `LEAK: ${r.rowCount} row(s)`);
  });
  await tx(async () => {
    await client.query("insert into public.attempts (user_id, skill_id, competency, correct) values ($1, 'delete-probe', 'recognition', true)", [A]);
    await impersonate(B);
    const r = await client.query('delete from public.attempts where user_id = $1 returning id', [A]);
    record(r.rowCount === 0, "B deleting A's attempts", r.rowCount === 0 ? '0 rows deleted (RLS filtered)' : `LEAK: ${r.rowCount} row(s)`);
  });

  const failed = results.filter((r) => !r.pass);
  console.log(`\n${'-'.repeat(60)}`);
  if (failed.length === 0) {
    console.log('\x1b[32mAll isolation checks passed.\x1b[0m Account isolation holds at the RLS layer.');
    return 0;
  }
  console.log(`\x1b[31m${failed.length} check(s) FAILED:\x1b[0m`);
  for (const f of failed) console.log(`  - ${f.name}`);
  console.log('Do NOT put real learner data at risk until this exits clean.');
  return 1;
}

let code = 1;
try { code = await main(); }
catch (err) { console.error(`\nUnexpected error: ${err.stack || err.message}`); code = 1; }
finally { try { await client.end(); } catch { /* ignore */ } }
process.exitCode = code;
