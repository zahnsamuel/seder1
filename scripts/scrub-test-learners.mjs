#!/usr/bin/env node
// Remove test / QA learner accounts from the pilot SQLite database — the throwaway accounts left by
// go-live-check runs and manual demo signups — so operator analytics shows only real learners.
//
// Runs against the DB file directly, so the intended home is the Render Shell on the live instance
// (scripts/ ships in the image; docs/ and test/ do not). It never exposes a remote delete surface.
//
//   SEDER_DB=/data/seder.db node scripts/scrub-test-learners.mjs             # DRY RUN — lists matches
//   SEDER_DB=/data/seder.db node scripts/scrub-test-learners.mjs --confirm   # actually deletes them
//
// Target extra accounts explicitly with --name "Exact Display Name" and/or --id exact-learner-id
// (repeatable). The built-in `demo` fixture is never removed. Safe alongside the running server
// (SQLite WAL), but back up first (scripts/sqlite-backup.mjs) and prefer a low-traffic moment.
//
// Exit codes: 0 done (or dry run), 2 usage error.
import { initSqlite, revokeTokens, closeSqlite } from '../data/sqlite-store.mjs';
import { listLearnersFull, deleteLearner } from '../data/repository.mjs';

// Display-name / id patterns for accounts this project creates while testing. Kept deliberately
// narrow so it cannot sweep up a real learner: go-live-check signs up as "go-live-a-*"/"go-live-b-*",
// manual QA as "Demo …", and the isolation test as "Learner A"/"Learner B".
export const DEFAULT_PATTERNS = [/^demo\b/i, /^go-?live\b/i, /^(learner [ab])$/i];

// Pure predicate (unit-tested): is this a test-artifact account? Explicit --name/--id always win;
// the built-in `demo` fixture is always spared.
export function isTestLearner(learner, { names = [], ids = [] } = {}) {
  const id = learner.id || '';
  const name = (learner.profile && learner.profile.displayName) || '';
  if (id === 'demo') return false; // never remove the canonical demo fixture
  if (ids.includes(id) || names.includes(name)) return true;
  return DEFAULT_PATTERNS.some((re) => re.test(name) || re.test(id));
}

function argValues(flag) {
  const out = [];
  for (let i = 2; i < process.argv.length; i++) if (process.argv[i] === flag && process.argv[i + 1]) out.push(process.argv[i + 1]);
  return out;
}

async function main() {
  const positional = process.argv.slice(2).find((a) => !a.startsWith('--') && a.endsWith('.db'));
  const dbPath = process.env.SEDER_DB || positional;
  if (!dbPath) {
    console.error('Usage: SEDER_DB=/data/seder.db node scripts/scrub-test-learners.mjs [--confirm] [--name "X"]... [--id x]...');
    process.exit(2);
  }
  const confirm = process.argv.includes('--confirm');
  const names = argValues('--name');
  const ids = argValues('--id');

  initSqlite(dbPath);
  try {
    const all = await listLearnersFull('.');
    const matches = all.filter((learner) => isTestLearner(learner, { names, ids }));
    console.log(`Scanned ${all.length} learner(s); ${matches.length} match the test patterns${confirm ? '' : ' (DRY RUN)'}:`);
    for (const learner of matches) {
      console.log(`  ${learner.id}  "${(learner.profile && learner.profile.displayName) || ''}"  xp=${learner.xp || 0}  updated=${learner.updatedAt || '?'}`);
    }
    if (!matches.length) return;
    if (!confirm) {
      console.log('\nDry run. Re-run with --confirm to delete the accounts listed above.');
      console.log('(Back up first: SEDER_DB=' + dbPath + ' node scripts/sqlite-backup.mjs)');
      return;
    }
    let deleted = 0;
    for (const learner of matches) {
      const existed = await deleteLearner('.', learner.id);
      if (existed) { revokeTokens(learner.id); deleted += 1; console.log(`deleted ${learner.id}`); }
    }
    console.log(`\nDeleted ${deleted} of ${matches.length} matched account(s).`);
  } finally {
    closeSqlite();
  }
}

// Run the CLI only when executed directly, not when imported by the test.
if (process.argv[1] && process.argv[1].replace(/\\/g, '/').endsWith('scripts/scrub-test-learners.mjs')) {
  main().catch((error) => { console.error(error?.stack || error); process.exit(1); });
}
