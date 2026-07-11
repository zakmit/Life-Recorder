import { describe, expect, it } from 'vitest'
import { rangeForPeriod } from './chart-range'

describe('rangeForPeriod', () => {
  it('creates an exclusive-end day range in local time', () => {
    const range = rangeForPeriod('day', new Date(2026, 5, 17, 14, 30))
    expect(range.start).toEqual(new Date(2026, 5, 17))
    expect(range.end).toEqual(new Date(2026, 5, 18))
  })

  it('creates a Sunday-through-Saturday week range', () => {
    const range = rangeForPeriod('week', new Date(2026, 5, 17))
    expect(range.start).toEqual(new Date(2026, 5, 14))
    expect(range.end).toEqual(new Date(2026, 5, 21))
  })

  it('handles month and year rollover', () => {
    expect(rangeForPeriod('month', new Date(2026, 11, 15))).toEqual({
      start: new Date(2026, 11, 1),
      end: new Date(2027, 0, 1),
    })
    expect(rangeForPeriod('year', new Date(2026, 5, 17))).toEqual({
      start: new Date(2026, 0, 1),
      end: new Date(2027, 0, 1),
    })
  })

  it('normalizes a reversed custom range and includes both endpoint days', () => {
    expect(
      rangeForPeriod('custom', new Date(2026, 5, 20), {
        from: new Date(2026, 5, 20),
        to: new Date(2026, 5, 17),
      }),
    ).toEqual({
      start: new Date(2026, 5, 17),
      end: new Date(2026, 5, 21),
    })
  })

  it('uses the available custom endpoint when the range is partial', () => {
    expect(
      rangeForPeriod('custom', new Date(2026, 5, 20), {
        from: new Date(2026, 5, 18),
      }),
    ).toEqual({
      start: new Date(2026, 5, 18),
      end: new Date(2026, 5, 19),
    })
  })
})
