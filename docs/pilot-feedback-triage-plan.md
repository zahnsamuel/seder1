# Pilot feedback triage plan

A workflow for turning in-app learner feedback into fixes during the private pilot. This is the
operational companion to [pilot-analytics-reading-plan.md](pilot-analytics-reading-plan.md) (which reads
the whole dashboard) — here we focus only on the feedback stream.

## What the widget captures

The floating feedback button (on academy-session, review, decoding-lesson, diagnostic, daily-router,
path, my-graph) records one reaction, tied to the **page** and **skill** in context, plus an optional
comment (≤500 chars):

| Sentiment | Button | What it usually means |
| --- | --- | --- |
| `broken` | "Something's off" | A defect — something didn't work |
| `confusing` | "Confusing" | UX / copy problem on a specific screen |
| `too-hard` | "Too hard" | Calibration — item or placement too high |
| `too-easy` | "Too easy" | Calibration — item or placement too low |
| `great` | "Loved it" | It's working — capture the moment |

It surfaces on `analytics.html` (with your admin token) → **Learner feedback** panel: totals, counts by
sentiment, and the recent *commented* items with their page + skill.

## The pipeline

**Capture → Classify → Severity → Act → Close the loop.** Keep a single running log (a spreadsheet or a
markdown table — template at the bottom). Every item gets one row; a row is done only when it's either
fixed, batched with a decision, or consciously deferred.

### 1 · Classify — sentiment sets the lane

- **`broken` → Defect lane.** Reproduce it first (go to that page + skill yourself). Real bug → fix.
  Can't reproduce → note it, watch for a second report.
- **`confusing` → UX/copy lane.** The most actionable feedback you get, because it names the exact
  screen. Read the comment; the fix is usually wording or a clearer next action.
- **`too-hard` / `too-easy` → Calibration lane.** *Not* a bug. Don't fix an item off one reaction —
  corroborate against that skill's accuracy on the dashboard, then batch.
- **`great` → Signal lane.** Log the comment verbatim: these are your confidence-gain evidence and demo
  quotes. Note *which skill/page* earned it — that's what's working, protect it.

### 2 · Severity — decide the response speed

| | Criteria | Response |
| --- | --- | --- |
| **P0 — Stop** | Isolation/privacy anomaly, data loss, or a screen fully broken for everyone | Pause recruitment, fix now (see stop conditions) |
| **P1 — Fix this pilot** | `broken` you reproduced, or the same `confusing` screen from **2+ learners** | Fix mid-pilot, one change at a time |
| **P2 — Batch** | Single `confusing`, or corroborated calibration (`too-hard`/`too-easy` + accuracy) | Collect, decide after the next ~5 learners |
| **P3 — Defer / backlog** | One-off nits, feature wishes, unreproducible one-offs | Log, revisit post-pilot |

**The golden rule (from the success criteria): change one important thing at a time,** so you can tell
what moved the next cohort. Resist fixing five things at once.

### 3 · Cluster before you act

Group the log by **page + skill**. A single reaction is a data point; **2+ on the same screen is a
pattern** and jumps a severity level. Clustering also tells you *where* to look, not just *that*
something's wrong.

### 4 · Close the loop

This is a **private pilot with people you recruited by name** — use it:

- Reach back personally to anyone who filed a `broken` once you've fixed it ("you flagged X on the
  decoding lesson — fixed, thank you"). It converts a bug report into loyalty and a return visit.
- Ask a `great` reporter for a one-line testimonial — that's leave-behind and demo gold.
- If someone goes quiet after a `confusing`/`too-hard`, that's a churn signal — a gentle personal nudge
  often recovers them and tells you what broke.

## Stop conditions (pause recruitment, then repair)

Mirror the [success-criteria](jla-pilot-success-criteria.md) stops — the feedback stream is often how
you'll spot them first:

- **Any** isolation/privacy report.
- **Two `broken` on the same page**, or >20% of sessions failing the same way.
- A learner reports the experience **mocked, shamed, or excluded** their background — treat as P0 on
  dignity, not a UX nit. Respond personally.
- Two learners in a row can't find the next action on the same screen.

## Cadence

- **Daily (2 min):** open the feedback panel, read new comments, act on any `broken` immediately, log
  the rest.
- **After every ~5 learners:** review clusters, promote/demote severities, make **one** change, note it,
  watch the next cohort.
- **Day before the demo:** pull your best `great` quotes and your "reported → fixed" wins.

## Feedback → roadmap & demo

Nothing here is wasted — each lane has an onward use:

- **`broken` reproduced and fixed** → your **reliability** story ("learners found issues, we turned them
  around in a day").
- **`confusing` fixed** → your **responsiveness** story, and a sharper product.
- **`too-hard`/`too-easy` + the struggle list** → **calibration and graph-decomposition** candidates —
  the specific pilot signal the graph-growth work is waiting for.
- **`great`** → **demo quotes** and confidence-gain evidence for the leave-behind's "Early signal" block.

---

## Triage log template

Copy into a sheet, one row per reaction:

| When | Learner | Sentiment | Page | Skill | Comment | Severity | Root cause | Action | Status | Followed up? |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| | | | | | | P0–P3 | | | open / fixed / batched / deferred | y / n |
