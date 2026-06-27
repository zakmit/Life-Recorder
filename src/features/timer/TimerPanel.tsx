import { useEffect, useState } from 'react'
import { useTimer } from './useTimer'
import { clockString } from './format'
import { displaySeconds } from './timer-state'
import type { PatternPoint } from '#/features/audio/pattern'
import type { CompletedTimer } from './useTimer'

export type TimerPanelProps = {
  pomodoroMinutes?: number
  showHours?: boolean
  /** Whether completed sessions are persisted (true for signed-in users). */
  canPersist: boolean
  onComplete?: (entry: CompletedTimer) => void | Promise<void>
  /** Lifts the live pattern to the parent so it can drive the background spiral. */
  onPatternChange?: (pattern: ReadonlyArray<PatternPoint>) => void
}

// Legacy palette (Time.scss): timer yellow / pomodoro red.
const TIMER_YELLOW = 'rgb(255, 218, 8)'
const POMODORO_RED = 'rgb(224, 41, 41)'

/**
 * Mode toggle, native replacement for the legacy `react-switch`. Off (left) =
 * Timer with a yellow knob track; on (right) = Pomodoro with a red track,
 * mirroring the legacy `offColor`/`onColor`.
 */
function ModeSwitch({
  pomodoro,
  onChange,
}: {
  pomodoro: boolean
  onChange: (pomodoro: boolean) => void
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={pomodoro}
      aria-label="Toggle Pomodoro mode"
      onClick={() => onChange(!pomodoro)}
      className="relative inline-flex h-[35px] w-[90px] items-center rounded-full transition-colors"
      style={{ backgroundColor: pomodoro ? POMODORO_RED : TIMER_YELLOW }}
    >
      <span
        className="inline-block h-[30px] w-[30px] rounded-full bg-white shadow transition-transform"
        style={{ transform: pomodoro ? 'translateX(57px)' : 'translateX(3px)' }}
      />
    </button>
  )
}

/**
 * The interactive timer surface, matching the 2019 Main screen. The spiral
 * background is owned by the parent route; this is the centered overlay. Client-
 * only behavior (intervals, microphone) lives in `useTimer`. Anyone can run the
 * timer; only signed-in users persist their sessions.
 */
export function TimerPanel({
  pomodoroMinutes = 10,
  showHours = true,
  canPersist,
  onComplete,
  onPatternChange,
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

  // Surface the live pattern to the parent so the background spiral updates.
  useEffect(() => {
    onPatternChange?.(timer.pattern)
  }, [timer.pattern, onPatternChange])

  const { state } = timer
  const running = state.status === 'running'
  const paused = state.status === 'paused'
  const active = running || paused

  return (
    <div
      className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
      style={{ fontWeight: 200 }}
    >
      {/* Clock — thin numerals (legacy .TimeDiv 5em font-weight 100). */}
      <div
        className="flex items-center tabular-nums leading-none"
        style={{
          fontSize: active ? 'var(--text-clock-running)' : 'var(--text-clock)',
          fontWeight: 100,
        }}
      >
        {clockString(displaySeconds(state), showHours)}
      </div>

      {!active && (
        <div className="mt-2 flex flex-col items-center gap-4">
          <input
            className="text-center outline-none"
            style={{
              border: '0.01em solid rgb(167, 172, 173)',
              minWidth: 220,
              width: '10em',
              padding: '0.12em',
              fontSize: '1.2em',
              fontWeight: 200,
            }}
            placeholder="What are you doing?"
            value={state.title}
            onChange={(e) => timer.setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') void timer.start()
            }}
          />

          {/* Timer ⟷ Pomodoro row (legacy .clockType: width 10em, 1.2em). */}
          <div
            className="flex items-center justify-between"
            style={{ width: '10em', minWidth: 220, fontSize: '1.2em' }}
          >
            <span>Timer</span>
            <ModeSwitch
              pomodoro={state.mode === 'pomodoro'}
              onChange={(pomo) => timer.setMode(pomo ? 'pomodoro' : 'normal')}
            />
            <span>Pomodoro</span>
          </div>

          {/* Start bar (legacy @mixin startTimer + .startNorTimer/.startPomoTimer). */}
          <button
            type="button"
            onClick={() => void timer.start()}
            style={{
              minWidth: 225,
              width: '10.1em',
              fontSize: '1.2em',
              fontWeight: 200,
              border: 'none',
              padding: '0.1em 0',
              transition: '.4s',
              backgroundColor:
                state.mode === 'pomodoro' ? POMODORO_RED : TIMER_YELLOW,
              color: state.mode === 'pomodoro' ? 'white' : 'inherit',
            }}
          >
            Start
          </button>

          {!canPersist && (
            <p className="max-w-[16em] text-center text-sm text-slate-500">
              You can try the timer now. Sign in to save your sessions to history.
            </p>
          )}
          {savedMsg && (
            <p className="text-sm text-emerald-600">{savedMsg}</p>
          )}
        </div>
      )}

      {active && (
        <div className="mt-4 flex flex-col items-center gap-4">
          <div
            style={{ fontWeight: 300, fontSize: 'var(--text-task)' }}
            className="text-center"
          >
            {state.title || '—'}
          </div>
          {/* Controls (legacy .TimerControll: space-between, thin, hover-underline). */}
          <div className="flex items-center gap-8" style={{ fontWeight: 100 }}>
            {running && (
              <button
                type="button"
                className="bg-transparent hover:text-slate-600"
                onClick={timer.pause}
              >
                Pause
              </button>
            )}
            {paused && (
              <button
                type="button"
                className="bg-transparent hover:text-slate-600"
                onClick={timer.resume}
              >
                Continue
              </button>
            )}
            <button
              type="button"
              className="bg-transparent hover:text-slate-600"
              onClick={timer.end}
            >
              End
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
