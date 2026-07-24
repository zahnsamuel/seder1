# Learner UX and accessibility QA

## Completed rendered checks

- Landing page rendered with Today’s Study, My Journey, Gemara, Courses, Study Record, onboarding, and an unlocked journey state.
- Study Record rendered at a 390px phone-width viewport with readable cards, visible navigation, and no inaccessible hover-only control needed for the primary information.
- Source Reader already exposes visible translation and focus controls; Daf Workbench has visible role controls and source-map feedback.

## Product-wide safeguards

- Global visible keyboard focus style is injected on Seder pages.
- Mobile touch targets for primary study controls are at least 44px where the shared study styling applies.
- Hebrew source lines carry `lang="he"` and `dir="rtl"` in reader and workbench experiences.
- Translation is available through visible buttons rather than hover-only behavior.

## Programmatic audit pass — 2026-07-17 (Claude)

Drove the pilot path (sign-in → landing → daily-router → lab → arc) in-browser and measured
the DOM directly. Results:

- **Keyboard:** answer/daf controls are real `<button type="button">` (operable, `tabindex 0`);
  zero non-focusable click handlers (no keyboard traps); strong `:focus-visible` indicator
  (3px amber outline, injected from `seder-auth.js`); sign-in inputs are labeled.
- **Reflow / mobile:** no horizontal overflow at 320px on landing, lab, or sign-in; no
  sub-24px tap targets; viewport meta present on all pages; no overflow at 640px (≈200% zoom).
- **Hebrew / RTL:** Hebrew source lines compute `direction: rtl`, right-aligned.

### Fixes shipped in this pass

- **Skip-to-content link (WCAG 2.4.1)** injected as the first focusable element from
  `seder-auth.js` (`Seder.applySkipLink`), giving `<main>` an id + `tabindex="-1"` target.
  Covers the 192 pages that load `seder-auth.js` (the whole learner path). The 13 pages
  without it (privacy/terms/support, analytics, some maps) do **not** yet get the skip link.
- **Lab daf-lines now carry `lang="he"`.** They previously buried the Hebrew inside an
  English `aria-label` ("Study line N: <hebrew>"), which screen readers pronounce with
  English phonetics. Now the English position is an `.sr-only` span and the Hebrew is a
  `span[lang="he"][dir="rtl"]`, so the source line is announced as Hebrew. (`lab.js`)
- **`civil-reasoning.html`** `#hebrew` element was the one course page missing `lang="he"`; added.

## Color-contrast pass (WCAG 1.4.3) — 2026-07-24 (Claude)

The 2026-07-17 pass verified keyboard, reflow, RTL, and labels but **not color contrast**.
Measured computed foreground/background ratios in-browser across the core funnel and fixed every
text element below AA (4.5:1 normal, 3:1 large). Two systemic offenders, repeated in each page's
own stylesheet: small-caps **gold eyebrow labels** (`#b88028`/`#b98a39`, ~2.8–3.4:1) and borderline
**muted body text** (`#657078`/`#657080`, ~4.4:1). Darkened each token to clear ≥4.6:1, preserving
hue. Also fixed a regression from the My Path simplification: the "Start review" button rendered
teal-on-navy (1.9:1) because `.review-card a` overrode `.primary`'s white — forced white text
(now 11.8:1).

Verified **0 contrast failures** on all six core surfaces: `seder`, `sign-in`, `placement`,
`daily-router`, `academy-session`, `path`. Files: path.css, seder.css, onboarding.css,
placement.css, canon-labs.css, sign-in.html.

**Not yet swept:** content pages driven by `deep-course.css` (labs/arcs) carry the same gold/muted
tokens and likely fail — a follow-up (larger blast radius, out of this pass's core-funnel scope).

## Remaining pre-release QA

- Test screen-reader labeling with NVDA or VoiceOver on landing, language ladder, Source Reader, Daf Workbench, repair, and account controls. (The 2026-07-17 pass verified structure/labels programmatically; real AT speech output still wants a human check.)
- Add the skip link + `lang="he"` review to the 13 pages that do not load `seder-auth.js`.
- Test with a fresh learner account, not the long-running demo profile, to avoid misleading review counts.
- Test mobile Safari and Chrome device layouts after production hosting.
