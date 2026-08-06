# Reading the pilot analytics signal

How to read the operator dashboard (`analytics.html`, with your `SEDER_ADMIN_TOKEN`) during the private
pilot — what each number means, what to *do* about it, and how to turn it into honest demo material for
Aug 18. This is the quantitative companion to the survey/observation thresholds in
[jla-pilot-success-criteria.md](jla-pilot-success-criteria.md); read them together.

## The honest frame: what small N can and can't tell you

With **5–15 learners over ~10 days**, treat the dashboard in three layers, most-trustworthy first:

1. **Funnel & engagement** — reliable at any N. *Are people signing up, placing, doing a session,
   coming back?*
2. **Feedback** — the richest early signal. A handful of real comments beats any ratio.
3. **Learning psychometrics** (difficulty / discrimination / edge-validation) — **need scale.** Most
   rows will read *"awaiting pilot data,"* and that is correct, not a bug. Read direction and outliers,
   never precision.

Do not present a difficulty computed from 4 learners as a finding. The dashboard's `enough` flag hides
under-powered rows on purpose — trust it.

---

## Layer 1 — Funnel & engagement *(the five summary tiles + per-learner)*

| Tile | Read it as | Acts on |
| --- | --- | --- |
| **Learners** | How many started at all | Recruiting is working / stalled |
| **Total attempts** | Depth of use, not just signups | Attempts ÷ Learners ≈ engagement per person |
| **Overall accuracy** | Is difficulty roughly right? | ~60–85% healthy; **>90%** too easy, **<45%** too hard or broken |
| **Overdue reviews** | Are people *coming back*? | Climbing with flat attempts = nobody's returning |
| **Total XP** | Rough activity volume | Sanity only — don't over-index |

**Per learner** (`GET /api/learners/:id/pilot-analytics`): return / repair / transfer signals for one
person — use it to tell a real story ("Learner 3 came back four days, repaired two skills, transferred
one"). At this N, **individual journeys are more persuasive than cohort averages.**

**The funnel to watch, learner by learner:** signed up → completed placement → finished ≥1 session →
returned a second day. Where people fall out is your #1 product signal. The success-criteria doc sets
the thresholds (≥80% begin the session, ≥75% complete a cycle, ≥95% error-free).

---

## Layer 2 — Feedback *(the richest early signal)*

The in-app feedback widget tags every reaction to a page and skill. Read **every comment**, and triage
by sentiment:

- **`broken` / "Something's off"** → treat as a P1 defect. One is worth investigating; two on the same
  page is a stop-and-fix (see stop conditions below).
- **`confusing`** → a UX / copy problem on a *named* page and skill — the most actionable feedback you
  get. Cluster them by page.
- **`too-hard` / `too-easy`** → calibration signal. Corroborate against that skill's accuracy before
  changing anything.
- **`great` / "Loved it"** → capture the comment verbatim — these are your **demo quotes** and your
  "confidence gain" evidence.

Comments are grouped by recency with page + skill attached, so a cluster points you straight at the
screen to fix.

---

## Layer 3 — Learning psychometrics *(the graph-pilot panel — needs scale)*

Only `enough`-powered rows render; expect most to be blank early. When rows do appear:

- **Difficulty** = first-attempt pass rate (P-value). **Flagged red < 0.40** = too hard (or a broken
  item). Near 1.0 = too easy / not discriminating.
- **Discrimination** = point-biserial (does passing this skill track with doing well overall?).
  **Flagged red when negative** — a negative value means strong learners are *failing* it, i.e. the item
  or the placement is wrong. One negative flag with enough N is worth a real look.
- **Prerequisite edge validation** = pass rate when the prereq was secured vs. not, and the **lift** (pp)
  between them. **Positive lift confirms the edge** ("securing A really does help B"). **Flagged red when
  lift ≤ 0** — the graph claims a dependency the data doesn't support; a candidate to re-examine *after*
  the pilot, not mid-flight.

At pilot N, use these to **form hypotheses, not verdicts.** A red flag with `enough` = "look at this
skill"; it is not yet "the graph is wrong."

**Top struggles list** (skills failed repeatedly across the cohort): this is your most concrete graph
signal. **Where real learners stall is exactly the edge worth decomposing** — it's the pilot data the
graph-growth work has been waiting for (bridges are on hold until this points somewhere specific).

---

## Red flags — stop and repair before adding learners

Reading the dashboard, pause recruitment if you see (mirrors the criteria doc's stop conditions):

- **Any** isolation/privacy anomaly (a learner sees anything that isn't theirs).
- **Two `broken` reports on the same page**, or >20% of sessions failing the same way.
- **Overall accuracy collapses** (<45%) or **overdue reviews pile up while attempts stay flat** (nobody
  returning) — the promise isn't landing.
- Two learners in a row can't find the next action on the same screen (from observation/feedback).

Fix one thing at a time; re-check after the next few learners.

---

## Cadence

- **Daily (2 min):** glance at the five tiles + any new feedback comments. Act on `broken` immediately.
- **After every ~5 learners (per the criteria doc):** deeper pass — funnel drop-off, feedback clusters,
  any `enough` psychometric flags, top struggles. Change **one** important thing, note it, watch the next
  cohort.
- **Day before the demo:** pull the numbers you'll actually say out loud (below), and screenshot the
  dashboard as a fallback visual.

---

## From signal → the Aug 18 demo

Feed the leave-behind's "Early signal" block and the demo's honesty pivot with what's **true**, framed
by confidence:

- **Lead with the funnel + a story:** "N learners started, X% completed a full session, here's one
  learner's four-day arc." Concrete and honest beats a shaky average.
- **Use a real feedback quote** (a `great` comment) as your confidence-gain evidence.
- **Show the graph-pilot panel live** even if sparse — *"this is the instrumentation; here's the first
  real difficulty/edge data coming in, and here's what more pilot volume calibrates."* Sparse-but-honest
  is the whole point with this mentor.
- **If the psychometrics are still thin, say so.** "N is small, so we're reading direction and
  qualitative signal, not calibrated numbers yet" is a stronger line than a precise-sounding claim the
  mentor will rightly distrust.
