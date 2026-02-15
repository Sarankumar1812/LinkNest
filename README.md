# Link Nest

Smart bookmark manager built with Next.js App Router, Supabase (Auth + Postgres + Realtime), and Tailwind CSS.

## Live links

- Live URL: `https://link-nest-alpha.vercel.app`
- GitHub Repo: `https://github.com/Sarankumar1812/LinkNest`

## Features

- Google OAuth only sign-in/sign-up
- Private bookmarks per user (RLS protected)
- Create and delete bookmarks
- Realtime updates across tabs
- Structured custom API naming and error codes:
  - API example: `LNK1201CreateBookmark`
  - Error code example: `LNK120101`
- Bottom-right toast notifications with:
  - error title
  - error code
  - user-friendly explanation

## Tech stack

- Next.js 16 (App Router)
- Supabase:
  - Auth (Google OAuth)
  - Postgres
  - Realtime
- Tailwind CSS

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Add environment variables in `.env`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. Run migration SQL in Supabase SQL Editor:

`supabase/migrations/20260215013000_lnk_initial_schema.sql`

4. Configure Supabase Auth > Providers > Google:

- Enable Google provider
- Add redirect URL:
  - local: `http://localhost:3000/auth/callback`
  - prod: `https://<your-vercel-domain>/auth/callback`

5. Start app:

```bash
npm run dev
```

## Database naming convention used

- Product prefix: `LNK`
- Tables:
  - `lnk_user_table`
  - `lnk_bookmark_table`
- Example columns:
  - `lnk_ut_id`
  - `lnk_bt_id`

## API naming and error code convention

- API format: `LNK<series><ActionName>`
  - auth series: `11xx`
  - bookmark series: `12xx`
- Error code format:
  - `LNK<api_series><error_sequence>`
  - Example:
    - API: `LNK1201CreateBookmark`
    - Errors: `LNK120101`, `LNK120102`, ...

## Deploy on Vercel

1. Push repo to GitHub (public).
2. Import project in Vercel.
3. Add env vars:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. In Supabase Google provider, add Vercel callback URL.
5. Deploy and test:
   - Google login
   - bookmark add/delete
   - realtime sync in two tabs

## Problems faced and how I solved them

1. Supabase OAuth callback mismatch
- Problem: Login fails when callback URL is not exactly whitelisted.
- Fix: Added `/auth/callback` route and registered both local and production callback URLs in Supabase Google provider settings.

2. Realtime events not firing initially
- Problem: Realtime does not emit table changes unless table is in `supabase_realtime` publication.
- Fix: Added migration logic to include `lnk_bookmark_table` in realtime publication.

3. Enforcing strict privacy by user
- Problem: Client filters alone are not enough for data privacy.
- Fix: Implemented RLS policies for select/insert/delete so only `auth.uid()` owner can access bookmark records.

4. Debugging API failures quickly
- Problem: Generic errors are hard to trace.
- Fix: Added centralized `LNK` API/error registry and response format with error title, developer message, user message, and unique error code.
