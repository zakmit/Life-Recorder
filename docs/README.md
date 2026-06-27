# Life Recorder Docs

Life Recorder is the modernized full-stack rebuild of the original 2019 split
React/Express demo. It now runs as one TanStack Start app on Cloudflare Workers
with D1 storage and Better Auth sessions.

## Index

- [`architecture.md`](architecture.md) — layers, client/server boundary, data model, and why the stack was chosen.
- [`deployment.md`](deployment.md) — Cloudflare Workers + D1 deployment and the manual deployed smoke test.
- [`future-client-ml.md`](future-client-ml.md) — how to add client-side ML/interaction work later without breaking SSR.
- [`plans/2026-06-27-001-refactor-modern-structure-plan.md`](plans/2026-06-27-001-refactor-modern-structure-plan.md) — the implementation-ready plan this rebuild followed.

## Branches

- **`obsolete-2019`** — the legacy 2019 snapshot (CRA + Express + Firebase +
  Mongoose + Heroku). Kept as the recoverable original; the active branch no
  longer contains the split `frontend/` and `backend/` apps.

Root [`AGENTS.md`](../AGENTS.md) and [`CLAUDE.md`](../CLAUDE.md) point future
agent sessions at the plan and the modernization defaults.
