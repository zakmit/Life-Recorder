import { bucketByDay } from './chart-transforms'
import { timeToString } from '#/features/timer/format'
import type { Entry } from '#/db/schema'

export type TimeSummaryChartProps = {
  entries: ReadonlyArray<Entry>
}

/**
 * A lightweight inline-SVG bar chart of total recorded time per day. Kept
 * dependency-free since the data is small and the shape is simple.
 */
export function TimeSummaryChart({ entries }: TimeSummaryChartProps) {
  const buckets = bucketByDay(entries)
  if (buckets.length === 0) {
    return <p className="text-slate-500">No data to chart yet.</p>
  }

  const max = Math.max(...buckets.map((b) => b.totalSeconds), 1)
  const barWidth = 36
  const gap = 12
  const chartHeight = 160
  const width = buckets.length * (barWidth + gap)

  return (
    <div className="overflow-x-auto">
      <svg
        width={width}
        height={chartHeight + 40}
        role="img"
        aria-label="Recorded time per day"
      >
        {buckets.map((bucket, i) => {
          const barHeight = Math.round(
            (bucket.totalSeconds / max) * chartHeight,
          )
          const x = i * (barWidth + gap)
          const y = chartHeight - barHeight
          return (
            <g key={bucket.date}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill="#0ea5e9"
                rx={3}
              >
                <title>{`${bucket.date}: ${timeToString(bucket.totalSeconds)}`}</title>
              </rect>
              <text
                x={x + barWidth / 2}
                y={chartHeight + 16}
                textAnchor="middle"
                fontSize={10}
                fill="#64748b"
              >
                {bucket.date.slice(5)}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
