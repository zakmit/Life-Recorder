---
title: UI Visual Parity with the 2019 Life Recorder - Requirements
date: 2026-06-27
status: ready-for-planning
topic: ui-visual-parity
---

# UI Visual Parity with the 2019 Life Recorder — Requirements

## Summary

The modernization rebuild preserved product behavior but shipped a generic
Tailwind UI that does not resemble the original Life Recorder. This work restores
the original visual identity across **every** surface so the app looks and feels
like the 2019 app. It is a **technology refactor of the interface, not a UX/UI
redesign**: the original UI/UX is the specification; the TanStack Start + React 19
+ Tailwind v4 + canvas stack is purely the new implementation.

All original assets — fonts, the 47 watercolor theme PNGs, theme JSON, and the
full legacy CSS/SCSS as reference — are recoverable from the `obsolete-2019`
branch. Nothing needs to be recreated from scratch.

## Problem Frame

The current UI (e.g. `src/routes/index.tsx`, `src/features/timer/TimerPanel.tsx`,
`src/components/AppNav.tsx`, `src/components/PatternCanvas.tsx`) uses default
Tailwind styling: sans-serif text, a plain top nav, and an abstract colored-dot
pattern instead of the signature watercolor spiral. A user who knew the 2019 app
would not recognize this as the same product.

The original identity is specific and intentional:

- Thin-stroke **serif numerals** for the clock (NotoSerif / display serif).
- A full-viewport **spiral of watercolor PNGs** (seashells, starfish, jellyfish)
  as the background, themed (Seashore / Seashore[Blue]).
- A **slide-in burger menu** with profile block and links, not a top bar.
- A yellow (Timer) / red (Pomodoro) **Start bar** and a Timer/Pomodoro toggle.
- Translucent white panels for Settings and Statistics.

## Key Decisions

- **Parity bar: faithful look-and-feel, rebuilt natively.** A user should not be
  able to tell the underlying stack changed. Reproduce the look, but do **not**
  revive p5 or Sass — redraw on the existing canvas and express styles in
  Tailwind v4 / CSS.
- **Scaling: fluid, improving on the original.** The legacy layout is not truly
  fluid — it swaps fixed sizes at 900px / 700px breakpoints (e.g. `.middleClock`
  32px → `.ProtraitmiddleClock` 3.6vw → `.U700middleClock` 4.8vw). Replace that
  with `clamp()` / `vw` so the UI scales smoothly and proportionally at any width
  and zoom level — the strict resize behavior the original only approximated.
  Match the screenshots at common widths; behave better in between.
- **Spiral: reuse the original watercolor PNGs on canvas.** Port the theme PNGs
  and theme JSON; redraw the spiral with images on `PatternCanvas`, replacing the
  abstract dots. Restore the Seashore / Seashore[Blue] theme system.
- **Fonts: self-host the originals.** Bring NotoSerif, the display serif
  (SourceSerifPro / NotoSerifDisplay), and Aileron over as self-hosted faces and
  wire them as the traditional/modern font families.
- **Per-component library calls deferred to planning.** Several legacy surfaces
  used libraries (`react-table`, `recharts`, `react-burger-menu`, `react-switch`,
  a day-picker). Planning decides per component whether to re-add the library or
  rebuild natively — the requirement is parity of *look and behavior*, not the
  same dependency.

## Requirements

### Visual identity

- R1. The clock numerals render in the original thin-stroke serif at parity with
  the 2019 screenshots.
- R2. The original fonts (NotoSerif, display serif, Aileron) are self-hosted and
  applied; no reliance on system-default sans-serif for primary surfaces.
- R3. The home screen shows the themed watercolor spiral as a full-viewport
  background, drawn from the original theme PNGs on the canvas layer.
- R4. The Seashore and Seashore[Blue] themes are both available and switch the
  spiral imagery; the selected theme persists per user (reusing existing
  preferences).
- R5. The Timer/Pomodoro toggle and the yellow/red Start bar match the original
  colors and layout.

### Surfaces (all in scope)

- R6. **Home / timer** matches `Main.jpg`: spiral background, centered serif
  clock, task input, mode toggle, Start bar; running state shows the task title
  and Pause/Continue/End controls.
- R7. **Navigation** is the slide-in burger menu (`Menu.jpg`): fixed burger
  button, profile block (avatar, name, email / "Hello, Stranger"), links to
  Home / Settings / History, sign in/out, and the github link — replacing the
  current top `AppNav`.
- R8. **Settings** matches `Setting.jpg`: right-aligned translucent panel, serif
  labels, theme select, show-hours toggle, and Pomodoro-length input.
- R9. **History** (cards, table, charts) matches `Cards.jpg` / `Table.jpg` /
  `Charts.jpg`, including the spiral preview on cards.

