import { createFileRoute } from '@tanstack/react-router'
import { TimerPanel } from '#/features/timer/TimerPanel'
import { useAuthSession } from '#/auth/useAuthSession'
import { createEntry } from '#/server/functions/entries'
import { fetchPreferences } from '#/features/settings/preferences-client'
import { DEFAULT_FORM } from '#/features/settings/preferences-schema'
import { AppNav } from '#/components/AppNav'
import { UnauthorizedError } from '#/server/auth'
import type { PreferencesForm } from '#/features/settings/preferences-schema'
import type { CompletedTimer } from '#/features/timer/useTimer'

type LoaderData = { preferences: PreferencesForm }

export const Route = createFileRoute('/')({
  component: Home,
  loader: async (): Promise<LoaderData> => {
    try {
      const prefs = await fetchPreferences()
      return {
        preferences: {
          themeName: prefs.themeName as PreferencesForm['themeName'],
          pomoMinutes: prefs.pomoMinutes,
          showHours: prefs.showHours,
        },
      }
    } catch (err) {
      // Anonymous visitors get the default timer shell.
      if (err instanceof UnauthorizedError) return { preferences: DEFAULT_FORM }
      throw err
    }
  },
})

function Home() {
  const { preferences } = Route.useLoaderData()
  const { session, isPending } = useAuthSession()
  const signedIn = !!session?.user

  async function handleComplete(entry: CompletedTimer) {
    if (!signedIn) return
    await createEntry({
      data: {
        title: entry.title,
        startTime: entry.startTime,
        endTime: entry.endTime,
        elapse: entry.elapse,
        isPomodoro: entry.isPomodoro,
        pattern: entry.pattern,
      },
    })
  }

  return (
    <div>
      <AppNav />
      <main className="py-8">
        <h1 className="mb-2 text-center text-2xl font-semibold">
          Life Recorder
        </h1>
        <TimerPanel
          pomodoroMinutes={preferences.pomoMinutes}
          showHours={preferences.showHours}
          canPersist={signedIn && !isPending}
          onComplete={handleComplete}
        />
      </main>
    </div>
  )
}
