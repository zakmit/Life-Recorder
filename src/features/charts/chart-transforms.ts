import type { Entry } from '#/db/schema'
import type { ChartPeriod, DateRange } from './chart-range'

export type DayBucket = {
  /** ISO date (YYYY-MM-DD) of the bucket. */
  date: string
  /** Total elapsed seconds recorded that day. */
  totalSeconds: number
  /** Number of entries in the bucket. */
  count: number
}

export type EventChartDatum = {
  label: string
  elapsedSeconds: number
  count: number
}

export type PomodoroChartDatum = {
  label: string
  count: number
}

export type StatisticsResult = {
  eventData: Array<EventChartDatum>
  pomodoroData: Array<PomodoroChartDatum>
  totalSeconds: number
  totalCount: number
  totalPomodoros: number
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

export function filterEntriesInRange<T extends Pick<Entry, 'startTime'>>(
  entries: ReadonlyArray<T>,
  range: DateRange,
): Array<T> {
  const start = range.start.getTime()
  const end = range.end.getTime()
  return entries.filter((entry) => {
    const time = new Date(entry.startTime).getTime()
    return time >= start && time < end
  })
}

function localDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function labelForEntry(entry: Pick<Entry, 'title' | 'startTime'>, period: ChartPeriod): string {
  if (period === 'day') return entry.title
  const date = new Date(entry.startTime)
  if (period === 'year') return localDateKey(date).slice(0, 7)
  return localDateKey(date)
}

export function buildStatistics(
  entries: ReadonlyArray<Entry>,
  range: DateRange,
  period: ChartPeriod,
): StatisticsResult {
  const visible = filterEntriesInRange(entries, range)
  const events = new Map<string, EventChartDatum>()
  const pomodoros = new Map<string, PomodoroChartDatum>()
  let elapsedSeconds = 0
  let totalPomodoros = 0

  for (const entry of visible) {
    const label = labelForEntry(entry, period)
    const event = events.get(label)
    if (event) {
      event.elapsedSeconds += entry.elapse
      event.count += 1
    } else {
      events.set(label, { label, elapsedSeconds: entry.elapse, count: 1 })
    }
    elapsedSeconds += entry.elapse

    if (entry.isPomodoro) {
      const pomodoro = pomodoros.get(label)
      if (pomodoro) pomodoro.count += 1
      else pomodoros.set(label, { label, count: 1 })
      totalPomodoros += 1
    }
  }

  const byLabel = (a: { label: string }, b: { label: string }) =>
    a.label.localeCompare(b.label)

  return {
    eventData: [...events.values()].sort(byLabel),
    pomodoroData: [...pomodoros.values()].sort(byLabel),
    totalSeconds: elapsedSeconds,
    totalCount: visible.length,
    totalPomodoros,
  }
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
