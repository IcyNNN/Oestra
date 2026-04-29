# Oestra

An AI companion for women's hormonal health, starting with a gentle Claude-powered chat MVP.

## Getting started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Environment variables

Create `.env.local` from `.env.example` and add your Anthropic and Supabase values:

```bash
ANTHROPIC_API_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## Supabase setup

Run the SQL in `supabase/migrations/0001_initial_oestra_data.sql` in the
Supabase SQL Editor before testing signed-in persistence.

The first data boundary is intentionally simple:

- Anonymous visitors can chat, but messages are not stored.
- Signed-in users can create chat sessions and store their own messages.
- Health profile, cycle logs, and symptom logs are scoped to the signed-in user
  with Supabase Row Level Security.

## Scripts

```bash
pnpm lint
pnpm format
pnpm build
```
