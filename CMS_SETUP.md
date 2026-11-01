# CMS Setup Guide — Portfolio Content Management System

This document describes the database-driven CMS that powers
`https://fachrur.is-a.dev`. After setup, **all portfolio content is managed
from the admin dashboard** at `https://fachrur.is-a.dev/admin` — no code
edits, no JSON files, no redeploys for content changes.

---

## 1. Architecture Overview

```
                            ┌───────────────────────────────┐
  Browser (public site) ───▶│ index.html (unchanged look)   │
  published content only    │  └ src/cms/public-content.ts  │──┐
                            └───────────────────────────────┘  │  REST (anon key,
                                                               │  RLS: published only)
                            ┌───────────────────────────────┐  │
  Browser (/admin) ────────▶│ admin/ dashboard (Vite app)   │──┤
  email+password auth       │  Supabase Auth + CRUD + media │  │
                            └───────────────────────────────┘  ▼
                                                    ┌──────────────────────┐
                                                    │ Supabase             │
                                                    │  • PostgreSQL + RLS  │
                                                    │  • Auth (admin only) │
                                                    │  • Storage (media,   │
                                                    │    documents/CV)     │
                                                    └──────────────────────┘
```

**Key design decisions**

| Concern | Solution |
|---|---|
| Public site | The existing `index.html` keeps its exact design/animations. It now loads content through `src/cms/public-content.ts`, which fetches **published** rows from Supabase and maps them to the legacy render shape (`src/cms/shape.js`). |
| Fallback | If Supabase is not configured (or unreachable), the site automatically falls back to the static `public/api/*.json` files — the site keeps working exactly as before. |
| Drafts | Enforced by **Row Level Security** at the database level: anonymous clients can never SELECT draft rows, regardless of any frontend bug. |
| Authorization | `admin_users` table gates every write policy. No public registration exists; admins are created only via `scripts/bootstrap-admin.mjs` (service role). |
| Secrets | The browser only ever receives the **anon** key (public by design). The **service-role** key is used only by local scripts and must never be committed or shipped to the frontend. |
| Media | Supabase Storage buckets `portfolio-media` (images ≤ 10 MB) and `documents` (PDF ≤ 20 MB), with server-side MIME/size policies. |
| CV button | The public "Download CV" anchors automatically point to the document marked **active** in the CV/Documents module. |

**Files added by this upgrade**

```
supabase/migrations/0001_schema.sql      # tables, indexes, triggers
supabase/migrations/0002_rls.sql         # RLS + storage buckets/policies
src/cms/shape.js                         # shared rows → legacy-shape mapper
src/cms/public-content.ts                # public-site CMS loader (no supabase-js)
admin/                                   # the /admin dashboard app
scripts/migrate-to-supabase.mjs          # one-time content import + fidelity check
scripts/bootstrap-admin.mjs              # create the first admin account
scripts/verify-cms.mjs                   # one-command live E2E verification
tests/shape.test.mjs                     # mapper unit tests (node --test)
.env.example                             # environment variable template
```

---

## 2. Supabase Project Configuration

1. Create a free account at <https://supabase.com> and create a **new project**
   (any region close to your visitors, e.g. `Southeast Asia (Singapore)`).
2. Note the **Project URL** and **anon public key** and **service_role key**
   from *Project Settings → API*.
3. **Disable public sign-ups**: *Authentication → Sign In / Providers → Email*
   → turn **off** "Allow new users to sign up". (RLS already makes random
   sign-ups useless, but this closes the door entirely.)
4. Optional hardening: *Authentication → Email* → disable "Confirm email" is
   NOT needed (the bootstrap script confirms the admin explicitly).

---

## 3. Database Setup (SQL Migrations)

Run in the Supabase **SQL Editor** (*SQL → New query*) in order:

1. Paste `supabase/migrations/0001_schema.sql` → **Run**.
2. Paste `supabase/migrations/0002_rls.sql` → **Run**.

(Or use the Supabase CLI: `supabase db push` with these files in
`supabase/migrations/`.)

This creates: `admin_users`, `content_categories`, `profiles`, `projects`,
`project_media`, `experiences`, `education`, `skills`, `organizations`,
`gallery`, `documents`, `social_links`, `site_settings`, `site_images` —
with `created_at`/`updated_at` triggers, draft/published status columns,
custom `sort_order` columns, foreign keys, and full RLS. It also creates the
`portfolio-media` and `documents` storage buckets with restricted policies.

---

## 4. Environment Variables

Copy `.env.example` → `.env` (local) and fill in:

| Variable | Where used | Purpose |
|---|---|---|
| `VITE_SUPABASE_URL` | public site + admin (build time) | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | public site + admin (build time) | Public anon key (RLS-protected) |
| `SUPABASE_URL` | local scripts | Same URL for Node scripts |
| `SUPABASE_SERVICE_ROLE_KEY` | local scripts **only** | Bypasses RLS — migration/bootstrap |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | `scripts/verify-cms.mjs` | Admin flow testing |
| `SITE_URL` | migration | Resolves relative image paths |

