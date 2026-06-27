import { useCallback, useEffect, useReducer, useRef, useState } from 'react'
import {
  elapsedForEntry,
  initialTimerState,
  timerReducer,
} from './timer-state'
import { createAudioAnalyser } from '#/features/audio/audio-analyser'
import { randomPatternPoint } from '#/features/audio/pattern'
import type { AudioAnalyser } from '#/features/audio/audio-analyser'
import type { PatternPoint } from '#/features/audio/pattern'
import type { TimerState } from './timer-state'

export type CompletedTimer = {
  title: string
  startTime: Date
  endTime: Date
  elapse: number
  isPomodoro: boolean
  pattern: Array<PatternPoint>
}

export type UseTimerOptions = {
  pomodoroMinutes?: number
  /** Called when a normal timer is ended or a pomodoro completes. */
  onComplete?: (entry: CompletedTimer) => void
}

/**
 * React hook binding the pure timer reducer to a 1s interval and microphone
 * sampling. Browser-only concerns (intervals, AudioContext) live here; the
 * reducer stays pure. The completion callback fires with processed pattern
 * data only — never raw audio.
 */
export function useTimer(options: UseTimerOptions = {}) {
  const [state, dispatch] = useReducer(
    timerReducer,
    initialTimerState(options.pomodoroMinutes ?? 10),
  )
  const [pattern, setPattern] = useState<Array<PatternPoint>>([])

  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const analyserRef = useRef<AudioAnalyser | null>(null)
  const samplingRef = useRef(false)
  const stateRef = useRef<TimerState>(state)
  stateRef.current = state

  const onCompleteRef = useRef(options.onComplete)
  onCompleteRef.current = options.onComplete

  const clearTick = useCallback(() => {
    if (tickRef.current) {
      clearInterval(tickRef.current)
      tickRef.current = null
    }
  }, [])

  const closeAudio = useCallback(() => {
    analyserRef.current?.close()
    analyserRef.current = null
  }, [])

  // Capture one processed pattern point; falls back to random data without mic.
  const captureSample = useCallback(async () => {
    if (samplingRef.current) return
    samplingRef.current = true
    try {
      const analyser = analyserRef.current
      const point = analyser
        ? await analyser.sample()
        : randomPatternPoint()
      setPattern((prev) => [...prev, point])
    } finally {
      samplingRef.current = false
    }
  }, [])

  const finish = useCallback(
    (final: TimerState, finalPattern: Array<PatternPoint>) => {
      clearTick()
      closeAudio()
      onCompleteRef.current?.({
        title: final.title,
        startTime: new Date(final.startedAt ?? Date.now()),
        endTime: new Date(),
        elapse: elapsedForEntry(final),
        isPomodoro: final.mode === 'pomodoro',
        pattern: finalPattern,
      })
    },
    [clearTick, closeAudio],
  )

  const start = useCallback(async () => {
    setPattern([])
    analyserRef.current = await createAudioAnalyser()
    dispatch({ type: 'start', now: Date.now() })
  }, [])

  // Drive ticks and sampling cadence while running.
  useEffect(() => {
    if (state.status !== 'running') {
      clearTick()
      return
    }
    tickRef.current = setInterval(() => {
      const current = stateRef.current
      const elapsed = current.elapsedSeconds + 1
      // Sample roughly every 20s of activity (mirrors legacy cadence).
      if (elapsed % 20 === 0) void captureSample()
      dispatch({ type: 'tick' })
    }, 1000)
    return clearTick
  }, [state.status, captureSample, clearTick])

  // When the reducer reaches 'completed', flush the entry once.
  const completedRef = useRef(false)
  useEffect(() => {
    if (state.status === 'completed' && !completedRef.current) {
      completedRef.current = true
      finish(state, pattern)
    }
    if (state.status === 'idle' || state.status === 'running') {
      completedRef.current = false
    }
  }, [state, pattern, finish])

  useEffect(() => {
    return () => {
      clearTick()
      closeAudio()
    }
  }, [clearTick, closeAudio])

  return {
    state,
    pattern,
    start,
    pause: () => dispatch({ type: 'pause' }),
    resume: () => dispatch({ type: 'resume' }),
    end: () => dispatch({ type: 'end' }),
    reset: () => {
      clearTick()
      closeAudio()
      setPattern([])
      dispatch({ type: 'reset' })
    },
    setMode: (mode: TimerState['mode']) => dispatch({ type: 'setMode', mode }),
    setTitle: (title: string) => dispatch({ type: 'setTitle', title }),
    setPomodoroMinutes: (minutes: number) =>
      dispatch({ type: 'setPomodoroMinutes', minutes }),
  }
}
