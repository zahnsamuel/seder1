# Investor / mentor demo script — The Jewish Learning Academy

**Audience:** a Yochai founder who redirected this toward *skills-first, 0→1 Jewish literacy*. They know
the space and they critiqued the old Gemara-mastery framing. **Your edge with this person is honesty:**
a working prototype with a real engine and a credible path to rigor beats any "it's done" claim. Do not
oversell.

**Format:** ~15 min live demo + discussion. Target ~11–12 min of demo, leave room to breathe.

**Live URL:** https://seder-demo.onrender.com &nbsp;·&nbsp; **One-line thesis:** *"We don't teach content —
we build the transferable reading skills that let someone open any Jewish text on their own."*

---

## Pre-flight (do this 10 minutes before)

- [ ] **Scrub test accounts** (Render Shell cleanup script) so analytics is clean.
- [ ] Open, logged-out, in one browser window: the **landing page** (`/`). Keep it on the first tab.
- [ ] In separate tabs, pre-loaded and confirmed working: the **graph map** (see step 3 — prefer the
      published *demo-map* artifact; it's login-free and can't hang) and **`analytics.html`** with your
      admin token already entered.
- [ ] **Click a lesson and the graph map yourself once** — these are the two surfaces automated testing
      couldn't verify. Confirm they load.
- [ ] Decide your **persona: a beginner** (answer "Not reliably yet" to everything). It places in ~7
      self-checks and lands on "learn the Hebrew letters" — your best beat. **Do not** answer as an
      advanced learner live (that path honestly takes ~20 questions).
- [ ] Have **screenshots** of each key screen saved as a fallback in case the network stalls (single
      starter instance).

---

## The 15 minutes

### 1 · The problem & the bet — ~1.5 min *(landing page on screen)*
> "There are millions of adults who feel Jewishly curious but locked out of the canon — no yeshiva, no
> day school, insecure about even opening a page. Existing tools give them *content*: translations,
> references, courses. None of them make you *able to read on your own.*
>
> So we built the opposite. Modeled on Math Academy's knowledge graph: one skill at a time, minimize
> cognitive load, always the single highest-leverage next move. The product isn't the text — it's the
> **transferable reading skill.** Goal: take someone from zero to *'I can open a Jewish text and make
> sense of it myself.'*"

### 2 · Cold open — become a learner — ~3 min *(the centerpiece)*
1. Landing page → read the hero aloud: **"Become someone who can open Jewish texts."**
2. Click **Start learning** → sign up with **just a name** (no password, no email). → *"Ten seconds, no
   friction — this matters for the audience we're serving."*
3. You land in the **adaptive diagnostic**. Answer the first question honestly, then point at the gauge:
   > "Watch this — one answer, and it jumps from *0 of 55 skills mapped* to *16*. The graph infers
   > everything **below** what you can do. So we place you in a handful of self-checks, not one per
   > skill."
4. Keep answering as a **beginner** ("Not reliably yet"). It finishes in ~7 questions on a clean result.
5. Land on the punchline and say it out loud:
   > "A Jewishly-insecure adult who can't yet read Hebrew just got placed — in under a minute — at
   > exactly the first move: **learn the Hebrew letters.** That's the whole 0→1 promise in one screen."

### 3 · The engine is real — the knowledge graph — ~2.5 min *(graph map / demo-map artifact)*
- Show the **layered graph** — 55 skills, colored by the learner's state (mastered green / frontier gold
  / locked grey).
  > "This is the Math Academy model on the Jewish canon. Every skill knows its prerequisites. The gold
  > ring is the learner's **frontier** — everything they're ready to learn *right now*. The system always
  > knows the single move that unlocks the most."
- One sentence on retention: *"Reviews are scheduled by a spaced algorithm, and practicing one skill can
  refresh several it builds on — so review stays short."*

### 4 · A lesson — where 0→1 actually happens — ~2.5 min *(open one scaffolded lesson)*
- Open a lesson from the frontier. Walk the scaffold: **Introduce → Practice → Transfer.**
  > "Each skill is taught on **real sources, across genres.** You learn a move on the Gemara, then
  > **transfer** it to Tanakh or a prayer — and that transfer *is* the skill. That's what makes it
  > literacy and not memorization."
- Point out the vocabulary: progress shows as **emerging / secure / transferable / durable** — capability,
  not points. *"No XP, no gamified score — the language is about what you can actually do."*

### 5 · The operator view & the honest path to rigor — ~2 min *(analytics.html, then the workbenches)*
- Show the **analytics dashboard**: cohort activity, and the **graph-pilot panel** (per-skill difficulty,
  prerequisite-edge validation).
- Then pivot to honesty — this is the part that lands with this mentor:
  > "Here's exactly what's real and what isn't. The **engine is built** — placement, frontier, spaced
  > review, targeted remediation. What it needs next is two things, and we're not faking either:
  > **(1)** a real pilot to calibrate difficulty and validate the graph — that starts **this week**; and
  > **(2)** educator sign-off and authored assessment items — captured through these two workbenches
  > [show the educator-audit + item-authoring workbench artifacts]."

### 6 · The ask — ~1 min
- State plainly what you're raising / what you want from *them* specifically (intros to educators?
  pilot learners? capital? a follow-up?). Keep it concrete.

---

## Discussion — anticipated questions & honest answers

- **"Is the diagnostic graded or self-report?"** → Self-report today; the learner's first real sessions
  confirm and correct it. Graded placement needs authored item banks — that's the educator/authoring
  track, and it's deliberately not built yet.
- **"How big is the graph?"** → 55 skills, a **v0.1 prototype**. Targeting a few hundred. We're *not*
  expanding it speculatively — pilot signal tells us which edges real learners actually stall between.
- **"What's your evidence it works?"** → Honest: the pilot starts this week. Point back at the
  instrumentation — retention, difficulty, edge-validation are already wired to measure it.
- **"How is this different from Sefaria / existing apps?"** → Those are content and reference. This is a
  skills-first adaptive **tutor** — it decides what *you* practice next and why.
- **"Why is the graph the right structure?"** → It's how you deliver one-thing-at-a-time mastery: minimal
  cognitive load, explainable next step, real prerequisites — the Math Academy result, in a new domain.

---

## If time gets cut to ~5 minutes
Do only **step 2** (signup → diagnostic → "learn the Hebrew letters") and **step 3** (the graph). That's
the essence: 0→1 placement + a real adaptive engine.

## Failure modes / hygiene
- **Persona:** beginner or intermediate only (8–15 questions). Never demo the advanced path live.
- **If a page is slow:** it's one small instance — fall back to your screenshots, keep narrating.
- **Graph visual:** prefer the login-free **demo-map artifact** over the live page — it's self-contained
  and can't hang. (The `/docs/…` path is not served on the live app by design.)
- **Don't over-claim.** "Working prototype + real engine + honest path to rigor" is a stronger story to
  this mentor than "it's finished." Let the product be impressive and let the gaps be deliberate.
