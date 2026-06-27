# Claude Instructions

Follow `AGENTS.md` first.

This repo's current work is governed by `docs/plans/2026-06-27-001-refactor-modern-structure-plan.md`. When resuming modernization, read the Goal Capsule, Planning Contract, active Implementation Unit, Verification Contract, and Definition of Done before editing code.

Keep the Product Contract stable unless the user explicitly changes product direction. The current stack decision is TanStack Start on Cloudflare Workers, D1 persistence, and Better Auth with the documented fallback path. Cloudflare is intentionally chosen as a new platform to try; do not revert to Next.js/Vercel only because it is familiar.
