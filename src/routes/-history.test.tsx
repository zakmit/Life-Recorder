import { fireEvent, render, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { HistoryPage } from './history'

type PreferenceState = {
  status: 'anonymous' | 'authenticated' | 'pending' | 'error'
  user: { id: string; name: string; email: string } | undefined
  retry: () => void
}

const preferenceState = vi.hoisted(
  (): PreferenceState => ({
    status: 'anonymous',
    user: undefined as { id: string; name: string; email: string } | undefined,
    retry: vi.fn(),
  }),
)
const getAllEntries = vi.hoisted(() => vi.fn())

vi.mock('#/features/settings/PreferencesProvider', () => ({
  usePreferences: () => preferenceState,
}))
vi.mock('#/server/functions/entries', () => ({ getAllEntries }))
vi.mock('#/components/BurgerNav', () => ({ BurgerNav: () => null }))
vi.mock('#/components/PatternCanvas', () => ({ PatternCanvas: () => null }))

describe('HistoryPage', () => {
  beforeEach(() => {
    preferenceState.status = 'anonymous'
    preferenceState.user = undefined
    vi.clearAllMocks()
  })

  it('shows demo sessions while signed out', () => {
    const view = render(<HistoryPage />)
    expect(
      view.getByText('Demo history — sign in to see your recorded sessions.'),
    ).toBeTruthy()
    expect(view.getByText('Deep work')).toBeTruthy()
    expect(getAllEntries).not.toHaveBeenCalled()
  })

  it('shows the real empty state for a signed-in user with no entries', async () => {
    preferenceState.status = 'authenticated'
    preferenceState.user = { id: 'alice', name: 'Alice', email: 'a@test.dev' }
    getAllEntries.mockResolvedValue([])
    const view = render(<HistoryPage />)
    await waitFor(() =>
      expect(view.getByText(/no sessions recorded yet/i)).toBeTruthy(),
    )
    expect(view.queryByText('Deep work')).toBeNull()
  })

  it('never shows the prior account entries when the next account fetch fails', async () => {
    preferenceState.status = 'authenticated'
    preferenceState.user = { id: 'alice', name: 'Alice', email: 'a@test.dev' }
    getAllEntries.mockResolvedValueOnce([
      {
        id: 'alice-entry',
        userId: 'alice',
        title: 'Alice private work',
        startTime: new Date('2026-01-01T00:00:00Z'),
        endTime: new Date('2026-01-01T00:10:00Z'),
        elapse: 600,
        isPomodoro: false,
        pattern: [[10, 2]],
        createdAt: new Date('2026-01-01T00:10:00Z'),
      },
    ])
    const view = render(<HistoryPage />)
    await waitFor(() =>
      expect(view.getByText('Alice private work')).toBeTruthy(),
    )

    preferenceState.user = { id: 'bob', name: 'Bob', email: 'b@test.dev' }
    getAllEntries.mockRejectedValueOnce(new Error('History unavailable'))
    view.rerender(<HistoryPage />)
    await waitFor(() => expect(view.getByRole('alert')).toBeTruthy())
    expect(view.queryByText('Alice private work')).toBeNull()

    getAllEntries.mockResolvedValueOnce([])
    fireEvent.click(view.getByRole('button', { name: 'Retry' }))
    await waitFor(() =>
      expect(view.getByText(/no sessions recorded yet/i)).toBeTruthy(),
    )
  })
})
