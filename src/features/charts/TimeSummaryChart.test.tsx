import { fireEvent, render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { TimeSummaryChart } from './TimeSummaryChart'
import type { Entry } from '#/db/schema'

function entry(over: Partial<Entry>): Entry {
  const startTime = over.startTime ?? new Date(2026, 0, 2, 10)
  return {
    id: over.id ?? String(startTime.getTime()),
    userId: 'alice',
    title: over.title ?? 'Deep work',
    startTime,
    endTime: over.endTime ?? new Date(startTime.getTime() + 600_000),
    elapse: over.elapse ?? 600,
    isPomodoro: over.isPomodoro ?? false,
    pattern: over.pattern ?? [[10, 2]],
    createdAt: over.createdAt ?? startTime,
  }
}

const entries = [
  entry({
    id: 'jan-1',
    title: 'Reading',
    startTime: new Date(2026, 0, 1, 10),
    elapse: 600,
    isPomodoro: true,
  }),
  entry({
    id: 'jan-2',
    startTime: new Date(2026, 0, 2, 10),
    elapse: 1200,
  }),
]

describe('TimeSummaryChart', () => {
  it('updates every summary when a different day is selected', () => {
    const view = render(<TimeSummaryChart entries={entries} />)

    expect(view.getByText(/20 mins have been tracked/i)).toBeTruthy()
    expect(view.getByText(/there is 1 timer/i)).toBeTruthy()
    expect(view.getByText(/you have completed 0 pomodoro timers/i)).toBeTruthy()

    const firstDay = view.container.querySelector<HTMLButtonElement>(
      'button[data-day="1/1/2026"]',
    )
    expect(firstDay).toBeTruthy()
    fireEvent.click(firstDay!)

    expect(view.getByText(/10 mins have been tracked/i)).toBeTruthy()
    expect(view.getByText(/you have completed 1 pomodoro timer/i)).toBeTruthy()
  })

  it('supports every legacy period mode with the applicable selector', () => {
    const view = render(<TimeSummaryChart entries={entries} />)

    fireEvent.click(view.getByRole('button', { name: 'Week' }))
    expect(view.getByText(/30 mins have been tracked/i)).toBeTruthy()

    fireEvent.click(view.getByRole('button', { name: 'Month' }))
    expect(view.getByLabelText('Select month')).toBeTruthy()

    fireEvent.click(view.getByRole('button', { name: 'Year' }))
    expect(view.getByLabelText('Select year')).toBeTruthy()

    fireEvent.click(view.getByRole('button', { name: 'Custom' }))
    expect(view.getByText('Choose a start and end date')).toBeTruthy()
  })

  it('renders accessible charts and informative empty states', () => {
    const populated = render(<TimeSummaryChart entries={entries} />)
    fireEvent.click(populated.getByRole('button', { name: 'Week' }))
    expect(
      populated.getByRole('img', { name: 'Recorded events chart' }),
    ).toBeTruthy()
    expect(
      populated.getByRole('img', { name: 'Pomodoro count chart' }),
    ).toBeTruthy()
    populated.unmount()

    const empty = render(<TimeSummaryChart entries={[]} />)
    expect(empty.getByText('No recorded events for this range.')).toBeTruthy()
    expect(empty.getByText('No Pomodoros for this range.')).toBeTruthy()
  })
})
