# Agent Instructions

Life Recorder is a focus/Pomodoro timer that derives a non-raw "sound pattern"
from the microphone while you work and renders it as a watercolor spiral. It was
modernized from a 2019 split React/Express demo into **one full-stack SSR app**.

The modernization and the UI visual-parity pass are both **complete**. There is no
active migration in flight — treat this as a normal maintained app, not a project
mid-rewrite.

## Stack (in place, do not re-litigate)

- **TanStack Start** (React 19, SSR, Vite) on **Cloudflare Workers** — one
  deployable surface. Do not restore the old two-machine frontend/backend model,
  and do not switch to Next.js/Vercel for familiarity (Cloudflare is an
  intentional platform choice).
- **Cloudflare D1** (SQLite) via **Drizzle ORM** — schema in `src/db/schema.ts`,
  migrations in `src/db/migrations/`, repositories in `src/server/repositories/`.
- **Better Auth** (Google + GitHub OAuth, D1 sessions). Auth.js is the documented
  fallback only if a runtime limit blocks Better Auth.
- **Tailwind v4** + a small CSS layer in `src/styles.css`. No Sass, no p5.

## Commands

- `npm run dev` — local dev at http://localhost:3000
- `npm run typecheck` · `npm run lint` · `npm test` (Vitest) · `npm run build`
- `npm run db:generate` (Drizzle migrations) · `npm run db:migrate:local|remote`
- `npm run deploy` — build + `wrangler deploy`

The standard gate before considering work done: **typecheck, lint, test, build**
all green, plus an SSR smoke (`/`, `/history`, `/settings`, `/api/auth/*` return
200 with no render errors).

## Layout

```
src/
  routes/          # SSR pages + /api/auth/$ catch-all
  features/
    timer/         # timer state machine, useTimer hook, TimerPanel, format
    audio/         # Web Audio analysis, pattern extraction, themes.ts
    history/       # cards, table, queries
    charts/        # chart transforms + summary chart
    settings/      # preferences form, schema, client
  components/      # BurgerNav, ProfileBlock, PatternCanvas
  auth/            # Better Auth config, session, client, useAuthSession
  db/              # Drizzle schema, D1 client, migrations
  server/          # server functions, repositories, validation, auth guards
docs/
  brainstorms/, plans/   # requirements + implementation plans (completed)
```

## Conventions and non-obvious gotchas

- **Server/client boundary is enforced at build time.** Server-only code
  (`@tanstack/react-start/server`, `cloudflare:workers`) must live in `*.server.ts`
  or server functions — TanStack Start's import-protection plugin fails the build
  if it reaches the client bundle. `requireUser` is in `src/server/auth.server.ts`;
  the client-safe `UnauthorizedError`/`assertUser` are in `src/server/auth.ts`.
- **Session reads on the client use `useAuthSession`, not Better Auth's
  `useSession`** — the latter is not SSR-safe (it reads a store via hooks that
  throw during server render). `useAuthSession` resolves after mount.
- **Server functions own all product data access.** Each one calls `requireUser()`
  and derives ownership from the **session**, never from the payload. Validation
  schemas (`src/server/validation.ts`) intentionally carry no user id.
- **Use `.validator()` on `createServerFn`**, not the deprecated `.inputValidator()`.
- **Repositories take a `Database` instance** so tests run against an in-memory
  SQLite (`src/test/db.ts`). Don't query D1 directly from a component or route.
- **`cloudflare:workers` is stubbed in tests** via a vitest alias; don't import it
  into test-reachable client code.

## Product constraints (keep stable unless the user changes product direction)

- **Privacy posture is a hard rule:** store only processed `[max, min]` pattern
  points, never raw audio. No endpoint may accept or persist raw audio/images.
- **Anyone can run the timer**; only signed-in users persist sessions to history.
- The UI reproduces the 2019 look natively (system-sans + self-hosted Aileron, the
  watercolor spiral on canvas, the slide-in burger nav). The 2019 SCSS in
  `obsolete-2019` is the visual source of truth for the signature surfaces.
- Future client-side ML / image processing is follow-up work, not baseline
  (see `docs/future-client-ml.md`).

## Workflow

- Keep changes branch/PR friendly. Prefer `npm`.
- Commit or push only when asked; the default branch is `master`.
- Update docs when stack decisions or verification commands change.
- Do not delete or rewrite unrelated user work.
- **Do not remove the `obsolete-2019` branch** — it is the recoverable 2019
  snapshot and the source for original fonts, theme PNGs, CSS, and screenshots.

## Reference docs

- `docs/architecture.md` — layers, client/server boundary, data model, assets.
- `docs/deployment.md` — Cloudflare + D1 deploy and adding OAuth providers.
- `docs/plans/` — completed implementation plans (modernization, UI parity).
