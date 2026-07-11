import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

// Guards the font wiring (U1). jsdom does not apply Tailwind @theme, so we
// assert the stylesheet content rather than computed styles.
const css = readFileSync(join(process.cwd(), 'src/styles.css'), 'utf8')

describe('app font wiring', () => {
  it('defines the system-ui + Aileron font stack', () => {
    expect(css).toMatch(
      /system-ui,\s*-apple-system,\s*BlinkMacSystemFont,\s*['"]Segoe UI['"],\s*Aileron,\s*sans-serif/,
    )
  })

  it('self-hosts Aileron from /fonts/Aileron (not a CDN)', () => {
    expect(css).toContain('url(/fonts/Aileron/Aileron-Thin.otf)')
    expect(css).not.toMatch(/rawgit|cdn\.|googleapis/i)
  })

  it('maps the thin weights used by the clock face (100/200)', () => {
    expect(css).toMatch(
      /Aileron-UltraLight\.otf\)\s+format\(['"]opentype['"]\);[^}]*font-weight:\s*100/s,
    )
    expect(css).toMatch(
      /Aileron-Thin\.otf\)\s+format\(['"]opentype['"]\);[^}]*font-weight:\s*200/s,
    )
  })

  it('applies the family to body', () => {
    expect(css).toMatch(/body\s*\{[^}]*font-family: var\(--font-sans\)/s)
  })
})
