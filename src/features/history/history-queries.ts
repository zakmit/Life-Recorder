import {
  getAllEntries,
  getEntriesInRange,
  getLatestEntries,
} from '#/server/functions/entries'
import type { Entry } from '#/db/schema'

/** Sort comparator: newest start time first (legacy `sortByTime` parity). */
export function byStartTimeDesc(a: Entry, b: Entry): number {
  return new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
}

/** Sort comparator: oldest start time first (chart ordering). */
export function byStartTimeAsc(a: Entry, b: Entry): number {
  return new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
}

export function fetchLatestEntries(before?: Date) {
  return getLatestEntries({ data: before ? { before } : {} })
}

export function fetchAllEntries() {
  return getAllEntries()
}

export function fetchEntriesInRange(startDate: Date, endDate: Date) {
  return getEntriesInRange({ data: { startDate, endDate } })
}
