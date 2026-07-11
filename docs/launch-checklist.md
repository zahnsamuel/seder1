# Seder launch checklist

## Before a private pilot

- Set `SUPABASE_URL` and `SUPABASE_ANON_KEY` in the hosting environment. Never set them in browser source or commit a `.env` file.
- In Supabase Auth, enable email magic links and add the deployed HTTPS domain plus `http://127.0.0.1:4180` as redirect URLs.
- Run the migrations in `supabase/migrations/`, in order through `004_delete_own_data.sql`.
- Create two test accounts. Confirm account A cannot retrieve account B's profile, XP, attempts, reviews, placement, or sessions.
- Complete placement, one study question, and one lab line as account A. Reload and confirm progress persists.

## Pilot success measures

- A learner can reach the first working Daf without help.
- Every question has its source text and translation available in the same learning space.
- A learner can always see the next action after answering.
- Review items return at the scheduled interval and a learner understands why.

## Before public launch

- Configure HTTPS and a production domain.
- ~~Publish privacy, terms, learner-data deletion, and support-contact pages.~~ Done: `privacy.html`, `terms.html`, `support.html`, plus self-serve export/delete on `profile.html`. Before real users see them: replace the placeholder support email in `support.html` with a real monitored address, and have a person (not just Claude) read all three for tone and accuracy.
- Test keyboard-only navigation, mobile widths, and screen-reader labels.
- Establish backup, incident response, and content-quality review processes.
