import { createFileRoute } from '@tanstack/react-router'
import { BurgerNav } from '#/components/BurgerNav'
import { SettingsForm } from '#/features/settings/SettingsForm'
import { usePreferences } from '#/features/settings/PreferencesProvider'

export const Route = createFileRoute('/settings')({
  component: SettingsPage,
})

function SettingsPage() {
  const { preferences, status, save, retry, error } = usePreferences()

  return (
    <div className="min-h-screen">
      <BurgerNav />
      <main className="mx-auto max-w-2xl px-6 pb-12 pt-24">
        <h1 className="mb-6 text-2xl" style={{ fontWeight: 300 }}>
          Settings
        </h1>
        {status === 'pending' || status === 'session-error' ? (
          <p role="status" className="text-slate-500">
            {status === 'pending'
              ? 'Loading settings…'
              : 'Could not verify your session.'}
          </p>
        ) : (
          <div
            className="rounded-lg p-8"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.726)' }}
          >
            <SettingsForm
              key={JSON.stringify(preferences)}
              initial={preferences}
              onSave={save}
            />
            {status === 'error' && (
              <div role="alert" className="mt-4 text-sm text-red-600">
                <p>{error?.message ?? 'Could not synchronize settings.'}</p>
                <button
                  type="button"
                  className="mt-1 underline"
                  onClick={retry}
                >
                  Retry
                </button>
              </div>
            )}
          </div>
        )}
        {status === 'session-error' && (
          <button type="button" className="mt-3 underline" onClick={retry}>
            Retry
          </button>
        )}
      </main>
    </div>
  )
}
