# Petra International Grants Dashboard

International grants discovery and management platform for Universitas Kristen Petra (Petra Christian University). Public users browse opportunities; administrators from the International Office manage the catalog with realtime updates pushed to every connected client.

## Stack

- **Frontend:** HTML, Tailwind CSS (CDN), vanilla JavaScript as ES modules — no build step required for local dev
- **Backend / DB / Auth / Storage / Realtime:** [Supabase](https://supabase.com) (Postgres + RLS)
- **Charts:** Chart.js · **Icons:** Lucide · **Hosting:** Vercel

## Features

| Public | Admin |
| --- | --- |
| Dashboard with KPIs and live charts | Full CRUD on grants |
| Browse / search / filter / sort grants | Upload attachments to Supabase Storage |
| Deadline calendar | Archive / restore grants |
| Faculty & program drill-down | Activity log (audit trail) |
| Grant matching by faculty/program | Realtime: changes appear on every open dashboard within seconds |
| Local bookmarks (synced when signed in) | Auto-archive of expired grants |
| Dark mode, mobile responsive | Role-gated UI (admin / viewer) |

## Architecture

```
┌─────────── browser ───────────┐         ┌────── Supabase ──────┐
│  index.html                   │  HTTPS  │  Postgres            │
│    └─ js/main.js (ES module)  │ ──────▶ │   ├─ grants          │
│         ├─ ui/      (views)   │         │   ├─ faculties       │
│         ├─ api/     (CRUD)    │ ◀────── │   ├─ programs        │
│         ├─ auth.js            │  WSS    │   ├─ categories      │
│         └─ store.js (state)   │ realtime│   ├─ activity_log    │
└───────────────────────────────┘         │   ├─ bookmarks       │
                                          │   └─ profiles + RLS  │
                                          │  Auth · Storage · Realtime │
                                          └──────────────────────┘
```

The DB is the single source of truth. The client holds a cache (`state.grants`, `state.faculties`, ...) that is hydrated on boot and patched live by realtime subscriptions, so every dashboard updates the moment an admin saves.

## Folder layout

```
.
├── index.html
├── css/style.css
├── js/
│   ├── main.js                # boot: routes, data fetch, realtime
│   ├── config.js              # Supabase URL + anon key (overwritten at build by scripts/inject-env.js)
│   ├── supabaseClient.js
│   ├── auth.js                # signIn/signOut/session/role
│   ├── store.js               # in-memory state + pub/sub
│   ├── events.js              # global event delegation
│   ├── api/
│   │   ├── grants.js          # list/get/create/update/delete/setArchived/autoArchiveExpired
│   │   ├── faculties.js
│   │   ├── categories.js
│   │   ├── activity.js
│   │   ├── bookmarks.js
│   │   ├── storage.js         # attachment upload via Supabase Storage
│   │   └── realtime.js        # postgres_changes subscription
│   └── ui/
│       ├── router.js · helpers.js · toast.js · components.js
│       ├── filters.js · charts.js · notifications.js · auth-ui.js
│       ├── grant-detail.js · grant-form.js
│       └── views/
│           ├── dashboard.js · grants.js · calendar.js · faculties.js
│           ├── matching.js · favorites.js · analytics.js · login.js
│           └── admin.js · admin-grants.js · admin-archive.js · admin-activity.js
├── supabase/
│   ├── README.md              # ⚠ Read this first
│   ├── 01_schema.sql
│   ├── 02_policies.sql
│   ├── 03_seed.sql
│   └── 04_realtime.sql
├── scripts/inject-env.js      # Build-time: writes js/config.js from Vercel env vars
├── vercel.json
└── data/database.json         # Legacy seed (no longer read at runtime)
```

## Getting started

### 1. Provision Supabase

Follow [`supabase/README.md`](supabase/README.md) — create the project, run the four SQL files in order, create an admin user.

### 2. Configure the frontend

Open [`js/config.js`](js/config.js) and paste your `SUPABASE_URL` and `SUPABASE_ANON_KEY` (from Supabase → Settings → API). The anon key is *safe to commit* — RLS enforces all access.

### 3. Run locally

Static site, no build step:

```bash
# Python
python3 -m http.server 5173

# or Node
npx serve -p 5173 .
```

Open <http://localhost:5173>. Sign in via **Admin Login** with the user you created in step 1.

> Opening `index.html` directly via `file://` won't work — ES modules and the Supabase SDK both require an `http://` origin.

### 4. Deploy to Vercel

```bash
npm i -g vercel    # one time
vercel             # link & deploy
```

Recommended: set `SUPABASE_URL` and `SUPABASE_ANON_KEY` in **Project Settings → Environment Variables** so production credentials aren't in the repo. [`vercel.json`](vercel.json) runs `scripts/inject-env.js` at build time and overwrites `js/config.js` with the env values.

Then add your Vercel URL (e.g. `https://petra-grants.vercel.app`) to Supabase → Authentication → URL Configuration → **Site URL** and **Redirect URLs**.

## Authentication model

- **Public** users (no sign-in): read-only access to grants, faculties, categories.
- **Authenticated viewers**: same as public + remote bookmarks across devices.
- **Admins**: full CRUD on grants, write to activity log, upload attachments.

Enforced server-side by Row Level Security policies (see [`supabase/02_policies.sql`](supabase/02_policies.sql)) — the `is_admin()` helper checks `profiles.role`. Promoting a user to admin is a one-line SQL update, documented in `supabase/README.md`.

## Realtime

[`js/api/realtime.js`](js/api/realtime.js) opens a single channel subscribed to `postgres_changes` on `public.grants` and `public.categories`. INSERT/UPDATE/DELETE events patch `state.grants` in place and trigger a re-render. No polling.

## Security best practices applied

- RLS on every table; default deny; explicit policies per role
- `service_role` key never used in frontend code (would bypass RLS)
- Anon key is the only key in client bundle — safe by design when RLS is in place
- Auth state stored in `localStorage` via Supabase SDK with JWT auto-refresh
- HTML escaping (`esc()` helper) on every user-supplied string before render
- Postgres trigger auto-creates a `profiles` row for new auth users
- Trigram + GIN indexes for fast text and array search
- Security headers in `vercel.json` (X-Frame-Options, Permissions-Policy, etc.)

## Future enhancements

- Magic-link / OAuth (Google for `@petra.ac.id` accounts)
- Email digest of closing-soon grants via a Supabase Edge Function + cron
- Bulk CSV import in the admin console
- Application tracking: a `grant_applications` table per student/faculty with status workflow
- Multi-language (English / Bahasa Indonesia) — i18n dictionary keyed off the existing `esc()` boundary
- Server-rendered SEO pages (would require migrating to Next.js or similar)
- Public API endpoint via a Supabase Edge Function for partner universities

---

© Universitas Kristen Petra · International Office
