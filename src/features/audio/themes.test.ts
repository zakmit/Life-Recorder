import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  DEFAULT_THEME,
  SEASHORE,
  SEASHORE_BLUE,
  THEMES,
  themeByName,
} from './themes'

const publicPath = (p: string) => join(process.cwd(), 'public', p)

describe('themes', () => {
  it('Seashore has the full 41-image set', () => {
    expect(SEASHORE.images).toHaveLength(41)
    expect(SEASHORE.images[0]).toBe('/img/Seashore/000.png')
    expect(SEASHORE.images[40]).toBe('/img/Seashore/040.png')
  })

  it('every theme image path exists in public/', () => {
    for (const img of new Set([...SEASHORE.images, ...SEASHORE_BLUE.images])) {
      expect(existsSync(publicPath(img)), `${img} missing`).toBe(true)
    }
  })

  it("Seashore[Blue] is a curated subset of Seashore's images", () => {
    expect(SEASHORE_BLUE.images.length).toBeGreaterThan(0)
    expect(SEASHORE_BLUE.images.length).toBeLessThan(SEASHORE.images.length)
    const full = new Set(SEASHORE.images)
    for (const img of SEASHORE_BLUE.images) {
      expect(full.has(img), `${img} not in Seashore`).toBe(true)
    }
  })

  it('exposes positive layout params', () => {
    for (const theme of [SEASHORE, SEASHORE_BLUE]) {
      expect(theme.imgSize).toBeGreaterThan(0)
      expect(theme.radius).toBeGreaterThan(0)
      expect(theme.mobileImgSize).toBeGreaterThan(0)
      expect(theme.mobileRadius).toBeGreaterThan(0)
    }
  })

  it('themeByName resolves known names and falls back to default', () => {
    expect(themeByName('Seashore')).toBe(SEASHORE)
    expect(themeByName('Seashore[Blue]')).toBe(SEASHORE_BLUE)
    expect(themeByName('unknown')).toBe(DEFAULT_THEME)
    expect(themeByName(undefined)).toBe(DEFAULT_THEME)
  })

  it('registers both themes under their names', () => {
    expect(Object.keys(THEMES).sort()).toEqual(['Seashore', 'Seashore[Blue]'])
  })
})
