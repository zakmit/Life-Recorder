import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import { TimerPanel } from '#/features/timer/TimerPanel'
import { createEntry } from '#/server/functions/entries'
import { usePreferences } from '#/features/settings/PreferencesProvider'
import { BurgerNav } from '#/components/BurgerNav'
import { PatternCanvas } from '#/components/PatternCanvas'
import { themeByName } from '#/features/audio/themes'
import type { PatternPoint } from '#/features/audio/pattern'
import type { CompletedTimer } from '#/features/timer/useTimer'

export const Route = createFileRoute('/')({
  component: Home,
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
  const { preferences, signedIn, status, retry, error } = usePreferences()

  const theme = themeByName(preferences.themeName)
  const { width, height } = useViewportSize()
  const seed = useMemo(() => seedPattern(), [])
  const [livePattern, setLivePattern] = useState<ReadonlyArray<PatternPoint>>(
    [],
  )

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

      {status === 'pending' || status === 'session-error' ? (
        <p
          role="status"
          className="absolute inset-x-0 top-1/2 text-center text-sm text-slate-500"
        >
          Loading your timer…
        </p>
      ) : (
        <TimerPanel
          pomodoroMinutes={preferences.pomoMinutes}
          showHours={preferences.showHours}
          canPersist={signedIn}
          onComplete={handleComplete}
          onPatternChange={setLivePattern}
        />
      )}
      {(status === 'error' || status === 'session-error') && (
        <div className="fixed inset-x-4 bottom-4 z-30 mx-auto max-w-md rounded-lg bg-white p-3 text-center text-sm shadow">
          <p>{error?.message ?? 'Could not synchronize your session.'}</p>
          <button type="button" className="mt-2 underline" onClick={retry}>
            Retry
          </button>
        </div>
      )}
    </div>
  )
}
