/**
 * Pure timer state machine, decoupled from React and the DOM so it is fully
 * unit-testable. The UI drives it by dispatching actions on each 1s tick.
 *
 * Two modes:
 *  - normal: counts up from 0; the user ends it manually.
 *  - pomodoro: counts down from `pomodoroMinutes`; completes at 0.
 */

export type TimerMode = 'normal' | 'pomodoro'

export type TimerStatus = 'idle' | 'running' | 'paused' | 'completed'

export type TimerState = {
  mode: TimerMode
  status: TimerStatus
  /** Seconds counted up in normal mode (raw count). */
  elapsedSeconds: number
  /** Configured pomodoro length in minutes. */
  pomodoroMinutes: number
  title: string
  startedAt: number | null
}

export type TimerAction =
  | { type: 'setMode'; mode: TimerMode }
  | { type: 'setPomodoroMinutes'; minutes: number }
  | { type: 'setTitle'; title: string }
  | { type: 'start'; now: number }
  | { type: 'tick' }
  | { type: 'pause' }
  | { type: 'resume' }
  | { type: 'end' }
  | { type: 'reset' }

export function initialTimerState(
  pomodoroMinutes = 10,
): TimerState {
  return {
    mode: 'normal',
    status: 'idle',
    elapsedSeconds: 0,
    pomodoroMinutes,
    title: '',
    startedAt: null,
  }
}

/** Total seconds the entry represents, regardless of mode. */
export function elapsedForEntry(state: TimerState): number {
  if (state.mode === 'pomodoro') {
    return state.pomodoroMinutes * 60
  }
  return state.elapsedSeconds
}

/** Seconds remaining in pomodoro mode (0 in normal mode). */
export function remainingSeconds(state: TimerState): number {
  if (state.mode !== 'pomodoro') return 0
  return Math.max(0, state.pomodoroMinutes * 60 - state.elapsedSeconds)
}

/** Seconds shown on the clock face: counts down in pomodoro, up in normal. */
export function displaySeconds(state: TimerState): number {
  return state.mode === 'pomodoro'
    ? remainingSeconds(state)
    : state.elapsedSeconds
}

export function timerReducer(
  state: TimerState,
  action: TimerAction,
): TimerState {
  switch (action.type) {
    case 'setMode':
      if (state.status === 'running' || state.status === 'paused') return state
      return { ...state, mode: action.mode, elapsedSeconds: 0 }

    case 'setPomodoroMinutes':
      if (action.minutes <= 0) return state
      if (state.status === 'running' && state.mode === 'pomodoro') return state
      return { ...state, pomodoroMinutes: action.minutes }

    case 'setTitle':
      return { ...state, title: action.title }

    case 'start':
      return {
        ...state,
        status: 'running',
        elapsedSeconds: 0,
        startedAt: action.now,
      }

    case 'tick': {
      if (state.status !== 'running') return state
      const next = { ...state, elapsedSeconds: state.elapsedSeconds + 1 }
      if (next.mode === 'pomodoro' && remainingSeconds(next) <= 0) {
        return { ...next, status: 'completed' }
      }
      return next
    }

    case 'pause':
      if (state.status !== 'running') return state
      return { ...state, status: 'paused' }

    case 'resume':
      if (state.status !== 'paused') return state
      return { ...state, status: 'running' }

    case 'end':
      if (state.status === 'idle') return state
      return { ...state, status: 'completed' }

    case 'reset':
      return initialTimerState(state.pomodoroMinutes)

    default:
      return state
  }
}
