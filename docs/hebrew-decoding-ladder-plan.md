# Hebrew Decoding Ladder — scoping (the pre-Layer-1 zero-start on-ramp)

Detailed scope for the **alef-bet → fluent decoding** ladder the roadmap names as the post-pilot
moat: the true 0→1 on-ramp for a learner who "reads Hebrew phonetically but lacks fluency," or who
cannot yet sound out a word at all. This is Axis B of `docs/foundation-graph-growth-plan.md`, scoped
here because it needs a **content model the current source-reasoning units do not describe.**

The point of separating it out: the foundational skill graph teaches *reading capabilities* on canon
sources. Decoding is prior to that — it is phonics, not interpretation. You cannot mark an objection
in a sugya you cannot pronounce. This ladder makes the graph reachable for the beginner.

## The learner and the goal

The target learner (from the roadmap): an adult, often insecure, no day-school/yeshiva, who may
recognize some letters but reads slowly, guesses, or stalls — especially on vowels, on look-alike
letters, and on unvocalized text (which is most of Gemara and Mishnah). **Goal:** decode a short
*vocalized* phrase fluently, then begin supplying vowels for *unvocalized* words — the threshold that
unlocks Layer 1–2 of the foundation graph.

## Architecture decision (the first fork)

Decoding does not fit the foundation graph's schema cleanly, and forcing it in erodes what makes that
schema good:

- The graph requires **≥2 `sourceContexts` in different canon genres** (torah/mishnah/gemara/…). A
  single letter or vowel is **genre-less** — it has no Sefaria ref and belongs to no genre. Meeting
  the rule would be a fiction.
- Decoding needs **audio, drilling/repetition, single-glyph display, and unvocalized reading** — a
  content type unlike the 3-option source-reasoning step `loadUnits`/`audit` assume.
- `layer` is read by `placement.js` and `path.js`; the ordering rule is "never depend on a higher
  layer." Decoding is *below* Layer 1.

**Recommendation: a parallel dataset, `data/hebrew-decoding-ladder.json`, with its own validator and
its own content type, that gates into the foundation graph.** The ladder's terminal skill ("decode a
short unvocalized phrase") becomes the prerequisite for `fnd-signal-known-words` and the Layer 1
orientation skills — expressed as a cross-dataset prerequisite or a `decodingReady` flag placement
sets. Clean separation, no schema erosion, and each dataset keeps a validator that fits it.

> **Alternative (if the team wants one graph / one placement profile):** add the ladder as **Layer 0**
> inside `foundation-skill-graph.json`. That requires three schema changes: (1) a `language` genre (or
> a `nonCanon: true` exemption from the ≥2-genre rule), (2) a declared layer `0` "Decoding," (3)
> tolerating one fat layer (~40 skills vs 4–5 elsewhere). Viable, but it bends the schema to fit an
> outlier. The doc below is written to work either way — the skills and content model are the same;
> only the container differs.

## The ladder — six bands, ~38 skills

Bands are ordered by prerequisite, not strict layer rungs (same philosophy as the foundation graph).
Hebrew inventory below is the concrete basis; exact glyph authoring happens at build time and must be
Sefaria/Unicode-verified (see the standing note about Hebrew authenticity).

### Band 0.1 — Letters (the alef-bet) · ~9 skills
- Recognize and name the 22 letters: א ב ג ד ה ו ז ח ט י כ ל מ נ ס ע פ צ ק ר ש ת (grouped ~3 skills of ~7 letters, not 22 micro-skills).
- The 5 final forms: ך ם ן ף ץ, and that they close a word.
- Look-alike discrimination (the real stall points): ב/כ, ד/ר, ה/ח/ת, ו/ז/ן, ג/נ, ס/ם, ע/צ, ט/מ.
- The dagesh sound-pairs: בּ/ב (b/v), כּ/כ (k/kh), פּ/פ (p/f).
- The שׁ/שׂ dot: shin (sh) vs sin (s).
- Silent/guttural behavior of א and ע.

