import { describe, expect, it } from 'vitest'
import { bucketByDay, rangeForLastDays, totalSeconds } from './chart-transforms'

const e = (startTime: string, elapse: number) => ({
  startTime: new Date(startTime),
  elapse,
})

describe('bucketByDay', () => {
  it('groups entries by day and sums elapsed seconds', () => {
    const buckets = bucketByDay([
      e('2026-01-01T09:00:00Z', 600),
      e('2026-01-01T14:00:00Z', 300),
      e('2026-01-03T10:00:00Z', 1200),
    ])
    expect(buckets).toEqual([
      { date: '2026-01-01', totalSeconds: 900, count: 2 },
      { date: '2026-01-03', totalSeconds: 1200, count: 1 },
    ])
  })

  it('sorts buckets ascending by date', () => {
    const buckets = bucketByDay([
      e('2026-02-05T00:00:00Z', 60),
      e('2026-01-02T00:00:00Z', 60),
    ])
    expect(buckets.map((b) => b.date)).toEqual(['2026-01-02', '2026-02-05'])
  })

  it('returns empty for no entries', () => {
    expect(bucketByDay([])).toEqual([])
  })
})

describe('totalSeconds', () => {
  it('sums elapse across entries', () => {
    expect(totalSeconds([{ elapse: 100 }, { elapse: 250 }])).toBe(350)
  })
})

describe('rangeForLastDays', () => {
  it('produces an inclusive day window ending today', () => {
    const now = new Date('2026-01-10T12:00:00Z')
    const { startDate, endDate } = rangeForLastDays(7, now)
    expect(startDate.getTime()).toBeLessThan(endDate.getTime())
    // Start is 6 days before end's date (7-day inclusive window).
    const spanDays = Math.round(
      (endDate.getTime() - startDate.getTime()) / 86_400_000,
    )
    expect(spanDays).toBe(7)
  })
})
