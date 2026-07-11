import { useMemo, useState } from 'react'
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
} from 'recharts'
import { Calendar } from '#/components/ui/calendar'
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '#/components/ui/chart'
import { rangeForPeriod } from './chart-range'
import { buildStatistics } from './chart-transforms'
import { timeToString } from '#/features/timer/format'
import type { DateRange as PickerDateRange } from 'react-day-picker'
import type { ChartConfig } from '#/components/ui/chart'
import type { ChartPeriod } from './chart-range'
import type { Entry } from '#/db/schema'

export type TimeSummaryChartProps = {
  entries: ReadonlyArray<Entry>
}

const PERIODS: ReadonlyArray<{ value: ChartPeriod; label: string }> = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'year', label: 'Year' },
  { value: 'custom', label: 'Custom' },
]

const eventChartConfig = {
  elapsedSeconds: { label: 'Tracked time', color: '#67b1d6' },
  count: { label: 'Timer count', color: '#faad55' },
} satisfies ChartConfig

const pomodoroChartConfig = {
  count: { label: 'Pomodoro count', color: '#e04848' },
} satisfies ChartConfig

function latestEntryDate(entries: ReadonlyArray<Entry>): Date {
  if (entries.length === 0) return new Date()
  let latest = new Date(entries[0].startTime)
  for (let index = 1; index < entries.length; index++) {
    const candidate = new Date(entries[index].startTime)
    if (candidate > latest) latest = candidate
  }
  return latest
}

function monthValue(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function formatRange(start: Date, end: Date): string {
  const inclusiveEnd = new Date(end)
  inclusiveEnd.setDate(inclusiveEnd.getDate() - 1)
  const formatter = new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  })
  if (start.toDateString() === inclusiveEnd.toDateString()) {
    return formatter.format(start)
  }
  return `${formatter.format(start)} – ${formatter.format(inclusiveEnd)}`
}

