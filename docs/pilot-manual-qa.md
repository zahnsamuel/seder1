# Seder manual pilot QA

Run this checklist against the deployed HTTPS URL before inviting learners. It covers the checks automation cannot reliably judge: keyboard flow, responsive reading, Hebrew/RTL, and trust-page tone.

## 1. Fresh learner flow

Use a private browser window and open `/sign-in.html` (hosted) or `/placement.html` (local development).

- Complete placement without typing any response.
- Confirm the starting profile explains the result and has one obvious **Continue to My Path** action.
- Confirm My Path shows one active milestone and a clear **Today** action.
- Complete one Berakhot source question and confirm the next action remains visible after answering.
- Reload and confirm the learner record and XP remain coherent.

## 2. Keyboard-only pass

With the mouse untouched, press `Tab` through `/seder.html`, `/placement.html`, `/path.html`, `/daily-router.html`, and one Daf workbench.

- Every interactive control receives a visible focus ring.
- Focus order follows the reading order; no control is skipped.
- `Enter` or `Space` activates the focused answer/action.
- A learner can reach the next step without needing a pointer.

## 3. Responsive and reading pass

Check 320px wide, 375px wide, and desktop width; repeat once at 200% browser zoom.

- No horizontal scrolling.
- Hebrew remains readable and right-to-left.
- Daf/source text and translation are visible together.
- Continue/next actions remain reachable without hunting.
- The six My Path milestones remain understandable on a narrow screen.

## 4. Trust and boundary pass

Read `/privacy.html`, `/terms.html`, and `/support.html` as a first-time learner.

- Data export/delete language matches the controls on Profile.
- The pages do not imply Seder gives halakhic rulings or pastoral advice.
- The support address is monitored and the response-time language is honest.
- Sensitive lessons show their responsible-learning boundary before practice.

Record failures in `docs/qa-intake.md` with the URL, viewport, browser, and exact learner-visible behavior.
