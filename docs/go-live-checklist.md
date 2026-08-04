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

1. Prefer a **Blueprint** from this repo (Render reads [`render.yaml`](../render.yaml)): it wires the
   persistent disk and `SEDER_DB` for you. A plain **Web Service** pointing at the repo also works and
   is now safe — the [`Dockerfile`](../Dockerfile) bakes `SEDER_DB=/data/seder.db` into the image, so
   the server enters SQLite hosted mode even when `render.yaml` isn't applied. But a plain Web Service
   gets **no persistent disk unless you add one**, so learner data would be ephemeral (lost on
   redeploy). If you go that route, add a 1 GB disk mounted at `/data` in the dashboard. When in doubt,
   use the Blueprint.
2. **Keep the plan on a paid tier (`starter`).** The persistent disk (`/data`, 1 GB, holds
   `seder.db`) requires it — the free plan has ephemeral storage and would **lose every learner on
   each redeploy**.
3. In the Render dashboard → Environment, set **`SEDER_ADMIN_TOKEN`** to a strong random secret (it is
   `sync: false`, so it is never in the repo). This unlocks the operator analytics dashboard.
4. Leave `SUPABASE_URL` / `SUPABASE_ANON_KEY` **unset** — that is what keeps the server in SQLite
   hosted mode (per-learner token auth + isolation).
5. Optional: if your cohort shares one network/IP, raise **`SEDER_SIGNUP_LIMIT`** (default: 8 signups
   per IP per hour) so classmates aren't rate-limited.

## Push and redeploy

1. Note the commit you're shipping, so you can confirm the live deploy matches:

   ```bash
   git rev-parse --short HEAD
   ```

2. Push `main`:

   ```bash
   git push origin main
   ```

   `autoDeployTrigger: commit` starts the build automatically. Watch it in the Render dashboard →
   **Events** / **Logs**; Render waits on the `/api/health` check before routing traffic, so a failing
   health check keeps the *previous* deploy live (safe).

## Verify the live deploy

1. Confirm the running build is what you pushed and is in hosted mode:

   ```bash
   curl -s https://<your-app>.onrender.com/api/health
   ```

   Expect `"persistence":"sqlite-ready"` (**not** `local-development`) and `"commit"` to be the full
   SHA that **begins with** the short SHA from the push step (Render injects the deployed commit; the
   image also bakes it as a fallback). If `commit` is `null` or a different SHA, the redeploy didn't
   take — re-check the dashboard.

2. Run the full gate against the live URL:

   ```bash
   SEDER_ADMIN_TOKEN=<your token> node scripts/go-live-check.mjs https://<your-app>.onrender.com
   ```

   All checks must print `PASS` (exit 0). A `FAIL` on **health** means it's not in `sqlite-ready`
   mode — see Troubleshooting. A `FAIL` on **isolation** is a hard stop — do not run a pilot until it
   passes.

## Troubleshooting

- **Health says `local-development`** (no auth, no isolation, open analytics — do **not** pilot on
  this). It means neither `SEDER_DB` nor Supabase reached the process. Root cause we hit once: the
  service was created as a plain Web Service, so `render.yaml`'s env var and disk never applied. Two
  defenses are now in place: the Dockerfile bakes `SEDER_DB=/data/seder.db`, and the server
  **fail-closes** — under `NODE_ENV=production` with no store it refuses to start rather than serve
  insecurely, so a genuinely misconfigured deploy shows up as a failed deploy (check the logs for the
  `FATAL: … no persistent store is configured` line) instead of a quietly insecure one. Fix: redeploy
  from the current `Dockerfile`, or set `SEDER_DB=/data/seder.db` in the dashboard, and ensure a disk
  is mounted at `/data`.
- **Health `commit` is `null` or an old SHA.** The new build didn't roll out. Trigger a manual deploy
  (**Manual Deploy → Deploy latest commit**) and re-check.
- **Learners disappear after a redeploy.** No persistent disk is mounted at `/data` (or the plan is
  free/ephemeral). Add the 1 GB disk and use a paid tier.

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
