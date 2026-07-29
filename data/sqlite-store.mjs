// SQLite-backed persistence for hosted learners, plus per-learner bearer-token auth.
// This is the no-external-service alternative to the Supabase path: learner data lives in
// one embedded SQLite file (Node's built-in node:sqlite — no dependency), and account
// isolation is enforced at the application layer (server.mjs learnerAccess) rather than by
// Postgres RLS. A bearer token is issued once at signup; only its SHA-256 hash is stored,
// so a leaked database file does not hand out usable tokens.
//
// The learners table mirrors the file store's shape exactly — one JSON document per learner
// keyed by id — so data/repository.mjs reuses all of its event/mastery logic unchanged and
// only swaps where the learner map is read from and written to.
import { randomBytes, createHash } from 'node:crypto';
import { createRequire } from 'node:module';

let db = null;
let activePath = null;

// Initialize (or reopen) the store at a given file path. ':memory:' is honored for tests.
// node:sqlite is loaded lazily here (not at import time) so that merely importing this
// module — which data/repository.mjs always does — stays side-effect-free and does not emit
// the experimental-module warning for the file-store path.
export function initSqlite(path) {
  if (db && activePath === path) return;
  if (db) db.close();
  const { DatabaseSync } = createRequire(import.meta.url)('node:sqlite');
  db = new DatabaseSync(path);
  db.exec('pragma journal_mode = WAL; pragma foreign_keys = on;');
  db.exec(`
    create table if not exists learners (
      id text primary key,
      doc text not null
    );
    create table if not exists tokens (
      token_hash text primary key,
      learner_id text not null,
      created_at text not null
    );
    create index if not exists tokens_learner_idx on tokens (learner_id);
  `);
  activePath = path;
}

export function sqliteEnabled() { return db !== null; }
export function closeSqlite() { if (db) { db.close(); db = null; activePath = null; } }
const require_db = () => { if (!db) throw new Error('SQLite store is not initialized (call initSqlite first).'); return db; };

// --- Learner map (the readLearners/writeLearners seam that repository.mjs delegates to). ---
export function readAll() {
  const rows = require_db().prepare('select id, doc from learners').all();
  const map = {};
  for (const row of rows) map[row.id] = JSON.parse(row.doc);
  return map;
}

export function writeAll(learners) {
  const d = require_db();
  const ids = Object.keys(learners);
  const keep = new Set(ids);
  const upsert = d.prepare('insert into learners (id, doc) values (?, ?) on conflict(id) do update set doc = excluded.doc');
  const remove = d.prepare('delete from learners where id = ?');
  d.exec('begin');
  try {
    for (const { id } of d.prepare('select id from learners').all()) if (!keep.has(id)) remove.run(id);
    for (const id of ids) upsert.run(id, JSON.stringify(learners[id]));
    d.exec('commit');
  } catch (err) { d.exec('rollback'); throw err; }
}

// --- Bearer-token auth. Store only the hash; hand the raw token to the client once. ---
const hashToken = (token) => createHash('sha256').update(String(token)).digest('hex');

export function issueToken(learnerId) {
  const token = randomBytes(32).toString('hex');
  require_db().prepare('insert into tokens (token_hash, learner_id, created_at) values (?, ?, ?)')
    .run(hashToken(token), learnerId, new Date().toISOString());
  return token;
}

// Returns { id } for a valid token, or null. Never throws on a bad/absent token.
export function verifyToken(token) {
  if (!token) return null;
  const row = require_db().prepare('select learner_id from tokens where token_hash = ?').get(hashToken(token));
  return row ? { id: row.learner_id } : null;
}

// Revoke every token for a learner (used when their data is deleted).
export function revokeTokens(learnerId) {
  require_db().prepare('delete from tokens where learner_id = ?').run(learnerId);
}
