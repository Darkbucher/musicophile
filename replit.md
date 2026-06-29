# Musicophile

A social music-sharing web app built with TanStack Start, React, Supabase, and Tailwind CSS. Users connect via invite codes, search for songs (via iTunes API), and send them to friends with a personal note and YouTube video.

## Stack

- **Frontend/SSR**: TanStack Start (React 19), Tailwind CSS v4
- **Backend**: Supabase (Postgres + RLS + Realtime), TanStack server functions (Nitro)
- **Package manager**: Bun
- **Build tool**: Vite (via `@lovable.dev/vite-tanstack-config`)

## Run

```bash
bun run dev
```

## Key routes

- `/auth` — sign in / sign up
- `/` — inbox (received songs)
- `/sent` — sent songs archive
- `/friends` — manage connections via invite codes
- `/friends/$friendId` — song thread between two users (includes Composer)
- `/gift/$id` — envelope reveal + song detail page
- `/settings` — profile, avatar, theme

## Architecture notes

- All authenticated routes live under `src/routes/_authenticated/`. The layout route (`route.tsx`) enforces auth via `beforeLoad` and provides real-time unread counts.
- Server functions (e.g. YouTube search) live in `*.functions.ts` files and must use `requireSupabaseAuth` middleware to prevent unauthenticated API key abuse.
- Supabase RLS covers all tables: gifts, friendships, profiles, invite_codes.
- Theme system in `src/lib/theme.tsx` — six themes (Parchment, Midnight, Liquid, Flower, Retro, Forest) stored in localStorage.

## User preferences

- Keep the intentional, quiet aesthetic — no algorithmic feeds, no noise.
