# Seder — agent coordination

Two agents work concurrently in this repo: **Codex** and **Claude** (via Claude Code).
Sam coordinates both.

## Current assignment

Codex: your current prioritized assignment is in **`docs/codex-assignment.md`**.
Read it before starting other work. It covers Supabase isolation verification,
the tractate-mastery migration, uncommitted analytics server code waiting to be
folded into your next `server.mjs`/`data/repository.mjs` commit, and one product
decision to make with Sam. It also lists the files Claude is actively creating,
so you can avoid collisions.

## Shared working rules

- **Commit hygiene:** stage specific files only (never `git add -A` / `.`). Before
  staging a shared file, check `git diff` for the other agent's uncommitted work;
  if entangled, leave it uncommitted and document in `docs/qa-intake.md`.
- **Cross-agent log:** `docs/qa-intake.md` is the running log both agents use for
  findings, fixes, and handoffs. Append dated entries; don't rewrite others' entries.
- **Server reload:** `server.mjs` and server-side `.mjs` imports load once at process
  start — kill and restart the node process after editing them.
- **Tests:** run `node --test "test/*.test.mjs"` (the glob, not the bare directory)
  before committing.
- **Content integrity:** multiple-choice answers must render shuffled (see the
  `shuffle` pattern in `course-engine.js` / `canon-course.js`); never render choices
  in data order with a fixed `correct` index. Sensitive subjects (mourning, family,
  practical halakha) require a responsible-learning boundary step. Verify every
  source citation against Sefaria before shipping content.
