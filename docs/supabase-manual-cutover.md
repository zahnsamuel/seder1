# Seder: live Supabase cutover

This is the short, safe route for moving Seder from browser-only demo progress to secure learner accounts and hosted progress.

## 1. Run the schema scripts

Open the **SQL Editor** for the `seder` Supabase project. Create a fresh query for each script below; paste the complete file, click **Run**, and wait for the green success notice before moving to the next one.

1. `supabase/migrations/001_learner_mastery.sql`
2. `supabase/migrations/002_learner_state_insert_policy.sql`
3. `supabase/migrations/003_source_evidence.sql`
4. `supabase/migrations/004_delete_own_data.sql`
5. `supabase/migrations/005_learning_artifacts.sql`
6. `supabase/migrations/006_hosted_learning_parity.sql`

The first script may display a warning because it replaces Seder's signup trigger. That is expected for a new Seder project. Do **not** run a pasted script if the editor visibly rearranges or truncates it—open a new browser window or paste directly with the keyboard instead.

## 2. Verify the schema

Run this read-only query in a new SQL Editor tab:

```sql
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in (
    'profiles', 'learner_state', 'attempts', 'review_items',
    'placement_results', 'daily_sessions', 'source_evidence'
  )
order by table_name;
```

It should return all seven tables. Then check the learner artifacts column:

```sql
select column_name
from information_schema.columns
where table_schema = 'public'
  and table_name = 'learner_state'
  and column_name = 'artifacts';
```

## 3. Connect Seder without exposing secrets

In Supabase, open **Project Settings → API** and copy:

- Project URL
- `anon` / public API key

Set them only in the environment that runs `server.mjs`:

```text
SUPABASE_URL=https://bdgxzhgbisxltgtljmdy.supabase.co
SUPABASE_ANON_KEY=your-anon-public-key
```

Never place a service-role key in a browser file, HTML page, or git repository.

## 4. Configure sign-in redirects

In **Authentication → URL Configuration**, set the site URL and add the exact URL where Seder is served. For local testing, add the active local address (for example `http://127.0.0.1:4180`). Add the final production domain once it exists.

## 5. Acceptance check

Restart Seder with those two environment variables. Visit `/api/health`; it must report:

```json
{ "persistence": "supabase-ready" }
```

Then use two test email accounts to verify magic-link sign-in, saved XP/mastery, a submitted answer, a saved Daf note, a review item, and account data export/deletion.
