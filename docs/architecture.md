# Architecture

Life Recorder is one deployable full-stack app: a single Cloudflare Worker that
serves SSR pages, server functions, and auth — no separate backend process.

```
Browser ──> TanStack Start routes (SSR) ──> Server functions ──> Repositories ──> D1
   │                                              │
   │                                              └─> Better Auth session (D1)
   ├─> Web Audio analysis ─┐
   └─> PatternCanvas       └─> processed pattern points ─> createEntry server fn
```

## Layers

- **Routes (`src/routes/`)** — SSR pages plus the `/api/auth/$` catch-all that
  mounts Better Auth. Route loaders call server functions to fetch user-scoped
  data during SSR.
- **Server functions (`src/server/functions/`)** — the only write/read entry
  points for product data. Each one calls `requireUser()` first and derives
  ownership from the session, never from the payload.
- **Repositories (`src/server/repositories/`)** — thin, per-user query
  interfaces over Drizzle/D1. They take a `Database` instance so they can run
  against a real in-memory SQLite database in tests. This is the seam that lets
  D1 be swapped for Postgres without touching feature code.
- **Auth (`src/auth/`)** — `config.ts` builds a per-request Better Auth instance
  (D1 adapter, GitHub OAuth, secure cookies). `session.ts` resolves the current
  user from request headers (server-only). `useAuthSession.ts` is the SSR-safe
  client hook.
- **Database (`src/db/`)** — Drizzle schema, the D1 client factory, and
  generated SQL migrations.

## Client / server boundary

Browser-only APIs (microphone, `AudioContext`, canvas, timers) are confined to
client modules and only touched inside effects/handlers, so SSR never reaches
`window`, `navigator`, or `AudioContext`. Two boundaries are enforced
explicitly:

1. **Server-only code** (`@tanstack/react-start/server`, `cloudflare:workers`)
   lives in `*.server.ts` files and server functions. TanStack Start's
   import-protection plugin fails the build if such an import reaches the client
   bundle — which is why `requireUser` lives in `auth.server.ts` while the
   client-safe `UnauthorizedError`/`assertUser` live in `auth.ts`.
2. **Better Auth's `useSession`** reads a store via hooks that are not safe in
   SSR, so the app uses `useAuthSession()` which resolves the session only after
   mount. SSR (and first paint) render the anonymous shell, then hydrate.

## Data model

| Table         | Purpose                                                              |
| ------------- | ------------------------------------------------------------------- |
| `user`        | Better Auth identity (id, name, email, image)                       |
| `session`     | Better Auth sessions                                                |
| `account`     | OAuth provider links                                                |
| `verification`| Better Auth verification tokens                                     |
| `preferences` | Per-user theme, Pomodoro minutes, show-hours (1 row per user)       |
| `entries`     | Timer records: title, start/end, elapse, Pomodoro flag, pattern JSON|

`entries.pattern` is JSON-encoded `[max, min]` integer pairs — processed signal
data only. No column stores raw audio.

## Why these choices

The framework, hosting, database, and auth decisions (and their fallbacks) are
recorded in the plan's *Resolved Planning Decisions* section
(`docs/plans/2026-06-27-001-refactor-modern-structure-plan.md`). In short:
TanStack Start + Cloudflare was chosen to keep one full-stack app on a
free-friendly platform that suits future client-heavy interaction work, with
documented fallbacks (OpenNext/Next.js, Postgres, Auth.js, Vercel) if a runtime
limit — not implementation effort — ever blocks the demo.