### Band 0.2 — Vowels (nikud) · ~8 skills
- The five vowel sounds by family: **a** (kamatz ָ, patach ַ), **e** (tzere ֵ, segol ֶ), **i** (chirik ִ), **o** (cholam ֹ / וֹ), **u** (kubutz ֻ, shuruk וּ).
- Shva ְ — and the na/nach distinction (voiced vs silent), a classic beginner trap.
- Chataf (reduced) vowels: ֲ ֱ ֳ under the gutturals.
- Kamatz katan (the ָ that says "o") and how to spot it.
- Vowel look-alikes: tzere (two dots ֵ) vs segol (three ֶ); chirik vs a lone dot.
- Vowel position: it attaches to the consonant it follows in sound.

### Band 0.3 — Blending (consonant + vowel → syllable → word) · ~7 skills
- Open syllable (consonant + vowel): בָּ → "ba".
- Closed syllable (consonant + vowel + consonant): בַּת → "bat".
- Dagesh chazak (doubling) and its effect on blending.
- Shva inside blending (mobile vs resting).
- Mapik he (הּ) — a pronounced final ה.
- Two- and three-syllable vocalized words, left-to-right sound order (reading right-to-left).
- Furtive patach (e.g. רוּחַ → "ruach").

### Band 0.4 — Sight & function words · ~6 skills
- The prefix letters and their vowels: ה (the), ו (and), בְּ/כְּ/לְ/מִ (in/like/to/from), שֶׁ (that).
- High-frequency function words by sight: אֶת, כִּי, אֲשֶׁר, אֶל, עַל, מִן, כָּל, לֹא, אִם.
- Reading conventions for the divine names (יהוה read as *Adonai*, אֱלֹהִים) — a literacy + respect point.
- Common Aramaic particles for the Gemara bridge: דְּ, בְּ, וְ, and words like מַאי, הָכָא.
- Numbers/gematria letters as numerals (light touch).

### Band 0.5 — Vocalized fluency (transfer — reconnects to canon) · ~4 skills
This band's "sources" **are** canon: the siddur and Chumash are fully vocalized, so it bridges back
into the normal content model.
- Read a short vocalized phrase from the siddur aloud, at pace, without letter-by-letter stalling.
- Self-correct a misread word.
- Read a full vocalized pasuk (e.g., the first line of Shema).
- Read a vocalized Mishnah line.

### Band 0.6 — Into the unvocalized (handoff to Layer 1/2) · ~4 skills
The real gate to Gemara/Mishnah, which print without nikud.
- Recognize a known word without its vowels.
- Supply the likely vowels of a familiar word from context.
- Read a short **unvocalized** Mishnah phrase.
- **Graduation:** decode an unfamiliar short unvocalized phrase well enough to look up its words →
  unlocks `fnd-signal-known-words` and Layer 1 orientation.

## The content model (the crux)

Decoding is mastered by **recognition + sound + repetition**, not by one-shot source reasoning. The
model reuses what it can and adds what it must.

### Exercise types
1. **Glyph recognition (MC)** — a large single glyph on a "glyph card" (no source card / no ref);
   choose its name or sound. *Reuses course-engine MC rendering.*
2. **Sound choice (audio MC)** — hear a glyph/syllable, choose what it is (or the reverse). *Needs an
   audio asset per item.*
3. **Blend builder** — combine a shown consonant + vowel and choose the resulting syllable.
4. **Find-in-word** — highlight the target letter/vowel inside a real vocalized word.
5. **Sight-word recognition** — a whole high-frequency word → its sound/meaning.
6. **Read-aloud checkpoint (transfer)** — a vocalized phrase the learner reads aloud; v1 uses
   reveal-and-self-check (honor system) or a match-the-audio task; speech recognition is a later bet.

### Reused vs. new
- **Reuse:** course-engine MC rendering and feedback; the daily loop's **spaced review** (decoding
  items are the ideal spaced-drill payload); XP; the general step shape (prompt/answers/feedback).
