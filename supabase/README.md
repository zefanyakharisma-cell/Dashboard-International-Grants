# Supabase setup — Petra International Grants

One-time setup. Takes ~10 minutes.

## 1. Create the project

1. Sign in at <https://app.supabase.com>.
2. **New project** → name it `petra-international-grants`. Pick a region close to your users (Singapore for SEA).
3. Save the **database password** somewhere safe (you'll only need it for direct SQL/pgAdmin access).

## 2. Get your project keys

Project settings → **API**. Copy:

- `Project URL` (e.g. `https://abcdefg.supabase.co`)
- `anon` public key (long JWT string)

Paste them into [`js/config.js`](../js/config.js). The anon key is **safe to commit** — RLS policies (set in step 3) enforce all access control. The `service_role` key is **never** used by the frontend; do not put it in the repo.

## 3. Run the SQL migrations

Open **SQL Editor → New query** in the Supabase dashboard and run each file in order:

1. [`01_schema.sql`](./01_schema.sql) — tables, indexes, triggers, helper functions.
2. [`02_policies.sql`](./02_policies.sql) — Row Level Security policies.
3. [`03_seed.sql`](./03_seed.sql) — faculties, programs, categories, sample grants.
4. [`04_realtime.sql`](./04_realtime.sql) — enables realtime broadcasts.

Each file is idempotent — safe to re-run.

## 4. Create the first admin

1. **Authentication → Users → Add user → Create new user**. Use your Petra email; set a temporary password.
2. Back in **SQL Editor**, promote them:

   ```sql
   update public.profiles set role = 'admin'
   where email = 'you@petra.ac.id';
   ```

After this user signs in via the app, they'll see the admin nav items and can manage grants. Add more admins by repeating the SQL with their email.

## 5. (Optional) Storage bucket for attachments

If you want admins to upload PDFs/docs rather than pasting URLs:

1. **Storage → New bucket → `grant-attachments`** → make it **public**.
2. Add this policy (Storage → Policies → New policy on `grant-attachments`):

   ```sql
   create policy "public read" on storage.objects for select
   using (bucket_id = 'grant-attachments');

   create policy "admin write" on storage.objects for insert
   with check (bucket_id = 'grant-attachments' and public.is_admin());

   create policy "admin update" on storage.objects for update
   using (bucket_id = 'grant-attachments' and public.is_admin());

   create policy "admin delete" on storage.objects for delete
   using (bucket_id = 'grant-attachments' and public.is_admin());
   ```

## 6. Auth settings

**Authentication → Providers → Email**:
- Enable email/password sign-in.
- **Disable** "Confirm email" if you want admins to log in immediately after creation (you can re-enable later).

**Authentication → URL Configuration**:
- Add your deployment URL (e.g. `https://your-project.vercel.app`) to **Site URL** and the **Redirect URLs** list.
- Add `http://localhost:5173` (or whatever you serve locally) for development.

You're done — the app should now connect.
