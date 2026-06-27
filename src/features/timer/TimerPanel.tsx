import { useState } from 'react'
import { useTimer } from './useTimer'
import { clockString } from './format'
import { displaySeconds } from './timer-state'
import { PatternCanvas } from '#/components/PatternCanvas'
import type { CompletedTimer } from './useTimer'

export type TimerPanelProps = {
  pomodoroMinutes?: number
  showHours?: boolean
  /** Whether completed sessions are persisted (true for signed-in users). */
  canPersist: boolean
  onComplete?: (entry: CompletedTimer) => void | Promise<void>
}

/**
 * The interactive timer surface. Client-only behavior (intervals, microphone,
 * canvas) is owned by `useTimer` and `PatternCanvas`; this component is the
 * shell. Anyone can run the timer; only signed-in users persist their sessions.
 */
export function TimerPanel({
  pomodoroMinutes = 10,
  showHours = true,
  canPersist,
  onComplete,
}: TimerPanelProps) {
  const [savedMsg, setSavedMsg] = useState<string | null>(null)
  const timer = useTimer({
    pomodoroMinutes,
    onComplete: async (entry) => {
      if (canPersist) {
        await onComplete?.(entry)
        setSavedMsg('Saved your session.')
      } else {
        setSavedMsg('Session finished. Sign in to save your history.')
      }
      timer.reset()
    },
  })

  const { state } = timer
  const running = state.status === 'running'
  const paused = state.status === 'paused'
  const active = running || paused

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-6 p-6">
      <div className="text-6xl font-mono tabular-nums">
        {clockString(displaySeconds(state), showHours)}
      </div>

      {!active && (
        <>
          <input
            className="w-full rounded border px-3 py-2"
            placeholder="What are you doing?"
            value={state.title}
            onChange={(e) => timer.setTitle(e.target.value)}
          />
          <div
            className="flex items-center gap-3"
            role="group"
            aria-label="Timer mode"
          >
            <button
              type="button"
              className={`rounded px-3 py-1 ${state.mode === 'normal' ? 'bg-slate-800 text-white' : 'bg-slate-200'}`}
              onClick={() => timer.setMode('normal')}
            >
              Timer
            </button>
            <button
              type="button"
              className={`rounded px-3 py-1 ${state.mode === 'pomodoro' ? 'bg-red-600 text-white' : 'bg-slate-200'}`}
              onClick={() => timer.setMode('pomodoro')}
            >
              Pomodoro
            </button>
          </div>
        </>
      )}

      {active && <div className="text-lg font-medium">{state.title || '—'}</div>}

      <div className="flex gap-3">
        {!active && (
          <button
            type="button"
            className="rounded bg-emerald-600 px-6 py-2 text-white"
            onClick={() => void timer.start()}
          >
            Start
          </button>
        )}
        {running && (
          <button
            type="button"
            className="rounded bg-amber-500 px-4 py-2 text-white"
            onClick={timer.pause}
          >
            Pause
          </button>
        )}
        {paused && (
          <button
            type="button"
            className="rounded bg-amber-500 px-4 py-2 text-white"
            onClick={timer.resume}
          >
            Continue
          </button>
        )}
        {active && (
          <button
            type="button"
            className="rounded bg-slate-700 px-4 py-2 text-white"
            onClick={timer.end}
          >
            End
          </button>
        )}
      </div>

      {!canPersist && !active && (
        <p className="text-sm text-slate-500">
          You can try the timer now. Sign in to save your sessions to history.
        </p>
      )}

      {savedMsg && !active && (
        <p className="text-sm text-emerald-600">{savedMsg}</p>
      )}

      <PatternCanvas pattern={timer.pattern} width={300} height={200} />
    </div>
  )
}
