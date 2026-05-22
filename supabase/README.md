# Supabase setup — Petra International Grants

One-time setup. Takes ~10 minutes.

> **Schema isolation.** This app puts everything in a dedicated `petra_grants` Postgres schema so it can safely share a Supabase project with other apps. You'll see a couple of extra steps below to make Supabase's API expose that schema.

## 1. Use an existing project (or create one)

If you're sharing a project: skip ahead. Otherwise:

1. Sign in at <https://app.supabase.com>.
2. **New project** → name it (anything). Pick a region close to your users.
3. Save the database password somewhere safe.

## 2. Get your project keys

**Project settings → API**. Copy:

- `Project URL` (e.g. `https://abcdefg.supabase.co`)
- `anon` public key

Paste them into [`js/config.js`](../js/config.js). The anon key is **safe to commit** — RLS enforces all access control. The `service_role` key is **never** used by the frontend; do not put it in the repo.

## 3. Expose the `petra_grants` schema to the API

**Project settings → API → "Exposed schemas"** (sometimes labelled "Data API → Exposed schemas"). It usually contains just `public`. Add `petra_grants` so it becomes `public, petra_grants`. **Save.**

Without this step, every API call returns `404` because PostgREST refuses to expose tables in schemas not on this list.

## 4. Run the SQL migrations

Open **SQL Editor → New query** in the Supabase dashboard and run each file in order:

1. [`01_schema.sql`](./01_schema.sql) — creates the `petra_grants` schema, tables, indexes, triggers, helper functions, and access grants.
2. [`02_policies.sql`](./02_policies.sql) — Row Level Security policies.
3. [`03_seed.sql`](./03_seed.sql) — faculties, programs, categories, sample grants.
4. [`04_realtime.sql`](./04_realtime.sql) — enables realtime broadcasts.

Each file is idempotent — safe to re-run.

## 5. Create the first admin

1. **Authentication → Users → Add user → Create new user**. Use your Petra email; set a temporary password. *(The new trigger created in step 4 will auto-insert a `petra_grants.profiles` row with role `viewer`.)*
2. Back in **SQL Editor**, promote them:

   ```sql
   update petra_grants.profiles set role = 'admin'
   where email = 'you@petra.ac.id';
   ```

After this user signs in via the app, they'll see the admin nav items and can manage grants. Add more admins by repeating the SQL with their email.

## 6. (Optional) Storage bucket for attachments

If you want admins to upload PDFs/docs rather than pasting URLs:

1. **Storage → New bucket → `petra-grant-attachments`** → make it **public**.
2. Add these policies (Storage → Policies → New policy on `petra-grant-attachments`):

   ```sql
   create policy "petra grants: public read" on storage.objects for select
   using (bucket_id = 'petra-grant-attachments');

   create policy "petra grants: admin write" on storage.objects for insert
   with check (bucket_id = 'petra-grant-attachments' and petra_grants.is_admin());

   create policy "petra grants: admin update" on storage.objects for update
   using (bucket_id = 'petra-grant-attachments' and petra_grants.is_admin());

   create policy "petra grants: admin delete" on storage.objects for delete
   using (bucket_id = 'petra-grant-attachments' and petra_grants.is_admin());
   ```

   (The `petra_grants.is_admin()` function lives in *our* schema, but it can be called from anywhere since the role grants in `01_schema.sql` allow `anon` and `authenticated` to execute it.)

## 7. Auth settings

**Authentication → Providers → Email**:
- Enable email/password sign-in.
- **Disable** "Confirm email" if you want admins to log in immediately after creation (you can re-enable later).

**Authentication → URL Configuration**:
- Add your deployment URL (e.g. `https://your-project.vercel.app`) to **Site URL** and the **Redirect URLs** list.
- Add `http://localhost:5173` (or whatever you serve locally) for development.

## What this app does NOT touch in your shared project

- `public.*` tables — none of our objects live in `public`.
- Existing triggers on `auth.users` — our trigger is uniquely named `on_auth_user_created_petra_grants`.
- Other apps' RLS policies — RLS is per-table, and we only enable it on our tables.
- Other Storage buckets — we use a project-unique bucket name.

The only shared resource we extend is the project-wide `supabase_realtime` publication (added our tables to it). That's safe — a publication can hold tables from many schemas without conflict.

You're done — the app should now connect.
