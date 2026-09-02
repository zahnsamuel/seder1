# Adopting the JLA UI system

A short, mechanical recipe for bringing any of the app's pages onto the shared design
system. This is the rollout path for the UI consolidation — converting a page is a
per-page edit of its HTML only; you rarely touch its JS or its own CSS.

Learner-facing product law lives in `docs/ui-principles.md`. This file is the
mechanical recipe only.

## What the system is

Three files, all additive and namespaced so they never collide with legacy page CSS:

- **`jla-system.css`** — the single source of truth. Design tokens are all `--jla-*`
  prefixed and components are all `.jla-*` classed. Because of the prefix it neither
  overrides nor is overridden by legacy per-page `:root` palettes (several old sheets,
  e.g. `canon-labs.css`, redefine bare `--paper` / `--ink` / `--line`). Load order does
  not matter for correctness.
- **`jla-shell.js`** — renders the persistent top bar. **Simplified 2026-08-31 (Sam):**
  brand · page label · Today · Account. No live rhythm/capability stats and no
  next-step recommendation chip — Today owns the next action; Academy owns progress.
  Optional `data-links` may add **contextual** destinations (for example Mastery on an
  arc). Links that duplicate Today or Account, or that look like a recommendation chip,
  are ignored. The shell is mount-based and purely presentational: it does not call
  learner APIs.
- **`capability-state.js`** — the canonical capability vocabulary. Most pages already
  load it. The simplified shell no longer reads it for chrome, but hub/path surfaces
  still do.

## The recipe (copy/paste, then adjust)

For a page you want to convert:

**1. Add the stylesheet** (anywhere in `<head>`; order does not matter):

```html
<link rel="stylesheet" href="jla-system.css">
```

**2. Put the base class on `<body>`** so the page gets the canonical cream background
(paper cards then contrast correctly):

```html
<body class="jla">
```

**3. Replace the page's hand-rolled `<header>` with the shell mount.** Contextual links
are optional. Prefer destinations that are not Today or Account — those already live
in the bar:

```html
<div id="jla-shell-mount"
     data-links='[{"label":"Notebook","href":"notebook.html"},{"label":"Mastery map","href":"canon-map.html"}]'></div>
```

`data-links` is optional — omit it for pages with no extra contextual nav. Do **not**
use `data-links` to reintroduce a “next step” chip.

**4. Load the scripts** (before the page's own scripts is fine; the shell is independent).
`seder-auth.js` still supplies skip-link + focus-visible. `capability-state.js` remains
for pages that render capability chips:

```html
<script src="seder-auth.js?v=2"></script>
<script src="capability-state.js"></script>
<script src="jla-shell.js"></script>
```

That is the whole conversion for most pages. The shell appears as brand · label · Today
· Account, the page sits on the shared background, and nothing else changes.

## Optional: adopt components

Once a page is on the system you can swap bespoke markup for shared components as you
touch it — no rush, do it opportunistically:

- **Capability chips:** `.jla-chip.is-emerging|is-secure|is-transferable|is-durable`
- **Spatial path** (a sequence of steps): `<ol class="jla-path">` with
  `<li class="jla-node is-done|is-current|is-upcoming">` — see `daily-router.js`
  `renderSessionPlan` for the canonical render. (`daily-router.js` is no longer loaded
  by Today; that page uses `jla-next-action.js`.)
- **Reading row:** `.jla-source-line` with an inner `.jla-source-he` for the Hebrew.
- **Interactive choices:** `.jla-choice` (+ `.is-correct` / `.is-wrong`) and
  `.jla-feedback` — see `jla-practice.js` for a full worked lesson.
- **Buttons / cards / section heads:** `.jla-btn(.jla-btn-primary|.jla-btn-ghost)`,
  `.jla-card`, `.jla-section-head`, `.jla-meter`.

## Converted so far

- `seder.html` — hub, on the shell. `data-links` still records Today's Study + the
  account action for hosted-sign-in tests; the simplified shell filters those
  duplicates and keeps a single Today + Account pair. The page itself is one promise
  + one Today CTA.
- `academy.html` — 90-day academy hub: shell + a two-step Study→Demonstrate spatial path and
  progressive foundations keyed to each foundation's real completion signal (decoding uses a
  `localStorage` flag, not a server stage). Framed as a progress reference, not a second
  recommendation surface.
- `daily-router.html` — Today: one `[data-jla-next-action]` hero driven by
  `jla-next-action.js` (not `daily-router.js`). Presentation in `jla-next-action.css`.
- `hebrew-decoding.html` — decoding ladder index: one next-move hero; full ladder in collapsed
  `<details>`.
- `decoding-lesson.html` — in-lesson glyph drill on the shell. Hidden `#xp`; lesson map in
  collapsed `<details>` (“This lesson”); glyph card uses `.jla-glyph-card` / `.jla-glyph`.
- `source-reader.html` — one line at a time on the shell: Hebrew + optional translation + one
  reading-move prompt + Continue. No textareas. Other passages and Sefaria live in collapsed
  `<details>`. Notebook / Mastery map are shell contextual links.
- `daf-workbench.html` — Berakhot Daf workspace on the shell. Hidden `#xp`; sugya map, source
  packet, other openings, and reading protocol in collapsed `<details>`. Record + translation
  stay first-paint.
- `flagship-daf-workbench.html` — production Daf workspace for the other flagship tractates.
  Same chrome as Berakhot: shell, hidden `#xp` / `#masteryLink`, extras in `<details>`.
- `diagnostic.html` + `placement.html` — placement flow (both entry points on the shell; each keeps
  a hidden `#status` element as a JS hook).
- All 45 `*-arc.html` tractate/subject arcs — converted in one codemod (strip the non-uniform
  header, carry its contextual link into the shell via `data-links`, keep a hidden `#xp` hook).
- `jla-practice.html` — reference lesson, wired to the real item bank
  (`GET`/`POST /api/jla/academy-session/:skillId`, server-scored, records capability evidence).
  `?skill=` selects any of the 24 authored items.
- `academy-session.html` — the ROUTED production lesson (both the fnd-* introduce/practice/transfer
  scaffold and the server-scored slice sessions), migrated onto the shell + `.jla-choice` /
  `.jla-feedback` / `.jla-btn`. Logic unchanged; slice answers still server-scored.

**Batch conversions:** when many pages share a structure (like the arcs), a codemod beats hand-editing
— strip `<header>…</header>` with a regex, extract its non-brand `<a>` links into `data-links`, and
inject the stylesheet + scripts. Make it idempotent (skip files already containing `jla-shell-mount`)
and dry-run first.

Note the two hooks the conversions preserved: a hidden `#status` (placement) and a hidden `#xp`
(hub) so existing scripts keep writing to them without a null crash. When a page's old header had
elements its JS updates, keep them (hidden) rather than deleting them.

## Verifying a conversion

Portable Node lives at `C:\Users\zahns\node` (no system Node). From the repo:

```bash
npm start   # serves at http://localhost:4180 in local mode (no auth)
```

Open the converted page, confirm the shell shows brand · page label · Today · Account
(no live `0` scoreboard, no competing next-step chip), the page sits on the cream
background, and the console is clean. `node scripts/smoke-http.mjs` covers the
key routes.
