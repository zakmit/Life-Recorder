import { createFileRoute } from '@tanstack/react-router'
import { BurgerNav } from '#/components/BurgerNav'
import { SettingsForm } from '#/features/settings/SettingsForm'
import { DEFAULT_FORM } from '#/features/settings/preferences-schema'
import {
  fetchPreferences,
  savePreferences,
} from '#/features/settings/preferences-client'
import { UnauthorizedError } from '#/server/auth'
import type { PreferencesForm } from '#/features/settings/preferences-schema'

type LoaderData = { preferences: PreferencesForm; signedIn: boolean }

export const Route = createFileRoute('/settings')({
  component: SettingsPage,
  loader: async (): Promise<LoaderData> => {
    try {
      const prefs = await fetchPreferences()
      return {
        preferences: {
          themeName: prefs.themeName as PreferencesForm['themeName'],
          pomoMinutes: prefs.pomoMinutes,
          showHours: prefs.showHours,
        },
        signedIn: true,
      }
    } catch (err) {
      if (err instanceof UnauthorizedError) {
        return { preferences: DEFAULT_FORM, signedIn: false }
      }
      throw err
    }
  },
})

function SettingsPage() {
  const { preferences, signedIn } = Route.useLoaderData()

  return (
    <div className="min-h-screen">
      <BurgerNav />
      <main className="mx-auto max-w-2xl px-6 pb-12 pt-24">
        <h1 className="mb-6 text-2xl" style={{ fontWeight: 300 }}>
          Settings
        </h1>
        {signedIn ? (
          <div
            className="rounded-lg p-8"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.726)' }}
          >
            <SettingsForm
              initial={preferences}
              onSave={async (values) => {
                await savePreferences(values)
              }}
            />
          </div>
        ) : (
          <p className="text-slate-500">
            Sign in to change and save your preferences.
          </p>
        )}
      </main>
    </div>
  )
}