**Cloudflare Pages production**: *Settings → Environment variables* → add
`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` for Production (and Preview),
then redeploy. Vite inlines them at build time; the anon key is safe to expose.

---

## 5. Content Migration (preserve existing content)

The migration imports everything currently in `content/data.json`,
`content/images.json` and `CV_Muhammad_Fachrurrozy.pdf` — **without editing a
single character of the existing content** (descriptions pass through
verbatim) and **without fabricating anything**.

```bash
# 1. Dry-run: shows the plan AND runs the offline fidelity check
#    (proves the migrated data renders byte-for-byte identically)
node scripts/migrate-to-supabase.mjs

# 2. Import (safe to re-run: existing rows are never overwritten)
node scripts/migrate-to-supabase.mjs --confirm
```

The fidelity check compares the mapper output against the legacy content for
every section (hero, about, contact, education, skills, organizations,
photography, all 12 works with descriptions/tags/images/galleries). The
import refuses to run unless it passes.

Notes:
* Works with category `Community`/`Organization` become **Experience** records
  (they remain in the public Works & Experiences carousel, with their original
  titles preserved); the rest become **Projects**.
* Legacy date strings like `Duration: 2024` are year-granular; the structured
  date fields use January 1 as an internal placeholder. The public page shows
  exactly the original text.

---

## 6. First Administrator Setup

```bash
SUPABASE_URL=https://xxxx.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=eyJ... \
node scripts/bootstrap-admin.mjs you@example.com 'StrongPassword123!'
```

This creates the auth user (email confirmed) and grants the `admin` role in
`admin_users`. There is **no other way** to gain admin access — public
registration does not exist, and all write policies check `admin_users`.

Then open `https://fachrur.is-a.dev/admin` and log in.

---

## 7. Local Development

```bash
npm install
npm run dev          # Vite dev server (public site + /admin)
npm run typecheck    # TypeScript check
npm run test:cms     # CMS mapper unit tests
npm run build        # production build → dist/
npm run preview      # serve dist/ locally
```

Without Supabase env vars the public site renders the static content and
`/admin` shows a setup notice — nothing breaks.

---

## 8. Production Deployment (Cloudflare Pages)

1. Set the `VITE_*` env vars in the Cloudflare Pages project
   (`fachrur-rz`) as described in §4.
2. Build command: `npm run build` · Output directory: `dist`.
3. Deploy. The dashboard is served at `https://fachrur.is-a.dev/admin`.
4. Verify with the one-command E2E suite:

```bash
SUPABASE_URL=... SUPABASE_ANON_KEY=... ADMIN_EMAIL=... ADMIN_PASSWORD=... \
  node scripts/verify-cms.mjs
```

It checks: public reads, draft invisibility (RLS), anon write blocking,
admin login + create/publish/edit/delete round-trip, image upload, and the
public CV link.

---

## 9. Content Management Guide

**Dashboard** (`/admin`): totals (projects, experiences, organizations,
education, published/draft), recent updates, quick-create actions.

**Projects** *(the core module)*: title, slug, short + full description
(Markdown), category, status (draft/published), dates, location, role, team,
technologies/tools/skills, methodology, technical specifications, key
achievements, outcomes, thumbnail/cover images, gallery with captions + alt
text, video URL, live/GitHub/docs/publication links, related resources,
featured toggle, display priority and drag-and-drop ordering.

**Experiences / Education / Skills / Organizations / Gallery**: full CRUD with
the same draft/publish, ordering, preview and search/filter/sort tooling.
Skill categories are managed in-place (Skills → *Manage categories*); the
public site never shows proficiency numbers unless you enable them per skill.

**About & Profile**: drives the homepage hero (name, headline, typewriter
line) and About section (Markdown bio, photo, interests, expertise, location,
availability).

**Contact & Social Links**: contact heading/body/email + link list
(LinkedIn, GitHub, Instagram, website, …) with URL validation.

**CV / Documents**: upload a new PDF (≤ 20 MB), preview it, and click
**Set as active CV** — the public Download CV buttons switch automatically.

**Website Settings**: text alignment and site-wide text slots.

**Content categories** are database records (Projects/Skills/Gallery →
*Manage categories*), never hardcoded.

Editing tips:
* Long descriptions support **Markdown** with the toolbar (headings, lists,
  links, images, tables, code) and a live preview tab.
* Project descriptions can use the legacy meta format (`Role:`, `Tools:`,
  `Problem:`, `Outcome:`, `Key Learnings:` …) — the public modal renders
  these as a metadata grid and styled cards automatically.
* **Preview** shows the entry exactly as it will appear publicly before you
  publish. Drafts never appear publicly; publish toggles are instant.

---

## 10. Security Notes

* RLS is the security boundary: even with the anon key, browsers cannot read
  drafts or write anything. Do not rely on UI checks alone.
* Never expose `SUPABASE_SERVICE_ROLE_KEY` in frontend code, Git, or Pages
  env vars used at build time for the site.
* Uploads are validated client-side **and** by storage policies (MIME +
  size) server-side.
* If a key ever leaks: rotate it in *Project Settings → API*.
* Back up content: *Database → Backups*, or export tables via the SQL editor.
