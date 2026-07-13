# Seder content sophistication standard

Every content unit (arc, unit, lab, course) is held to six scored dimensions.
`node scripts/audit-content.mjs` (run from repo root) scores all of them, 0–10;
re-run after any content change. Current corpus: 91 units.

## The six dimensions

1. **Depth** — 8+ steps for units/arcs (2pts; 6–7 steps 1pt). Labs are grandfathered at
   3 steps until upgraded (Wave 3 below).
2. **Production, not just recognition** — at least one typed recall step (or a
   production gate, for courses) whose target is Hebrew the unit itself taught (2pts).
3. **No length-bias exploit** — the correct answer must not be reliably the longest
   option by >1.5× the shortest distractor. Scored proportionally (3pts). The fix is
   never padding the correct answer: it is making distractors substantive near-misses
   that diagnose a specific misreading.
4. **Feedback teaches** — every step's feedback ≥25 chars and says *why*, not just
   "correct" (1pt).
5. **Boundary steps where the subject is lived** — practical halakha, mourning, family,
   inner-life topics carry an explicit RESPONSIBLE LEARNING step separating study from
   personal guidance (1pt when required).
6. **No duplicate answer options** (1pt).

Plus two unscored requirements enforced elsewhere: shuffled rendering (engine-level,
tested) and verified citations (WebSearch/Sefaria before shipping; Sefaria deep links
render automatically for unambiguous refs).

## Upgrade waves (state as of 2026-07-13)

- **Wave 1 — typed checks for the 18 zero-production units.** First arcs + Berakhot
  chain. Each new typed step targets the unit's own anchor Hebrew.
- **Wave 2 — distractor sophistication.** Rewrite short/strawman distractors into
  plausible near-misses, unit by unit, highest-traffic first (Berakhot chain, first
  arcs, canon courses, then deepening units). This simultaneously retires the
  length-bias exploit. Roughly 500 questions; batch and verify live.
- **Wave 3 — lab deepening.** 27 labs from 3 steps to 6+: add a second source moment,
  a typed recall, and boundary steps where the tractate needs one (Sotah, Niddah).

Definition of done for any unit: audit score ≥ 8, live end-to-end run clean, citations
verified, logged in docs/qa-intake.md.
