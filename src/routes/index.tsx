import { createFileRoute } from '@tanstack/react-router'
import { TimerPanel } from '#/features/timer/TimerPanel'
import { useAuthSession } from '#/auth/useAuthSession'
import { createEntry } from '#/server/functions/entries'
import { AppNav } from '#/components/AppNav'
import type { CompletedTimer } from '#/features/timer/useTimer'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
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
          canRecord={signedIn && !isPending}
          onComplete={handleComplete}
        />
      </main>
    </div>
  )
}
