import { describe, expect, it } from 'vitest'
import {
  bucketByDay,
  buildStatistics,
  filterEntriesInRange,
  rangeForLastDays,
  totalSeconds,
} from './chart-transforms'
import type { Entry } from '#/db/schema'

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

const entry = (
  title: string,
  startTime: Date,
  elapse: number,
  isPomodoro = false,
): Entry => ({
  id: `${title}-${startTime.getTime()}`,
  userId: 'alice',
  title,
  startTime,
  endTime: new Date(startTime.getTime() + elapse * 1000),
  elapse,
  isPomodoro,
  pattern: [[10, 2]],
  createdAt: startTime,
})

describe('filterEntriesInRange', () => {
  it('includes the local start and excludes the exclusive end', () => {
    const start = new Date(2026, 0, 10)
    const end = new Date(2026, 0, 11)
    const entries = [
      entry('start', new Date(2026, 0, 10), 60),
      entry('inside', new Date(2026, 0, 10, 23, 59, 59), 60),
      entry('end', new Date(2026, 0, 11), 60),
    ]

    expect(filterEntriesInRange(entries, { start, end })).toHaveLength(2)
  })
})

describe('buildStatistics', () => {
  const range = {
    start: new Date(2026, 0, 10),
    end: new Date(2026, 0, 12),
  }

  it('derives all summaries from the same filtered entries', () => {
    const result = buildStatistics(
      [
        entry('Deep work', new Date(2026, 0, 10, 9), 600, true),
        entry('Deep work', new Date(2026, 0, 10, 14), 300),
        entry('Reading', new Date(2026, 0, 11, 9), 1200, true),
        entry('Outside', new Date(2026, 0, 12, 9), 9999, true),
      ],
      range,
      'week',
    )

    expect(result.totalSeconds).toBe(2100)
    expect(result.totalCount).toBe(3)
    expect(result.totalPomodoros).toBe(2)
    expect(result.eventData).toEqual([
      { label: '2026-01-10', elapsedSeconds: 900, count: 2 },
      { label: '2026-01-11', elapsedSeconds: 1200, count: 1 },
    ])
    expect(result.pomodoroData).toEqual([
      { label: '2026-01-10', count: 1 },
      { label: '2026-01-11', count: 1 },
    ])
  })

  it('groups a day by event title and a year by month', () => {
    const entries = [
      entry('Deep work', new Date(2026, 0, 10, 9), 600),
      entry('Deep work', new Date(2026, 0, 10, 14), 300),
      entry('Reading', new Date(2026, 1, 10, 9), 1200, true),
    ]

    expect(
      buildStatistics(
        entries,
        { start: new Date(2026, 0, 10), end: new Date(2026, 0, 11) },
        'day',
      ).eventData,
    ).toEqual([{ label: 'Deep work', elapsedSeconds: 900, count: 2 }])

    expect(
      buildStatistics(
        entries,
        { start: new Date(2026, 0, 1), end: new Date(2027, 0, 1) },
        'year',
      ).eventData,
    ).toEqual([
      { label: '2026-01', elapsedSeconds: 900, count: 2 },
      { label: '2026-02', elapsedSeconds: 1200, count: 1 },
    ])
  })

  it('returns empty series and zero summaries for an empty range', () => {
    expect(buildStatistics([], range, 'custom')).toEqual({
      eventData: [],
      pomodoroData: [],
      totalSeconds: 0,
      totalCount: 0,
      totalPomodoros: 0,
    })
  })
})
