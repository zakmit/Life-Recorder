import { createFileRoute } from '@tanstack/react-router'
import { AppNav } from '#/components/AppNav'
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
    <div>
      <AppNav />
      <main className="mx-auto max-w-2xl p-6">
        <h1 className="mb-4 text-xl font-semibold">Settings</h1>
        {signedIn ? (
          <SettingsForm
            initial={preferences}
            onSave={async (values) => {
              await savePreferences(values)
            }}
          />
        ) : (
          <p className="text-slate-500">
            Sign in to change and save your preferences.
          </p>
        )}
      </main>
    </div>
  )
}
