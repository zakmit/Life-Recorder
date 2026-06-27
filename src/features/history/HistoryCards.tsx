import { PatternCanvas } from '#/components/PatternCanvas'
import { timeToString } from '#/features/timer/format'
import type { Entry } from '#/db/schema'

export type HistoryCardsProps = {
  entries: ReadonlyArray<Entry>
}

/**
 * Card history: one card per entry with its title, duration, time range, and a
 * preview of the recorded sound pattern. Mirrors the legacy Cards surface.
 */
export function HistoryCards({ entries }: HistoryCardsProps) {
  if (entries.length === 0) {
    return <p className="text-slate-500">No sessions recorded yet.</p>
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {entries.map((entry) => (
        <article
          key={entry.id}
          className="overflow-hidden rounded-lg border shadow-sm"
        >
          <div className="flex items-center justify-between gap-2 p-3">
            <div>
              <div className="font-medium">{entry.title || 'Untitled'}</div>
              <div className="text-sm text-slate-500">
                {timeToString(entry.elapse)}
                {entry.isPomodoro ? ' · Pomodoro' : ''}
              </div>
            </div>
            <div className="text-right text-xs text-slate-400">
              <div>{new Date(entry.startTime).toLocaleString()}</div>
            </div>
          </div>
          <div className="flex justify-center bg-slate-50">
            <PatternCanvas pattern={entry.pattern} width={280} height={140} />
          </div>
        </article>
      ))}
    </div>
  )
}
