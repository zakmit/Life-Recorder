/**
 * Pattern-spiral themes, ported from the legacy theme JSON
 * (obsolete-2019:frontend/src/themes/Seashore.json and SeashoreBlue.json).
 *
 * One watercolor PNG set lives in public/img/Seashore/ (000–040). "Seashore" is
 * the full set; "Seashore[Blue]" is a curated blue-toned subset of the same
 * files. Layout params (imgSize, radius, mobile variants) drive the canvas
 * spiral in PatternCanvas.
 */

export type Theme = {
  name: string
  imgSize: number
  radius: number
  mobileImgSize: number
  mobileRadius: number
  /** Public paths to the watercolor images, in spiral order. */
  images: Array<string>
}

const SEASHORE_DIR = '/img/Seashore'

function seashorePath(n: number): string {
  return `${SEASHORE_DIR}/${String(n).padStart(3, '0')}.png`
}

// Full set: 000.png … 040.png (41 images).
const seashoreImages = Array.from({ length: 41 }, (_, i) => seashorePath(i))

// Curated blue-toned subset (legacy SeashoreBlue.json imgs list).
const seashoreBlueImages = [
  1, 4, 9, 10, 19, 20, 25, 26, 30, 31, 35, 39, 40,
].map(seashorePath)

export const SEASHORE: Theme = {
  name: 'Seashore',
  imgSize: 100,
  radius: 120,
  mobileImgSize: 75,
  mobileRadius: 90,
  images: seashoreImages,
}

export const SEASHORE_BLUE: Theme = {
  name: 'Seashore[Blue]',
  imgSize: 100,
  radius: 120,
  mobileImgSize: 75,
  mobileRadius: 90,
  images: seashoreBlueImages,
}

export const THEMES: Record<string, Theme> = {
  [SEASHORE.name]: SEASHORE,
  [SEASHORE_BLUE.name]: SEASHORE_BLUE,
}

/** The default theme (matches the legacy default). */
export const DEFAULT_THEME = SEASHORE_BLUE

/** Resolve a theme by its stored `themeName`, falling back to the default. */
export function themeByName(name: string | undefined): Theme {
  return (name && THEMES[name]) || DEFAULT_THEME
}
