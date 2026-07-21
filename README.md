# Jewish Learning Academy — a mastery-learning platform for Jewish study

Jewish Learning Academy combines Math Academy-style mastery learning (spaced review, decay-aware retrieval, evidence-based skill tracking) with Duolingo-style engagement (streaks, XP, short checkpointed sessions) and applies it to Jewish learning: Gemara, Chumash & Tanakh, Halakha, Jewish Thought, Tefillah, Chassidus, Mussar, and Jewish History. It takes a learner from an 8-question placement check through beginner sessions to independent, unscaffolded source reading, tracking real skill mastery the whole way rather than just lesson completion.

## Run it

For the offline visual prototype, open `index.html` in any modern browser.

For the full curriculum API, learner persistence, and optional Yochai source discovery, run:

```sh
npm start
```

(equivalent to `node server.mjs`). Then open `http://127.0.0.1:4180`. The health endpoint reports whether Yochai is in `demo-mode` or `configured` mode.

Run the automated test suite (mastery-decay math, review scheduling, evidence/transfer bonus, placement, decay detection) with:

```sh
npm test
```

For a production container build, use the included `Dockerfile` and supply `SUPABASE_URL` and `SUPABASE_ANON_KEY` through the host's secret/environment configuration.

## What is implemented

- An 8-question placement check spanning Gemara, Chumash, Halakha, and Jewish Thought, seeding real starting mastery and competency scores rather than dropping every learner into the same first lesson
- A goal-personalization step (`goals.html`) that biases the daily recommendation toward prayer literacy, Jewish Thought, or the Chumash → Mishnah → Gemara canon path
- A mastery-decay engine (`data/mastery-decay.mjs`) modeling forgetting with a 21-day half-life, surfaced to learners as fresh / fading / faded / none, plus a "quietly decayed" signal for skills that are technically above the review threshold but no longer fresh
- A spaced-repetition review queue with increasing intervals (0h → 24h → 72h → 168h → 336h) and a review-variant bank so a learner revisiting a missed skill sees a different question, not the exact screen they got wrong
- A multi-context evidence system: practicing a skill in a second, genuinely distinct source context (e.g. a tractate lab after a course lesson) earns a transfer-mastery bonus and is surfaced on the Mastery page as "confirmed across N sources," and durability reviews for cross-context skills are spaced further out
- Full course tracks with connected multi-step lessons for Gemara (Berakhot: 5 units from Mishnah grammar through independent reading), Halakha, Chumash & Tanakh, Jewish Thought/Philosophy, and Tefillah, plus full tractate arcs for nine gateway tractates (Shabbat, Eruvin, Pesachim, Sukkah, Bava Metzia, Bava Kamma, Ketubot, Chullin, and Niddah — `shabbat-arc.html` etc.; Bava Kamma's 10-step arc teaches its four-category damage structure, the av/toldot distinction, and Torah grounding in Exodus 21–22; Ketubot traces a fixed wedding schedule to its institutional reason and a second weighed concern; Chullin reads a rule through its own exception and the condition that reopens it; Niddah holds a genuine three-way Tannaitic dispute — Shammai, Beit Hillel, and the Sages — without flattening it), alongside single-Mishnah practice labs for all 27 remaining tractates (full coverage of all 37 Bavli tractates in Shas), reachable from the Shas map, which routes to a tractate's full arc when one exists and to its lab otherwise
- Full 8-step arcs for the four subjects that previously had only a single intro lesson — Mussar (`mussar-arc.html`), Chassidus (`chassidus-arc.html`), Jewish History (`history-arc.html`), and Judaism & the Wider World (`widerworld-arc.html`) — each ending in a cross-subject transfer step and an independent-reading checkpoint, wired into `subject.js`'s track chain ahead of the existing `canon-arc.html` lesson
- Two exercise types: multiple-choice and typed free-response recall, used together so recognition and production are both tested
- A daily recommendation engine (`recommendFor` in `server.mjs`) that gates a learner's next session on due reviews, decay-triggered refreshers, stated goal, and competency thresholds (translation, recognition, argument, source reasoning) before ever assigning new material
- A source panel with a direct link to Sefaria and an explicit, repeated study-aid disclaimer: Seder supports learning, not personal halakhic ruling
- Local JSON persistence for anonymous/demo use, with write operations serialized per learner store to prevent lost updates from concurrent requests, plus an optional Supabase-backed mode for real accounts (schema, RLS policies, and setup guide in `supabase/`; see below)

## Yochai connection

The interface is deliberately built around source citation and a learning graph. The hosted Yochai MCP gateway requires an API key; this prototype therefore uses a reviewed seed lesson rather than embedding a key in browser code. `server.mjs` and `yochai-adapter.mjs` provide the server-side bridge for Yochai's `search_corpus` tool. Copy `.env.example` to your local environment and set `YOCHAI_API_KEY` before enabling it.

Retrieved material is intentionally not sent directly to learners as an automatic lesson. It should enter an editorial review flow, then be stored in a curriculum node with an explicit skill, mastery evidence, reference, and prerequisite chain, following the same shape as the reviewed content already in `data/` (see Architecture below).

## Secure learner accounts

Seder runs in local-demo mode with no credentials. To enable hosted learner accounts, set `SUPABASE_URL` and `SUPABASE_ANON_KEY` in the server environment, then open `sign-in.html`. The app uses passwordless email links; signed-in learners store their own XP, mastery, attempts, reviews, placement, and completed stages in Supabase under row-level security. Full setup and cutover checks are in `supabase/README.md`.

## Architecture and roadmap

See `docs/architecture.md` for the data model (catalog, tractate graph, labs, decay engine, evidence system, repository layer) and `docs/learning-expansion-sequence.md` for the prioritized content-build order.

## Launch materials

- `docs/launch-checklist.md` — concrete private-pilot and public-launch checks
- `docs/privacy-and-safety.md` — learner data and study-aid baseline
- `docs/accessibility.md` — keyboard, RTL, mobile, and touch requirements
- `docs/content-quality-standard.md` — internal standard for learner-facing material
- `docs/private-pilot-protocol.md` — a small, ethical pilot plan
- `docs/pilot-audience.md` — who the first pilot cohort is and why
- `docs/pilot-observation-sheet.md` — structured notes template for pilot sessions
- `docs/production-cutover.md` — steps for moving from local-demo to Supabase-backed accounts
- `docs/gemara-canon-strategy.md` — how tractates beyond Berakhot get prioritized and built
