import { describe, expect, it } from 'vitest'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { TimerPanel } from './TimerPanel'

describe('TimerPanel', () => {
  it('renders the idle state: clock, task input, mode switch, Start', () => {
    const { getByPlaceholderText, getByRole, getByText } = render(
      <TimerPanel canPersist pomodoroMinutes={10} />,
    )
    expect(getByText(/00:00:00/)).toBeTruthy()
    expect(getByPlaceholderText('What are you doing?')).toBeTruthy()
    expect(getByRole('switch', { name: /pomodoro/i })).toBeTruthy()
    expect(getByRole('button', { name: 'Start' })).toBeTruthy()
  })

  it('toggles between Timer and Pomodoro via the switch', () => {
    const { getByRole } = render(<TimerPanel canPersist pomodoroMinutes={5} />)
    const sw = getByRole('switch', { name: /pomodoro/i })
    expect(sw.getAttribute('aria-checked')).toBe('false')
    fireEvent.click(sw)
    expect(sw.getAttribute('aria-checked')).toBe('true')
  })

  it('shows running controls (Pause/End) after Start', async () => {
    const { getByRole, queryByRole } = render(
      <TimerPanel canPersist pomodoroMinutes={5} />,
    )
    fireEvent.click(getByRole('button', { name: 'Start' }))
    // start() awaits the (absent) audio analyser before entering running state.
    await waitFor(() =>
      expect(getByRole('button', { name: 'End' })).toBeTruthy(),
    )
    expect(getByRole('button', { name: 'Pause' })).toBeTruthy()
    expect(queryByRole('button', { name: 'Start' })).toBeNull()
  })

  it('shows the sign-in hint for anonymous users', () => {
    const { getByText } = render(<TimerPanel canPersist={false} />)
    expect(getByText(/sign in to save your sessions/i)).toBeTruthy()
  })

  it('still lets anonymous users start the timer', () => {
    const { getByRole } = render(<TimerPanel canPersist={false} />)
    const start = getByRole('button', { name: 'Start' })
    expect(start.hasAttribute('disabled')).toBe(false)
  })
})
