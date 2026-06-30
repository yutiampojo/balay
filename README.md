# Balay

A medium & long-term residential rental marketplace for the Philippines — verified owners, monthly pricing, leases from 3 months. Built with Next.js (App Router), Prisma, and Supabase (Auth + Postgres).

## Stack
- **Next.js 15** (App Router, Server Components, Server Actions)
- **Prisma 6** ORM → **Supabase Postgres**
- **Supabase Auth** (email/password, email confirmation) — cookie sessions via `@supabase/ssr`
- Plain CSS design system in `app/globals.css`

## Local development
```bash
npm install
cp .env.example .env   # fill in your Supabase credentials
npx prisma migrate deploy   # or: npx prisma migrate dev
npm run seed                # load demo users + listings
npm run dev                 # http://localhost:3000
```

## Scripts
- `npm run dev` — dev server
- `npm run build` / `npm run start` — production build & serve
- `npm run seed` — seed demo data
- `npm run studio` — Prisma Studio (browse the DB)
- `npm run optimize-images` — regenerate web-optimized photos into `public/`

## Routes
- Public: `/` (landing), `/rentals` (search), `/rentals/[id]` (detail), `/login`, `/signup`
- Tenant: `/dashboard`, `/messages`, `/rentals/[id]/apply`
- Owner (Keyholder): `/keyholder` (verify), `/owner`, `/owner/listings/new`
- Admin: `/admin` (role-gated)
- API: `/api/listings`

## Deploy (Vercel)
1. Import this repo in Vercel.
2. Add the four env vars from `.env.example` (real values) in **Project Settings → Environment Variables**.
3. In Supabase **Authentication → URL Configuration**, set the Site URL and add `https://<your-vercel-domain>/**` to Redirect URLs.
4. Build command `npm run build` (default). Deploy.

## Notes
- Listings require admin approval (`PENDING_REVIEW` → `PUBLISHED`) before they appear publicly.
- Sensitive fields (e.g. full address) are never exposed in public queries.
- Published-listing reads are cached and invalidated on listing create/moderate.
