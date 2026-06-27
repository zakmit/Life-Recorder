# Future: client-side ML and richer interactions

This rebuild deliberately stops at identity-preserving modernization. Audio
classification, image processing, model downloads, and new interaction designs
were **out of scope** and should be treated as follow-up product work.

This note records how to add that work later without regressing the baseline.

## Stay inside the client boundary

All ML/signal work belongs on the client, behind the same boundary the timer and
audio code already use:

- Keep model loading, inference, `AudioContext`, `WebGL`/`WebGPU`, and canvas
  work in client modules under `src/features/<area>/`, touched only in effects
  and event handlers.
- Never import browser-only or model code into route components at module top
  level — it must not run during SSR. Mirror the existing `audio/` modules,
  which guard every API behind a capability check.
- If a feature needs server-only code, put it in a `*.server.ts` file or a
  server function. The import-protection build step will catch leaks.

## Reuse the existing seams

- **Pattern data** already flows browser → `createEntry` server function → D1 as
  processed points. Richer derived features should follow the same path:
  compute on the client, persist only processed/derived data.
- **Repositories** isolate storage. New derived fields or tables should be added
  to `src/db/schema.ts` with a migration and exposed through a repository, not
  by querying D1 from a component.
- **Privacy posture is a hard constraint.** Keep storing only processed data.
  Do not add an endpoint that accepts or stores raw audio or images.

## When to split into a new repository

Keep this repo as the Life Recorder baseline. Start a **new** repository only if
the ML concept becomes a *different product* rather than an enhancement to the
timer / sound-pattern / history identity — e.g. if the timer stops being the
core and the app reorganizes around a model-first experience. Until then,
additive experiments belong here, behind feature flags or new routes, so the
deployable baseline keeps working.
