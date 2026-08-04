# Go-live checklist — deploying the JLA pilot to Render

The single pre-flight for putting the Jewish Learning Academy in front of real learners. The stack is
deliberately simple: **zero runtime dependencies** (pure Node built-ins), **SQLite via `node:sqlite`**
on a **persistent disk**, one Docker service. Nothing to install, nothing external to configure.

## Verified pilot-ready

Confirmed against a production-like boot (`NODE_ENV=production`, `SEDER_DB` on a disk-style path, no
Supabase) via `npm run golive`:

- health reports `sqlite-ready`; signup issues a token; answers, recommendation, review, the adaptive
  diagnostic, and feedback all work;
- **account isolation holds** — one learner cannot read another's data (403);
- operator analytics is admin-token-gated (rejects no/ wrong token) and returns the graph-pilot +
  feedback signals with the token;
- **data survives a restart** on the same disk path (the reason for the paid plan).

## One-time setup on Render

1. Create a **Blueprint** from this repo (Render reads [`render.yaml`](../render.yaml)) — or a Web
   Service pointing at the repo. It builds from the [`Dockerfile`](../Dockerfile).
2. **Keep the plan on a paid tier (`starter`).** The persistent disk (`/data`, 1 GB, holds
   `seder.db`) requires it — the free plan has ephemeral storage and would **lose every learner on
   each redeploy**.
3. In the Render dashboard → Environment, set **`SEDER_ADMIN_TOKEN`** to a strong random secret (it is
   `sync: false`, so it is never in the repo). This unlocks the operator analytics dashboard.
4. Leave `SUPABASE_URL` / `SUPABASE_ANON_KEY` **unset** — that is what keeps the server in SQLite
   hosted mode (per-learner token auth + isolation).
5. Optional: if your cohort shares one network/IP, raise **`SEDER_SIGNUP_LIMIT`** (default: 8 signups
   per IP per hour) so classmates aren't rate-limited.

## Deploy

- Push to `main`. `autoDeployTrigger: commit` deploys automatically; Render waits on the
  `/api/health` check before routing traffic.

## Verify the live deploy

```bash
SEDER_ADMIN_TOKEN=<your token> node scripts/go-live-check.mjs https://<your-app>.onrender.com
```

All checks must print `PASS` (exit 0). A `FAIL` on **health** usually means `SEDER_DB` isn't set; a
`FAIL` on **isolation** is a hard stop — do not run a pilot until it passes.

## Run the pilot

- Share `https://<your-app>.onrender.com/` — learners sign up with just a name (passwordless).
- Watch the cohort at `https://<your-app>.onrender.com/analytics.html`, entering the admin token.
  The **Learner feedback** panel shows in-app reactions; the **Graph pilot signal** panel fills in
  item difficulty and prerequisite-edge validation as answers accumulate (rows stay "awaiting data"
  until they cross the minimum sample — that is honest, not a bug).

## Data safety

- Learner data lives at `/data/seder.db` on the mounted disk and survives restarts and redeploys.
- To back up, copy that file off the disk periodically (Render Shell: `cp /data/seder.db …`), or use
  the per-learner data-export/delete paths already in the app for individual requests.
