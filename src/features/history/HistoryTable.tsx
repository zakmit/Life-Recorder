import { timeToString } from '#/features/timer/format'
import type { Entry } from '#/db/schema'

export type HistoryTableProps = {
  entries: ReadonlyArray<Entry>
}

/** Table history: every entry in a compact, sortable-order table. */
export function HistoryTable({ entries }: HistoryTableProps) {
  if (entries.length === 0) {
    return <p className="text-slate-500">No sessions recorded yet.</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b text-left text-slate-500">
            <th className="py-2 pr-4">Title</th>
            <th className="py-2 pr-4">Started</th>
            <th className="py-2 pr-4">Ended</th>
            <th className="py-2 pr-4">Duration</th>
            <th className="py-2 pr-4">Type</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.id} className="border-b">
              <td className="py-2 pr-4">{entry.title || 'Untitled'}</td>
              <td className="py-2 pr-4">
                {new Date(entry.startTime).toLocaleString()}
              </td>
              <td className="py-2 pr-4">
                {new Date(entry.endTime).toLocaleString()}
              </td>
              <td className="py-2 pr-4">{timeToString(entry.elapse)}</td>
              <td className="py-2 pr-4">
                {entry.isPomodoro ? 'Pomodoro' : 'Timer'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
