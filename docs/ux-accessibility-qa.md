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

## Remaining pre-release QA

- Test screen-reader labeling with NVDA or VoiceOver on landing, language ladder, Source Reader, Daf Workbench, repair, and account controls.
- Test with a fresh learner account, not the long-running demo profile, to avoid misleading review counts.
- Test mobile Safari and Chrome device layouts after production hosting.
