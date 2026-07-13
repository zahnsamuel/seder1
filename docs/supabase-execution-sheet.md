# Supabase execution sheet

Use this only after the Supabase SQL editor accepts input again. It contains no credentials and does not replace `supabase/README.md`.

## One operator, one ordered session

1. Confirm the intended project ID in the Supabase dashboard.
2. In SQL Editor, make one query per migration, in this exact order: `001_learner_mastery.sql` through `005_learning_artifacts.sql`.
3. After each successful query, record its filename and timestamp below. Stop on an error; do not skip ahead.
4. Configure only `SUPABASE_URL` and `SUPABASE_ANON_KEY` in the deployment environment. Never paste a service-role key into the browser, client files, or this sheet.
5. Configure Auth redirect URLs, restart the app, and check `/api/health`.
6. Perform all eight account-isolation checks in `supabase/README.md` using two real test accounts. Record actual results; a successful migration is not proof of isolation.

| Migration / verification | Timestamp | Operator | Result / error |
|---|---|---|---|
| 001 learner mastery |  |  |  |
| 002 insert policy |  |  |  |
| 003 source evidence |  |  |  |
| 004 delete own data |  |  |  |
| 005 learning artifacts |  |  |  |
| Auth redirects configured |  |  |  |
| `/api/health` is `supabase-ready` |  |  |  |
| Cross-account reads are empty |  |  |  |
| Cross-account write is rejected |  |  |  |
| App-layer cross-account request is rejected |  |  |  |

Do not invite a real learner until every row relevant to persistence and account isolation has an observed successful result.
