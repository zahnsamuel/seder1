# Pilot readiness status

## Ready locally

- Placement, journey, course arcs, Daf Workbench, Notebook, retrieval, remediation, and independent checkpoints are available in local-demo mode.
- Flagship Gemara arcs now culminate in a tractate-specific Daf Workbench.
- Automated learner-state, curriculum-integrity, phase-gate, and course-to-workbench tests run locally.
- Pilot guide and privacy-oriented learning materials exist.

## Required before inviting external learners

1. ~~Apply Claude’s source and pedagogy QA corrections.~~ Done (2026-07-11) -- see `docs/qa-intake.md`. All 4 citation fixes, 11 Berakhot distractor rewrites, and the Eruvin/Tefillah boundary-language steps are applied and committed (`70871c6`).
2. Configure Supabase credentials, migrations, email sign-in redirects, and real hosted learner accounts.
3. Test account isolation with two real test users.
4. Run mobile and keyboard-only visual checks in the intended browser.
5. Set a production support contact and deployment domain.
6. Commit the current changes and correct the GitHub remote.

## Current decision

Seder is appropriate for an internal demonstration or closely supervised local walkthrough. It is not yet ready for an unsupervised external pilot until the six requirements above are complete.
