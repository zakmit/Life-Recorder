import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { BarChart3, LayoutGrid, TableProperties } from 'lucide-react'
import { BurgerNav } from '#/components/BurgerNav'
import { HistoryCards } from '#/features/history/HistoryCards'
import { HistoryTable } from '#/features/history/HistoryTable'
import { TimeSummaryChart } from '#/features/charts/TimeSummaryChart'
import { DEMO_ENTRIES } from '#/features/history/demo-entries'
import { usePreferences } from '#/features/settings/PreferencesProvider'
import { getAllEntries } from '#/server/functions/entries'
import type { Entry } from '#/db/schema'

export const Route = createFileRoute('/history')({
  component: HistoryPage,
})

type Tab = 'cards' | 'table' | 'charts'

export function HistoryPage() {
  const { status, user, retry, error: preferenceError } = usePreferences()
  const [tab, setTab] = useState<Tab>('cards')
  const [personalEntries, setPersonalEntries] = useState<Array<Entry>>([])
  const [personalEntriesOwner, setPersonalEntriesOwner] = useState<
    string | null
  >(null)
  const [historyPending, setHistoryPending] = useState(false)
  const [historyError, setHistoryError] = useState<Error | null>(null)
  const [historyRetry, setHistoryRetry] = useState(0)
  const visibleEntries = status === 'anonymous' ? DEMO_ENTRIES : personalEntries
  const showHistory =
    status === 'anonymous' ||
    (status === 'authenticated' &&
      personalEntriesOwner === user?.id &&
      !historyPending &&
      !historyError)

  useEffect(() => {
    if (status !== 'authenticated' || !user) return
    let active = true
    const ownerId = user.id
    setPersonalEntries([])
    setPersonalEntriesOwner(null)
    setHistoryPending(true)
    setHistoryError(null)
    void getAllEntries()
      .then((nextEntries) => {
        if (active) {
          setPersonalEntries(nextEntries)
          setPersonalEntriesOwner(ownerId)
        }
      })
      .catch((cause: unknown) => {
        if (active) {
          setHistoryError(
            cause instanceof Error ? cause : new Error('History lookup failed'),
          )
        }
      })
      .finally(() => {
        if (active) setHistoryPending(false)
      })
    return () => {
      active = false
    }
  }, [historyRetry, status, user?.id])

  return (
    <div className="min-h-screen">
      <BurgerNav />
      <main className="relative px-4 pb-12 pt-24">
        <h1 className="sr-only">History</h1>

        {(status === 'pending' ||
          status === 'session-error' ||
          historyPending) && (
          <p role="status" className="text-slate-500">
            {status === 'session-error'
              ? 'Could not verify your session.'
              : 'Loading history…'}
          </p>
        )}
        {status === 'session-error' && (
          <button type="button" className="mt-2 underline" onClick={retry}>
            Retry
          </button>
        )}
        {status === 'error' && (
          <div role="alert" className="text-red-600">
            <p>
              {preferenceError?.message ?? 'Could not synchronize settings.'}
            </p>
            <button type="button" className="mt-2 underline" onClick={retry}>
              Retry
            </button>
          </div>
        )}
        {historyError && (
          <div role="alert" className="text-red-600">
            <p>{historyError.message}</p>
            <button
              type="button"
              className="mt-2 underline"
              onClick={() => setHistoryRetry((value) => value + 1)}
            >
              Retry
            </button>
          </div>
        )}
        {status === 'anonymous' && (
          <p className="mb-4 text-sm text-slate-500">
            Demo history — sign in to see your recorded sessions.
          </p>
        )}
        {showHistory && (
          <>
            <div className="history-view-switcher" role="tablist">
              {(
                [
                  { value: 'charts', label: 'Charts', icon: BarChart3 },
                  { value: 'table', label: 'Table', icon: TableProperties },
                  { value: 'cards', label: 'Cards', icon: LayoutGrid },
                ] as const
              ).map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  role="tab"
                  aria-label={label}
                  aria-selected={tab === value}
                  className="history-view-button"
                  onClick={() => setTab(value)}
                >
                  <Icon aria-hidden="true" />
                  <span className="sr-only">{label}</span>
                </button>
              ))}
            </div>

            {tab === 'cards' && <HistoryCards entries={visibleEntries} />}
            {tab === 'table' && <HistoryTable entries={visibleEntries} />}
            {tab === 'charts' && <TimeSummaryChart entries={visibleEntries} />}
          </>
        )}
      </main>
    </div>
  )
}
