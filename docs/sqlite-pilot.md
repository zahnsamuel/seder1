# SQLite pilot — operator guide

The default hosted path for a learner pilot. It runs the whole app as a single Node process
with an embedded SQLite database — no external database, no auth service, no dashboard. Account
isolation is enforced in the application layer and verified by an automated test.

Prefer this over the Supabase path (`supabase/README.md`) unless you specifically want Postgres
row-level security. The Supabase code still works and is kept for that option.

## What turns it on

Set one environment variable:

```
SEDER_DB=/data/seder.db
```

With `SEDER_DB` set, the server switches to **hosted SQLite mode**:

- Learner data is stored in the SQLite file (one JSON document per learner).
- Sign-in is **per-learner bearer tokens** — no email, no password. A learner claims a name at
  `sign-in.html`, receives a token kept in their browser, and that token authorizes every request.
- `learnerAccess` derives the learner id from the verified token only and returns **403** for any
  other id — this is the account-isolation guarantee (SQLite has no row-level security).
- `GET /api/health` reports `"persistence": "sqlite-ready"`.

Unset `SEDER_DB` and the server falls back to the local JSON dev store (shared `demo` learner, no
auth) — for development only, never a pilot.

## Run it locally

```bash
SEDER_DB=./data/seder.db node server.mjs
# open http://127.0.0.1:4180/seder.html → "Start learning" → a name → you're in
```

## Deploy it

`render.yaml` is configured: it mounts a **persistent disk** at `/data` and sets `SEDER_DB` to a
file on it. The one requirement: the disk needs a **paid instance type** — a free/ephemeral
filesystem would drop every learner on each redeploy. Alternatives if you'd rather not pay Render
for a disk: Fly.io (cheap volumes) or Turso (hosted libSQL — point `DATABASE_URL`-style config at
it; would need a small store adapter).

After deploying, confirm the hosted gates against the live URL:

```bash
SEDER_BASE_URL=https://your-app.example node scripts/preflight.mjs
```

Expect: `persistence: sqlite-ready`, learner routes 200, and the isolation gate green.

## Account isolation — how it's verified

`test/sqlite-isolation.test.mjs` (in `npm test`) boots the real server on a throwaway database,
signs up two learners over HTTP, gives one real data, and asserts the other — and any unsigned
caller — cannot read, write, export, or delete it (401/403 on every path), while the owner can.
This is the pilot's isolation gate and it runs with no external service.

## The learner auth model (what to tell learners)

- **No password.** Their **recovery code** (the bearer token, shown on `profile.html`) is the only
  way back into the account on a new device or after clearing the browser. Tell them to save it.
- Restore access at `sign-in.html` → "Have a recovery code? Restore your account".
- Sign-up is rate-limited per IP (8/hour) to keep the open endpoint from being flooded.

## Operating notes

- **Back up the `.db` file** on a schedule — it is the entire learner dataset. WAL mode writes
  `seder.db-wal` / `seder.db-shm` alongside it; back up all three, or checkpoint first.
- Deleting a learner (`DELETE /api/learners/:id`) removes their row and **revokes their tokens**.
- Everything runs in one process; there is no separate migration step — the schema is created on
  first start (`data/sqlite-store.mjs`).
