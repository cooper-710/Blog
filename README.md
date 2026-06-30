# TJ Galenti Editorial Platform

A premium Next.js editorial app for TJ Galenti's personal baseball biomechanics and performance publication. Public pages use published articles only; `/admin` is a single-admin publishing dashboard backed by Supabase Auth, Postgres, and Storage.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase Auth, Database, and Storage

## Environment

Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SEQUENCE_URL=https://your-sequence-or-contact-url.com
ADMIN_ACCESS_SECRET=generate-a-long-random-secret-here
```

Generate a strong admin secret, for example:

```bash
openssl rand -hex 32
```

The public site falls back to local demo articles when Supabase env vars are missing. The admin dashboard requires Supabase and `ADMIN_ACCESS_SECRET`.

## Supabase Setup

1. Create a Supabase project.
2. Open the SQL editor and run `supabase/001_initial_schema.sql`.
3. Run `supabase/002_admin_security.sql` to block creating additional admin accounts.
4. Run `supabase/seed.sql` if you want the three placeholder articles.
5. In **Authentication → Providers → Email**, disable **Enable sign ups** after your admin account exists.
6. Promote your account to admin in Supabase SQL editor if needed:

```sql
update public.profiles
set role = 'admin'
where email = 'you@example.com';
```

The migration creates the `article-media` public storage bucket and RLS policies. Images uploaded in the admin editor are stored there and rendered via public URLs.

## Admin Access

`/admin` is hidden from the public:

- Visiting `/admin` directly returns **404**.
- Sign-up is removed from the app. Disable sign-ups in Supabase as well.
- Only your admin session, or a valid access gate, can reach the sign-in page.

### How to sign in

1. Add `ADMIN_ACCESS_SECRET` to `.env.local` (and your production env).
2. Open your private admin URL:

```bash
http://localhost:3000/admin?access=YOUR_ADMIN_ACCESS_SECRET
```

3. That sets a 30-day access cookie and redirects to `/admin`.
4. Sign in with your existing admin email and password.
5. Bookmark the private `?access=` URL for when your session or access cookie expires.

On production, use:

```bash
https://your-domain.com/admin?access=YOUR_ADMIN_ACCESS_SECRET
```

Never link to `/admin` from the public site. `/admin` is blocked in `robots.txt`.

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Admin Publishing Flow

- `/admin` requires Supabase Auth, a valid `ADMIN_ACCESS_SECRET`, and the private access URL or an active admin session.
- Only users with `profiles.role = 'admin'` can manage articles.
- Articles can be drafted, published, unpublished, featured, previewed, and deleted.
- The editor uses structured content blocks, including headings, paragraphs, rich text, images, image pairs, embeds, pull quotes, key takeaways, data callouts, stat grids, two-column sections, lists, biomech notes, CTA boxes, and references.
- `/admin/articles/[id]/preview` renders drafts through the same premium article components as the public article page.

## Content Model

Articles are stored in `public.articles`. The `content_blocks` field is `jsonb` and maps to the TypeScript union in `lib/types.ts`.

Public article pages only query `status = 'published'`. Admin users can read and write all articles through RLS policies.
