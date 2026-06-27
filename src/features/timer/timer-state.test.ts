import { describe, expect, it } from 'vitest'
import {
  displaySeconds,
  elapsedForEntry,
  initialTimerState,
  remainingSeconds,
  timerReducer,
} from './timer-state'
import type { TimerState } from './timer-state'

function run(state: TimerState, actions: Parameters<typeof timerReducer>[1][]) {
  return actions.reduce(timerReducer, state)
}

describe('timerReducer', () => {
  it('starts a normal timer running from zero', () => {
    const s = run(initialTimerState(), [{ type: 'start', now: 1000 }])
    expect(s.status).toBe('running')
    expect(s.elapsedSeconds).toBe(0)
    expect(s.startedAt).toBe(1000)
  })

  it('counts up on each tick in normal mode', () => {
    const s = run(initialTimerState(), [
      { type: 'start', now: 0 },
      { type: 'tick' },
      { type: 'tick' },
      { type: 'tick' },
    ])
    expect(s.elapsedSeconds).toBe(3)
    expect(displaySeconds(s)).toBe(3)
    expect(elapsedForEntry(s)).toBe(3)
    expect(s.status).toBe('running')
  })

  it('does not tick while paused, resumes correctly', () => {
    let s = run(initialTimerState(), [
      { type: 'start', now: 0 },
      { type: 'tick' },
      { type: 'pause' },
      { type: 'tick' },
      { type: 'tick' },
    ])
    expect(s.elapsedSeconds).toBe(1)
    expect(s.status).toBe('paused')
    s = run(s, [{ type: 'resume' }, { type: 'tick' }])
    expect(s.elapsedSeconds).toBe(2)
    expect(s.status).toBe('running')
  })

  it('ends a normal timer manually with the elapsed seconds preserved', () => {
    const s = run(initialTimerState(), [
      { type: 'start', now: 0 },
      { type: 'tick' },
      { type: 'tick' },
      { type: 'end' },
    ])
    expect(s.status).toBe('completed')
    expect(elapsedForEntry(s)).toBe(2)
  })

  it('counts down and completes a pomodoro at zero', () => {
    let s = run(initialTimerState(1), [
      { type: 'setMode', mode: 'pomodoro' },
      { type: 'start', now: 0 },
    ])
    expect(remainingSeconds(s)).toBe(60)
    for (let i = 0; i < 60; i++) s = timerReducer(s, { type: 'tick' })
    expect(s.status).toBe('completed')
    expect(remainingSeconds(s)).toBe(0)
    // Pomodoro entries record the full configured length.
    expect(elapsedForEntry(s)).toBe(60)
  })

  it('reports the pomodoro flag through elapsedForEntry/mode', () => {
    const normal = run(initialTimerState(), [{ type: 'start', now: 0 }])
    expect(normal.mode).toBe('normal')
    const pomo = run(initialTimerState(5), [
      { type: 'setMode', mode: 'pomodoro' },
    ])
    expect(pomo.mode).toBe('pomodoro')
  })

  it('locks mode changes while running', () => {
    const s = run(initialTimerState(), [
      { type: 'start', now: 0 },
      { type: 'setMode', mode: 'pomodoro' },
    ])
    expect(s.mode).toBe('normal')
  })

  it('rejects non-positive pomodoro minutes', () => {
    const s = timerReducer(initialTimerState(10), {
      type: 'setPomodoroMinutes',
      minutes: 0,
    })
    expect(s.pomodoroMinutes).toBe(10)
  })

  it('reset returns to idle keeping the configured pomodoro length', () => {
    const s = run(initialTimerState(25), [
      { type: 'setMode', mode: 'pomodoro' },
      { type: 'start', now: 0 },
      { type: 'tick' },
      { type: 'reset' },
    ])
    expect(s.status).toBe('idle')
    expect(s.pomodoroMinutes).toBe(25)
    expect(s.elapsedSeconds).toBe(0)
  })
})