export function TimeSummaryChart({ entries }: TimeSummaryChartProps) {
  const [period, setPeriod] = useState<ChartPeriod>('day')
  const [selectedDate, setSelectedDate] = useState(() =>
    latestEntryDate(entries),
  )
  const [customRange, setCustomRange] = useState<PickerDateRange | undefined>()
  const range = useMemo(
    () => rangeForPeriod(period, selectedDate, customRange),
    [customRange, period, selectedDate],
  )
  const statistics = useMemo(
    () => buildStatistics(entries, range, period),
    [entries, period, range],
  )
  const rangeLabel = formatRange(range.start, range.end)

  function selectPeriod(nextPeriod: ChartPeriod) {
    setPeriod(nextPeriod)
    if (nextPeriod === 'custom' && !customRange) {
      setCustomRange({ from: selectedDate, to: selectedDate })
    }
  }

  return (
    <section className="statistics-shell" aria-label="Statistics">
      <aside className="statistics-selector">
        <div className="statistics-periods" aria-label="Statistics period">
          {PERIODS.map((item) => (
            <button
              key={item.value}
              type="button"
              aria-pressed={period === item.value}
              className={
                period === item.value
                  ? 'statistics-period statistics-period-selected'
                  : 'statistics-period'
              }
              onClick={() => selectPeriod(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="statistics-date-control">
          {period === 'month' ? (
            <input
              aria-label="Select month"
              type="month"
              className="statistics-date-input"
              value={monthValue(selectedDate)}
              onChange={(event) => {
                const [year, month] = event.target.value.split('-').map(Number)
                if (year && month) setSelectedDate(new Date(year, month - 1, 1))
              }}
            />
          ) : period === 'year' ? (
            <div className="statistics-year-control">
              <button
                type="button"
                aria-label="Previous year"
                onClick={() =>
                  setSelectedDate(
                    (date) => new Date(date.getFullYear() - 1, 0, 1),
                  )
                }
              >
                ‹
              </button>
              <input
                aria-label="Select year"
                type="number"
                className="statistics-date-input"
                value={selectedDate.getFullYear()}
                onChange={(event) => {
                  const year = Number(event.target.value)
                  if (Number.isInteger(year)) setSelectedDate(new Date(year, 0, 1))
                }}
              />
              <button
                type="button"
                aria-label="Next year"
                onClick={() =>
                  setSelectedDate(
                    (date) => new Date(date.getFullYear() + 1, 0, 1),
                  )
                }
              >
                ›
              </button>
            </div>
          ) : (
            <p className="statistics-date-label">
              {period === 'custom'
                ? 'Choose a start and end date'
                : rangeLabel}
            </p>
          )}
        </div>

        <div className="statistics-calendar">
          {period === 'custom' ? (
            <Calendar
              mode="range"
              selected={customRange}
              defaultMonth={selectedDate}
              onSelect={(nextRange) => {
                setCustomRange(nextRange)
                const nextDate = nextRange?.from ?? nextRange?.to
                if (nextDate) setSelectedDate(nextDate)
              }}
            />
          ) : period === 'day' || period === 'week' ? (
            <Calendar
              mode="single"
              selected={selectedDate}
              defaultMonth={selectedDate}
              onSelect={(date) => {
                if (date) setSelectedDate(date)
              }}
              modifiers={
                period === 'week'
                  ? { selectedRange: { from: range.start, to: new Date(range.end.getTime() - 1) } }
                  : undefined
              }
              modifiersClassNames={{ selectedRange: 'bg-sky-100 rounded-none' }}
            />
          ) : null}
        </div>
      </aside>

      <div className="statistics-results">
        <article className="statistics-chart-section">
          <h2>Recorder Events</h2>
          {statistics.eventData.length > 0 ? (
            <div role="img" aria-label="Recorded events chart">
              <ChartContainer
                config={eventChartConfig}
                className="statistics-chart"
              >
                <ComposedChart data={statistics.eventData} accessibilityLayer>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} />
                  <YAxis yAxisId="elapsed" tickLine={false} axisLine={false} />
                  <YAxis
                    yAxisId="count"
                    orientation="right"
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar
                    yAxisId="elapsed"
                    dataKey="elapsedSeconds"
                    fill="var(--color-elapsedSeconds)"
                    barSize={20}
                  />
                  <Line
                    yAxisId="count"
                    dataKey="count"
                    stroke="var(--color-count)"
                    strokeWidth={2}
                  />
                </ComposedChart>
              </ChartContainer>
            </div>
          ) : (
            <p className="statistics-empty">No recorded events for this range.</p>
          )}
          <p className="statistics-summary">
            {timeToString(statistics.totalSeconds)} have been tracked in{' '}
            <strong>{rangeLabel}</strong>.
          </p>
          <p className="statistics-summary">
            By the way, there {statistics.totalCount === 1 ? 'is' : 'are'}{' '}
            {statistics.totalCount} {statistics.totalCount === 1 ? 'timer' : 'timers'}.
          </p>
        </article>

        <article className="statistics-chart-section">
          <h2>Eaten Pomodoros</h2>
          {statistics.pomodoroData.length > 0 ? (
            <div role="img" aria-label="Pomodoro count chart">
              <ChartContainer
                config={pomodoroChartConfig}
                className="statistics-chart"
              >
                <ComposedChart data={statistics.pomodoroData} accessibilityLayer>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="count"
                    fill="var(--color-count)"
                    barSize={20}
                  />
                </ComposedChart>
              </ChartContainer>
            </div>
          ) : (
            <p className="statistics-empty">No Pomodoros for this range.</p>
          )}
          <p className="statistics-summary">
            You have completed {statistics.totalPomodoros}{' '}
            {statistics.totalPomodoros === 1
              ? 'Pomodoro timer'
              : 'Pomodoro timers'}{' '}
            in <strong>{rangeLabel}</strong>.
          </p>
        </article>
      </div>
    </section>
  )
}
