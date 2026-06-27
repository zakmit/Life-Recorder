import type { Entry } from '#/db/schema'

export type DayBucket = {
  /** ISO date (YYYY-MM-DD) of the bucket. */
  date: string
  /** Total elapsed seconds recorded that day. */
  totalSeconds: number
  /** Number of entries in the bucket. */
  count: number
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

/**
 * Group entries by start-date day and sum elapsed seconds. Returns buckets
 * sorted ascending by date. Pure: takes already-fetched entries, no I/O.
 */
export function bucketByDay(
  entries: ReadonlyArray<Pick<Entry, 'startTime' | 'elapse'>>,
): Array<DayBucket> {
  const byDate = new Map<string, DayBucket>()
  for (const entry of entries) {
    const date = isoDate(new Date(entry.startTime))
    const existing = byDate.get(date)
    if (existing) {
      existing.totalSeconds += entry.elapse
      existing.count += 1
    } else {
      byDate.set(date, { date, totalSeconds: entry.elapse, count: 1 })
    }
  }
  return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date))
}

/** Total elapsed seconds across all entries. */
export function totalSeconds(
  entries: ReadonlyArray<Pick<Entry, 'elapse'>>,
): number {
  return entries.reduce((sum, e) => sum + e.elapse, 0)
}

/** Split entries into the date range used by a chart over the last `days`. */
export function rangeForLastDays(
  days: number,
  now: Date = new Date(),
): { startDate: Date; endDate: Date } {
  const endDate = new Date(now)
  endDate.setHours(23, 59, 59, 999)
  const startDate = new Date(endDate)
  startDate.setDate(startDate.getDate() - (days - 1))
  startDate.setHours(0, 0, 0, 0)
  return { startDate, endDate }
}