- **New, and this is the real build cost:**
  - an **audio field + asset pipeline** (record or TTS; the roadmap moat already lists "real audio");
  - a **glyph-card display mode** (single large RTL glyph, no source card, no genre/ref);
  - **exemption from `sourceContexts`/`genre`** in the data model for pure-decoding items (Bands
    0.1–0.4); Bands 0.5–0.6 do carry real canon refs;
  - a **decoding-specific integrity check** — the current audit's length-bias/production/boundary
    heuristics are meaningless for letter drills. Replace with: ≥N items, every item has a correct
    sound, distractors are plausible near-glyphs (look-alikes), audio present where required;
  - a **read-aloud checkpoint** type for Band 0.5–0.6.

### Pronunciation tradition — a required commitment
Audio and "correct sound" must pick a tradition: kamatz→"a" vs "o", tav (ת) →"t" vs "s", cholam
quality all differ (Modern/Sephardi-Israeli vs Ashkenazi vs Yemenite). **Recommend Modern/Israeli
(Sephardi) as the default**, most common in adult-learning contexts, with the tradition configurable
later. This choice must be fixed before any audio is produced.

## Integration

- **Placement** gets a **6–8 item decoding screener** *before* the capability sampling. Output: a
  decoding sub-profile. If below threshold, the first recommendation is the ladder, not a `fnd-`
  skill. This is a real `placement.js` change (it already reads `layer` and foundation skills).
- **Daily loop:** decoding sessions are short and drill-dense; the 20-minute rhythm's "3-minute
  retrieve" is the perfect home for decoding review, even after graduation (durability = foundation).
- **Handoff:** ladder graduation flips `decodingReady`, which unlocks Layer 1–2. Encode as a
  cross-dataset prerequisite or a placement flag (chosen with the architecture fork above).
- **Existing assets:** `grammar.js` / `language.html` teach *grammar/reading support on real
  sources* — they sit **above** this ladder and become natural next steps after Band 0.6, not
  overlap. Reuse their look-and-feel; do not duplicate.

## Build sequencing

1. **v1 (prove the model):** Bands 0.1–0.3 (letters, vowels, blending) as MC — TTS or text-only
   phonetic choices, no recorded audio yet — plus the placement decoding screener and the glyph-card
   display + decoding integrity check. Ships a real beginner on-ramp and validates the new content
   type end to end.
2. **v2:** Bands 0.4–0.5 (sight/function words, vocalized fluency) + the audio pipeline (record the
   letter/vowel/syllable set in the chosen tradition).
3. **v3:** Band 0.6 (unvocalized handoff) + read-aloud speech verification, and wire `decodingReady`
   into placement/daily routing.

Each version is usable on its own; a learner who can do Bands 0.1–0.3 is already meaningfully ahead.

## Open decisions for Sam

1. **Container:** parallel `data/hebrew-decoding-ladder.json` (recommended) vs Layer 0 inside the
   foundation graph (needs a `language` genre + relaxed ≥2-genre rule).
2. **Audio:** recorded real audio (moat-grade, costly, needs a voice + tradition) vs TTS for v1 vs
   text-only phonetic MC for v1. Gates how far v1 can go.
3. **Read-aloud verification:** honor-system self-check (simple, ship now) vs browser speech
   recognition (richer, real UX/tech work). Determines the Band 0.5–0.6 checkpoint design.
4. **Pronunciation tradition default:** Modern/Israeli recommended; must be fixed before audio.
5. **v1 scope:** how far down the ladder before putting it in front of a beginner (recommend through
   Band 0.3).

## What I can do next on your word

- Author `data/hebrew-decoding-ladder.json` for Bands 0.1–0.3 (the ~24 v1 skills) with the full
  teaching contract, plus a validator (`scripts/check-decoding-ladder.mjs`) fitted to it.
- Or build the v1 content type (glyph-card display + one letters unit) as a vertical slice to prove
  the model before scaling to the whole ladder.
