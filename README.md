# Life Recorder

Record focused time, derive a non-raw audio "pattern" from your surroundings
while you work, and review your sessions through cards, a table, and charts.

This is the modernized rebuild of the original 2019 Create React App + Express
demo. It is now **one full-stack SSR application** built with
[TanStack Start](https://tanstack.com/start) on
[Cloudflare Workers](https://developers.cloudflare.com/workers/), with
[Cloudflare D1](https://developers.cloudflare.com/d1/) for storage and
[Better Auth](https://www.better-auth.com/) for server-owned sessions.

> The original 2019 codebase is preserved on the **`obsolete-2019`** branch.

## What it does

- **Timer / Pomodoro** — count up, or count down a Pomodoro; your preferred
  length and clock format are saved per account.
- **Sound pattern capture** — while recording, the browser samples the
  microphone and stores only a small derived pattern (`[max, min]` index pairs).
  **Raw audio is never stored or transmitted.**
- **History** — review past sessions as cards (with the pattern preview), a
  table, or a per-day time chart.
- **Accounts** — sign in with GitHub; your preferences and records are scoped to
  your account.

## Tech stack

| Concern    | Choice                                   |
| ---------- | ---------------------------------------- |
| Framework  | TanStack Start (React 19, SSR, Vite)     |
| Hosting    | Cloudflare Workers                       |
| Database   | Cloudflare D1 (SQLite) via Drizzle ORM   |
| Auth       | Better Auth (GitHub OAuth, D1 sessions)  |
| Styling    | Tailwind CSS v4                          |
| Tests      | Vitest + Testing Library                 |

See [`docs/architecture.md`](docs/architecture.md) for how the pieces fit
together and why these choices were made.

## Getting started

```bash
npm install

# Local secrets — copy and fill in (GitHub OAuth + a random auth secret):
cp .dev.vars.example .dev.vars

# Set up the local D1 database:
npm run db:generate        # generate SQL from the Drizzle schema (only after schema changes)
npm run db:migrate:local   # apply migrations to the local D1

npm run dev                # http://localhost:3000
```

For a GitHub OAuth app, set the callback URL to
`http://localhost:3000/api/auth/callback/github`. Full setup and production
deployment are documented in [`docs/deployment.md`](docs/deployment.md).

## Project layout

```
src/
  routes/            # SSR pages and the /api/auth/$ catch-all
  features/
    timer/           # timer state machine, hook, panel, formatting
    audio/           # Web Audio analysis, permissions, pattern extraction
    history/         # cards, table, queries
    charts/          # chart transforms and summary chart
    settings/        # preferences form, schema, client
  components/         # reusable UI (AppNav, PatternCanvas)
  auth/              # Better Auth config, session, client, SSR-safe hook
  db/                # Drizzle schema, D1 client, migrations
  server/            # server functions, repositories, validation, auth guards
```

## Scripts

| Script                 | Purpose                                  |
| ---------------------- | ---------------------------------------- |
| `npm run dev`          | Local dev server                         |
| `npm run build`        | Production build                         |
| `npm test`             | Run the Vitest suite                     |
| `npm run typecheck`    | `tsc --noEmit`                           |
| `npm run lint`         | ESLint                                   |
| `npm run db:generate`  | Generate Drizzle migrations              |
| `npm run db:migrate:*` | Apply migrations (`:local` / `:remote`)  |
| `npm run deploy`       | Build and deploy to Cloudflare           |

## Privacy posture

The microphone is used only to derive a tiny pattern signature per sample
window. The app stores and transmits **only** those processed pattern points —
no raw audio buffers, files, or recordings exist anywhere in the data path.

## Future direction

This repository remains the Life Recorder baseline. Client-side ML and richer
signal/image interactions are intentionally **out of scope** for this rebuild;
see [`docs/future-client-ml.md`](docs/future-client-ml.md) for how to add them
without breaking SSR, and when a separate repository would make sense instead.