### Scaling and responsiveness

- R10. Layout scales fluidly with viewport width and browser zoom via
  `clamp()` / `vw`, without the original's abrupt breakpoint size jumps.
- R11. The app remains usable and on-identity at desktop and mobile widths
  (the original's ~900px and ~700px inflection points are covered by the fluid
  range, not hard breakpoints).

### Constraints

- R12. No p5 and no Sass are reintroduced; the spiral is drawn on the existing
  canvas and styles use Tailwind v4 / CSS.
- R13. No change to product behavior, data, auth, or server functions — this is
  presentation only. Existing tests for behavior must continue to pass.
- R14. SSR safety is preserved: fonts, canvas, and the burger menu must not break
  server rendering (no `window`/`document` access during SSR).

## Key Flows

- F1. **Themed recording background.** A signed-in user with a saved theme opens
  the home screen → the spiral renders in that theme → starting a timer adds
  pattern points that appear as themed images in the spiral. (R3, R4)
- F2. **Navigation via burger menu.** A user taps the burger button → the panel
  slides in with their profile and links → they navigate to Settings/History or
  sign out. (R7)
- F3. **Fluid resize.** A user resizes the window or zooms the browser → the
  clock, controls, and panels scale smoothly and proportionally without layout
  jumps. (R10, R11)

## Acceptance Criteria

- AE1. Side-by-side with the 2019 screenshots, home/timer, nav, settings, and
  history are visually recognizable as the same product (fonts, colors, spiral,
  layout).
- AE2. Switching theme changes the spiral imagery and persists across reloads.
- AE3. Resizing/zooming scales the UI smoothly with no abrupt size jumps.
- AE4. No p5 or Sass dependency is present; `npm run build`, `npm test`,
  `npm run typecheck`, and `npm run lint` all pass.
- AE5. All routes still SSR without errors (HTTP 200, no `window`/canvas SSR
  crashes).

## Scope Boundaries

### In scope

- Visual/style parity across home, nav, settings, and history.
- Self-hosting original fonts and porting theme PNGs + theme JSON.
- Redrawing the spiral with theme images on the existing canvas.
- Replacing the top nav with the burger menu.
- Fluid `clamp()`/`vw` scaling.

### Deferred for later

- Any new UX/interaction design or new features.
- Client-side ML / image processing (already deferred in the modernization plan).
- New themes beyond Seashore / Seashore[Blue].

### Outside this product's identity

- Redesigning the interface rather than reproducing it.
- Dropping the watercolor-spiral signature in favor of an abstract visual.

## Dependencies / Assumptions

- The `obsolete-2019` branch remains the source of fonts, theme PNGs, theme JSON,
  CSS reference, and screenshots.
- The existing `preferences` model already stores `themeName`, so theme switching
  needs UI/asset work, not a data change.
- Tailwind v4 arbitrary values (`text-[clamp(...)]`, `w-[10em]`, etc.) and a small
  plain-CSS layer are sufficient to express the original's units; this is assumed
  validated and treated as low risk.

## Outstanding Questions (for planning)

- Per surface, re-add the original library (`react-table`, `recharts`,
  `react-burger-menu`, `react-switch`, day-picker) or rebuild natively for the
  same look? Decide per component, weighing dependency cost vs. parity effort.
- Display serif: the original imported both `SourceSerifPro.css` and
  `NotoSerifDisplay.css` — confirm which one drives the clock numerals in the
  screenshots and self-host that one.
- Theme JSON shape (`imgSize`, `radius`, `mobileimgSize`, `mobileradius`) maps to
  fixed pixel radii; planning should express these within the fluid scaling model.

## Sources / Research

- `obsolete-2019:frontend/src/Time.scss` — clock, controls, settings, burger-menu
  styles; confirmed mixed `px`/`em`/`vw` with 900/700px breakpoints (not fluid).
- `obsolete-2019:frontend/src/App.css`, `index.css`, `containers/Cards.scss` —
  remaining layout/styles.
- `obsolete-2019:frontend/src/themes/Seashore.json` / `SeashoreBlue.json` —
  spiral layout params and 41-image lists per theme.
- `obsolete-2019:frontend/public/img/Seashore/*.png` (47 files) — watercolor
  spiral assets.
- `obsolete-2019:frontend/public/{NotoSerif,aileron,...}` — font files.
- `obsolete-2019:img/{Main,Menu,Setting,Cards,Table,Charts,ChartPresentaion}.jpg`
  — reference screenshots.
- Current UI: `src/routes/index.tsx`, `src/features/timer/TimerPanel.tsx`,
  `src/components/AppNav.tsx`, `src/components/PatternCanvas.tsx`.
