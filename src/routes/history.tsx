import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { BurgerNav } from '#/components/BurgerNav'
import { HistoryCards } from '#/features/history/HistoryCards'
import { HistoryTable } from '#/features/history/HistoryTable'
import { TimeSummaryChart } from '#/features/charts/TimeSummaryChart'
import { getAllEntries } from '#/server/functions/entries'
import { UnauthorizedError } from '#/server/auth'
import type { Entry } from '#/db/schema'

type LoaderData = { entries: Array<Entry>; signedIn: boolean }

export const Route = createFileRoute('/history')({
  component: HistoryPage,
  loader: async (): Promise<LoaderData> => {
    try {
      const entries = await getAllEntries()
      return { entries, signedIn: true }
    } catch (err) {
      if (err instanceof UnauthorizedError) {
        return { entries: [], signedIn: false }
      }
      throw err
    }
  },
})

type Tab = 'cards' | 'table' | 'charts'

function HistoryPage() {
  const { entries, signedIn } = Route.useLoaderData()
  const [tab, setTab] = useState<Tab>('cards')

  return (
    <div>
      <BurgerNav />
      <main className="mx-auto max-w-3xl p-6">
        <h1 className="mb-4 text-xl font-semibold">History</h1>

        {!signedIn ? (
          <p className="text-slate-500">
            Sign in to view your recorded sessions.
          </p>
        ) : (
          <>
            <div className="mb-4 flex gap-2" role="tablist">
              {(['cards', 'table', 'charts'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  role="tab"
                  aria-selected={tab === t}
                  className={`rounded px-3 py-1 text-sm capitalize ${
                    tab === t ? 'bg-slate-800 text-white' : 'bg-slate-200'
                  }`}
                  onClick={() => setTab(t)}
                >
                  {t}
                </button>
              ))}
            </div>

            {tab === 'cards' && <HistoryCards entries={entries} />}
            {tab === 'table' && <HistoryTable entries={entries} />}
            {tab === 'charts' && <TimeSummaryChart entries={entries} />}
          </>
        )}
      </main>
    </div>
  )
}
