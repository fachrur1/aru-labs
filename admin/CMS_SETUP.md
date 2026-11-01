# CMS Setup — Portfolio Admin Dashboard

The admin dashboard lives at `admin/` and is built together with the rest of the
site (`npx vite build` emits it to `dist/admin/index.html`, served at
`https://fachrur.is-a.dev/admin`). It is a plain ES-module JavaScript app using
`@supabase/supabase-js` for auth + data and `marked` for markdown preview.

## 1. Database

Run the migrations in `supabase/migrations/` **in order** using the Supabase SQL
editor or `supabase db push`:

1. `0001_schema.sql` — tables, triggers, helpers
2. `0002_rls.sql` — row level security + storage buckets/policies

## 2. Environment variables (required at build time)

Create a `.env` file in the repo root (Vite picks it up automatically):

```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

Both values are the **public** project URL and **anon** key from
Supabase → Project Settings → API.

> ⚠️ **Never** put a service-role key in these variables or anywhere in this
> codebase. The dashboard runs entirely in the browser and relies on Supabase
> Row Level Security for authorization.

If either variable is missing the dashboard renders a "CMS setup required"
notice instead of crashing.

## 3. Admin users

There is **no public registration UI**. To grant someone access, insert their
authenticated user id into the allow-list table (SQL editor or a service-role
bootstrap script):

```sql
insert into public.admin_users (user_id, role)
values ('<auth.users.id>', 'admin');
```

Also disable **Sign ups** in Supabase → Authentication → Providers → Email so
only pre-provisioned accounts can sign in.

## 4. Storage buckets

`0002_rls.sql` creates two public buckets automatically:

- `portfolio-media` — images (JPEG/PNG/WebP/GIF/AVIF, max 10 MB), stored under `media/`
- `documents` — PDFs (max 20 MB), stored under `documents/`

## 5. Using the dashboard

- Sign in at `/admin` with the email + password of an allow-listed user.
- Modules in the sidebar: Dashboard, Projects, Experiences, Education, Skills,
  Organizations, Photography/Gallery, About & Profile, Contact & Social Links,
  CV/Documents, Website Settings.
- Content rows support draft/published status, drag-and-drop ordering, search,
  filters, markdown editing with live preview, image uploads with drag & drop,
  and a public-facing preview modal.
- Draft content is never visible publicly — RLS hides drafts from anonymous
  visitors at the database level.

## 6. Local development

```
npm run dev      # dev server on :3000
npx vite build   # production build → dist/
```

The admin dashboard is hash-routed (`#/dashboard`, `#/projects`, …), so no
server-side rewrites are needed for hosting.
