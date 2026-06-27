# Agent Instructions

This repository is being modernized from a 2019 split React/Express demo into one full-stack SSR app.

## Current Planning Authority

- Active plan: `docs/plans/2026-06-27-001-refactor-modern-structure-plan.md`
- Docs index: `docs/README.md`
- Legacy snapshot branch: `obsolete-2019`
- Current planning branch: `refactor/modern-structure-planning`

Follow the active plan's Goal Capsule, Planning Contract, Implementation Units, Verification Contract, and Definition of Done. Preserve the Product Contract unless the user explicitly changes product scope.

## Modernization Defaults

- Target TanStack Start on Cloudflare Workers.
- Use Cloudflare D1 as the baseline database.
- Use Better Auth as the planning-default auth system, falling back to Auth.js only if runtime compatibility blocks the default.
- Cloudflare is an intentional learning/platform choice for this project, not only a cost optimization. Do not switch to Next.js/Vercel solely because it is more familiar.
- Keep the app as one full-stack deployable surface; do not restore the old two-machine frontend/backend deployment model.
- Preserve the microphone privacy posture: store processed pattern data, never raw audio recordings.
- Treat future client-side ML and image processing as follow-up product work, not part of the baseline modernization.

## Workflow

- Keep changes branch/MR friendly.
- Prefer `npm` unless the selected scaffold requires another package manager.
- Update docs when stack decisions or verification commands change.
- Do not delete or rewrite unrelated user work.
- Do not remove the legacy branch; use it as the recoverable 2019 snapshot.
