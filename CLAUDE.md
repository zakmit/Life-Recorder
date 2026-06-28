# Claude Instructions

Follow `AGENTS.md` first — it carries the stack, commands, layout, conventions,
and product constraints for this repo.

Life Recorder is a finished full-stack SSR app (TanStack Start on Cloudflare
Workers, D1 + Drizzle, Better Auth). The 2019→modern migration and the UI
visual-parity pass are both complete; there is no rewrite in flight. Completed
plans live in `docs/plans/`; reference docs are `docs/architecture.md` and
`docs/deployment.md`.

Before editing, note the two boundaries that bite most often (full list in
`AGENTS.md`): server-only code must stay in `*.server.ts`/server functions (the
build enforces this), and client session reads use `useAuthSession`, not Better
Auth's SSR-unsafe `useSession`. Keep the privacy posture intact — store only
processed pattern data, never raw audio. Run typecheck/lint/test/build before
calling work done.

Keep the Product Contract and the Cloudflare/D1/Better Auth stack stable unless
the user explicitly changes product direction.
