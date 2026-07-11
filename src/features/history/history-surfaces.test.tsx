import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import { HistoryCards } from './HistoryCards'
import { HistoryTable } from './HistoryTable'
import { TimeSummaryChart } from '#/features/charts/TimeSummaryChart'
import type { Entry } from '#/db/schema'

function entry(over: Partial<Entry> = {}): Entry {
  return {
    id: over.id ?? 'e1',
    userId: 'alice',
    title: over.title ?? 'Deep work',
    startTime: over.startTime ?? new Date('2026-01-01T10:00:00Z'),
    endTime: over.endTime ?? new Date('2026-01-01T10:25:00Z'),
    elapse: over.elapse ?? 1500,
    isPomodoro: over.isPomodoro ?? false,
    pattern: over.pattern ?? [
      [10, 2],
      [200, 50],
    ],
    createdAt: new Date('2026-01-01T10:25:00Z'),
  }
}

describe('HistoryCards', () => {
  it('renders a card per entry with title and duration', () => {
    const { getByText } = render(
      <HistoryCards entries={[entry({ title: 'Reading' })]} />,
    )
    expect(getByText('Reading')).toBeTruthy()
    expect(getByText(/25 mins/)).toBeTruthy()
  })

  it('shows an empty state', () => {
    const { getByText } = render(<HistoryCards entries={[]} />)
    expect(getByText(/no sessions recorded yet/i)).toBeTruthy()
  })
})

describe('HistoryTable', () => {
  it('renders rows and marks the Pomodoro type', () => {
    const { getByText } = render(
      <HistoryTable
        entries={[entry({ title: 'Focus', isPomodoro: true })]}
      />,
    )
    expect(getByText('Focus')).toBeTruthy()
    expect(getByText('Pomodoro')).toBeTruthy()
  })

  it('shows an empty state', () => {
    const { getByText } = render(<HistoryTable entries={[]} />)
    expect(getByText(/no sessions recorded yet/i)).toBeTruthy()
  })
})

describe('TimeSummaryChart', () => {
  it('renders the statistics shell with data', () => {
    const { getByText } = render(
      <TimeSummaryChart entries={[entry(), entry({ id: 'e2' })]} />,
    )
    expect(getByText('Recorder Events')).toBeTruthy()
    expect(getByText('Eaten Pomodoros')).toBeTruthy()
  })

  it('shows chart empty states', () => {
    const { getByText } = render(<TimeSummaryChart entries={[]} />)
    expect(getByText(/no recorded events for this range/i)).toBeTruthy()
    expect(getByText(/no pomodoros for this range/i)).toBeTruthy()
  })
})
