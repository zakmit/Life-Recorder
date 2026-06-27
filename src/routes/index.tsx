import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import { TimerPanel } from '#/features/timer/TimerPanel'
import { useAuthSession } from '#/auth/useAuthSession'
import { createEntry } from '#/server/functions/entries'
import { fetchPreferences } from '#/features/settings/preferences-client'
import { DEFAULT_FORM } from '#/features/settings/preferences-schema'
import { BurgerNav } from '#/components/BurgerNav'
import { PatternCanvas } from '#/components/PatternCanvas'
import { themeByName } from '#/features/audio/themes'
import { UnauthorizedError } from '#/server/auth'
import type { PreferencesForm } from '#/features/settings/preferences-schema'
import type { PatternPoint } from '#/features/audio/pattern'
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

// The legacy app seeded an idle spiral of random points (49) so the background
// is filled before any recording. Reproduce that for the resting screen.
function seedPattern(count = 49): Array<PatternPoint> {
  return Array.from({ length: count }, () => [
    Math.floor(Math.random() * 128),
    Math.floor(Math.random() * 128),
  ])
}

function useViewportSize() {
  const [size, setSize] = useState({ width: 1200, height: 800 })
  useEffect(() => {
    const update = () =>
      setSize({ width: window.innerWidth, height: window.innerHeight })
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])
  return size
}

function Home() {
  const { preferences } = Route.useLoaderData()
  const { session, isPending } = useAuthSession()
  const signedIn = !!session?.user

  const theme = themeByName(preferences.themeName)
  const { width, height } = useViewportSize()
  const seed = useMemo(() => seedPattern(), [])
  const [livePattern, setLivePattern] = useState<ReadonlyArray<PatternPoint>>([])

  // Show the live recording pattern once it has points, else the idle seed.
  const spiralPattern = livePattern.length > 0 ? livePattern : seed

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
    <div className="relative min-h-screen overflow-hidden">
      {/* Full-viewport watercolor spiral background (legacy .background, z behind). */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <PatternCanvas
          pattern={spiralPattern}
          theme={theme}
          width={width}
          height={height}
          imgSize={theme.imgSize}
          radius={theme.radius}
        />
      </div>

      <BurgerNav />

      <TimerPanel
        pomodoroMinutes={preferences.pomoMinutes}
        showHours={preferences.showHours}
        canPersist={signedIn && !isPending}
        onComplete={handleComplete}
        onPatternChange={setLivePattern}
      />
    </div>
  )
}
