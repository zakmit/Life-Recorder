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
  (D1 adapter, Google + GitHub OAuth, secure cookies). `session.ts` resolves the current
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
   mount. SSR and first paint render a neutral pending shell; anonymous-only
   data is not selected until the session lookup succeeds without a user.

## Preference authority

`PreferencesProvider` is mounted once in the root document and is the reactive
preference source for the timer and Settings page. Browser preferences live in
a versioned, schema-validated local-storage value that is read only after
mount. Signed-out edits update that local value. After login, an existing
server row replaces it; when no row exists, an atomic initialize-if-absent
operation seeds the account from the local value and returns the canonical row.
Signed-in saves are serialized, persisted to the session-owned server row
first, and copied locally only after success. Login, logout, and lookup failures
are distinct states so a failed auth request can never masquerade as anonymous.

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

## Visual identity and assets

The UI reproduces the 2019 Life Recorder look natively (no p5, no Sass):

- **Fonts** — Aileron is self-hosted under `public/fonts/Aileron/` (CC0); the app
  font stack is `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
  Aileron, sans-serif`, wired via `@font-face` + Tailwind `@theme` in
  `src/styles.css`. (The legacy app always rendered this system-sans stack; its
  NotoSerif/serif path was never applied.)
- **Watercolor spiral** — the signature visual. The 41-image Seashore PNG set is
  in `public/img/Seashore/`; `src/features/audio/themes.ts` defines `Seashore`
  (full set) and `Seashore[Blue]` (curated blue subset). `PatternCanvas`
  (`src/components/PatternCanvas.tsx`) draws the images on a spiral — a native
  canvas port of the legacy p5 `Sketch.js` ring math. Each entry's `[max, min]`
  points pick the image, ring/angle slot, and rotation. SSR renders the bare
  `<canvas>`; images load client-side only.
- **Scaling** — fluid `clamp()` scale tokens in `src/styles.css`
  (`--text-clock`, etc.) replace the legacy 900px/700px breakpoint size swaps,
  anchored to the original sizes.
- **Navigation** — `BurgerNav` (`src/components/BurgerNav.tsx`) is a native
  slide-in menu with `ProfileBlock`; `public/img/stranger.png` is the
  anonymous avatar.

## Why these choices

The framework, hosting, database, and auth decisions (and their fallbacks) are
recorded in the plan's *Resolved Planning Decisions* section
(`docs/plans/2026-06-27-001-refactor-modern-structure-plan.md`). In short:
TanStack Start + Cloudflare was chosen to keep one full-stack app on a
free-friendly platform that suits future client-heavy interaction work, with
documented fallbacks (OpenNext/Next.js, Postgres, Auth.js, Vercel) if a runtime
limit — not implementation effort — ever blocks the demo.
