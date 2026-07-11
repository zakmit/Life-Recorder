export type ChartPeriod = 'day' | 'week' | 'month' | 'year' | 'custom'

export type DateRange = {
  start: Date
  /** Exclusive end instant. */
  end: Date
}

export type CustomDateRange = {
  from?: Date
  to?: Date
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function nextDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)
}

export function rangeForPeriod(
  period: ChartPeriod,
  selectedDate: Date,
  customRange?: CustomDateRange,
): DateRange {
  if (period === 'week') {
    const selected = startOfDay(selectedDate)
    const start = new Date(
      selected.getFullYear(),
      selected.getMonth(),
      selected.getDate() - selected.getDay(),
    )
    return { start, end: new Date(start.getFullYear(), start.getMonth(), start.getDate() + 7) }
  }

  if (period === 'month') {
    return {
      start: new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1),
      end: new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1),
    }
  }

  if (period === 'year') {
    return {
      start: new Date(selectedDate.getFullYear(), 0, 1),
      end: new Date(selectedDate.getFullYear() + 1, 0, 1),
    }
  }

  if (period === 'custom') {
    const first = startOfDay(customRange?.from ?? customRange?.to ?? selectedDate)
    const last = startOfDay(customRange?.to ?? customRange?.from ?? selectedDate)
    const start = first <= last ? first : last
    const endDay = first <= last ? last : first
    return { start, end: nextDay(endDay) }
  }

  const start = startOfDay(selectedDate)
  return { start, end: nextDay(start) }
}
