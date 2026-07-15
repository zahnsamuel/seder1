# Friday demo deployment

This is a public **presentation demo**, not a learner pilot. Without Supabase, the app
uses a shared local-demo learner record and the host's disk may be ephemeral. Do not use
it to collect participant accounts, personal information, or real learner progress.

## Deploy with Render

1. Sign in to [Render](https://render.com/) using the GitHub account that owns `seder1`.
2. Choose **New +** then **Blueprint** and select `zahnsamuel/seder1`.
3. Render will find `render.yaml`. Approve the proposed `seder-demo` web service. If the
   name is unavailable, choose a unique name such as `seder-sam-demo`.
4. Leave secrets blank for the Friday demo. In particular, do not add Yochai keys to a
   public demonstration unless you intend to pay for and monitor their use.
5. Click **Apply**. When the health check passes, Render displays a URL such as
   `https://seder-sam-demo.onrender.com`.
6. Open `/api/health` at that URL. It should report `status: ok` and `persistence:
   local-development`. Then open the root URL and click through placement, Today, Academy,
   and a Gemara source before the presentation.

## After Friday

Before inviting any actual learners, finish the Supabase migrations and account-isolation
runbook in `supabase/README.md`, set `SUPABASE_URL` and `SUPABASE_ANON_KEY` on the Render
service, and repeat the sign-in and persistence checks. The public demo link is not a
substitute for that cutover.
