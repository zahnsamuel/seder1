# Isolation test — the simple, dashboard-only way

This proves that one learner cannot read or write another learner's data. You do the whole
thing in the Supabase website. No terminal, no access tokens, no running the app.

Everything below happens in **one browser tab on supabase.com**, in your project.

---

## Step 1 — Run the six migrations

1. In your project, open **SQL Editor** (left sidebar).
2. Click **New query**.
3. Open `supabase/migrations/001_learner_mastery.sql` from the repo, copy ALL of it, paste
   into the query box, and click **Run** (bottom right). You should see "Success. No rows returned."
4. Repeat, one at a time, in this exact order:
   `002_learner_state_insert_policy.sql`, `003_source_evidence.sql`, `004_delete_own_data.sql`,
   `005_learning_artifacts.sql`, `006_hosted_learning_parity.sql`.
   (Run each in its own New query. Order matters. Run each only once.)

## Step 2 — Create two test users

1. Left sidebar → **Authentication** → **Users** tab.
2. Click **Add user** → **Create new user**.
3. Email: `test-a@example.com`, pick any password, and turn **ON** "Auto Confirm User". Create.
4. Do it again for `test-b@example.com`.
5. You'll now see both users in the list. Each has a **User UID** (a long id like
   `a1b2c3d4-...`). Copy both — call them **UUID_A** and **UUID_B**. You'll paste them below.

   (Creating a user automatically creates that user's private `profiles` and `learner_state`
   rows, via a signup trigger. So each user already has data to protect — no app activity needed.)

## Step 3 — Run the isolation checks

Go back to **SQL Editor** → **New query**. Run each block below separately. Before running,
replace `UUID_A` and `UUID_B` with the two ids you copied (keep the single quotes).

### Check 1 — Learner B canNOT see Learner A's data (the real test)

```sql
begin;
  set local role authenticated;
  set local request.jwt.claims to '{"sub":"UUID_B","role":"authenticated"}';

  -- We are now pretending to be Learner B. Every count below MUST be 0.
  select 'B sees A state'    as check, count(*) as should_be_0 from public.learner_state where user_id = 'UUID_A'
  union all
  select 'B sees A attempts' as check, count(*)               from public.attempts      where user_id = 'UUID_A'
  union all
  select 'B sees A profile'  as check, count(*)               from public.profiles      where id      = 'UUID_A';
rollback;
```
**PASS = all three rows show `should_be_0` = 0.** (Learner A has a real state/profile row, but
B cannot see it.)

### Check 2 — sanity: Learner B CAN see B's own data

```sql
begin;
  set local role authenticated;
  set local request.jwt.claims to '{"sub":"UUID_B","role":"authenticated"}';

  select 'B sees own state' as check, count(*) as should_be_1 from public.learner_state where user_id = 'UUID_B';
rollback;
```
**PASS = `should_be_1` = 1.** This matters: it proves Check 1's zeros are real isolation, not a
query that just returns nothing for everyone.

### Check 3 — Learner B canNOT create data as Learner A

```sql
begin;
  set local role authenticated;
  set local request.jwt.claims to '{"sub":"UUID_B","role":"authenticated"}';

  -- B tries to forge an attempt belonging to A. This MUST fail.
  insert into public.attempts (user_id, skill_id, competency, correct)
  values ('UUID_A', 'forged', 'recognition', true);
rollback;
```
**PASS = you get a red error** containing "violates row-level security policy". That error is the
test succeeding — the database refused to let B write data attributed to A.

---

## What the result means

- All three checks pass → account isolation is verified. This is the last technical gate before
  real learners. In the repo's `supabase/README.md` cutover checklist, "RLS policy tests pass" is
  now genuinely true.
- Anything else (a count that isn't 0/1, or Check 3 succeeding instead of erroring, or a
  "permission denied for table" message) → stop and send me the exact output. Do not put real
  learner data in until it's clean.

## Common confusion

- **"permission denied for table ..."** instead of a `0` count → the migrations didn't finish or
  ran out of order. Re-run Step 1 in order on a fresh project.
- The `set local ... request.jwt.claims` line is what makes Postgres treat the query as if that
  user were signed in; that is exactly how the real app's security works, so this test mirrors
  production without needing the app or a login.
