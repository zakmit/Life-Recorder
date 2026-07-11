import { describe, expect, it } from 'vitest'
import { DEMO_ENTRIES } from './demo-entries'

describe('DEMO_ENTRIES', () => {
  it('contains deterministic synthetic sessions with processed patterns only', () => {
    expect(DEMO_ENTRIES.length).toBeGreaterThan(1)
    for (const entry of DEMO_ENTRIES) {
      expect(entry.userId).toBe('demo')
      expect(entry.startTime).toBeInstanceOf(Date)
      expect(entry.pattern.length).toBeGreaterThan(0)
      expect(entry.pattern.every((point) => point.length === 2)).toBe(true)
      expect(entry).not.toHaveProperty('audio')
      expect(entry).not.toHaveProperty('image')
    }
  })
})
