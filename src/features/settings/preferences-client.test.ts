import { describe, expect, it, vi } from 'vitest'
import {
  getPreferences,
  initializePreferences,
} from '#/server/functions/preferences'
import {
  fetchPreferences,
  initializePreferencesIfAbsent,
} from './preferences-client'
import { DEFAULT_FORM } from './preferences-schema'

vi.mock('#/server/functions/preferences', () => ({
  getPreferences: vi.fn(),
  initializePreferences: vi.fn(),
  updatePreferences: vi.fn(),
}))

describe('preferences client', () => {
  it('preserves an absent preference result', async () => {
    vi.mocked(getPreferences).mockResolvedValueOnce({ present: false })

    await expect(fetchPreferences()).resolves.toEqual({ present: false })
  })

  it('preserves a present row even when it contains defaults', async () => {
    vi.mocked(getPreferences).mockResolvedValueOnce({
      present: true,
      preferences: { userId: 'alice', ...DEFAULT_FORM, updatedAt: new Date(0) },
    })

    await expect(fetchPreferences()).resolves.toMatchObject({
      present: true,
      preferences: DEFAULT_FORM,
    })
  })

  it('forwards initialization without a client-selectable user id', async () => {
    const canonical = {
      userId: 'alice',
      ...DEFAULT_FORM,
      updatedAt: new Date(0),
    }
    vi.mocked(initializePreferences).mockResolvedValueOnce(canonical)

    await expect(initializePreferencesIfAbsent(DEFAULT_FORM)).resolves.toEqual(
      canonical,
    )
    expect(initializePreferences).toHaveBeenCalledWith({ data: DEFAULT_FORM })
  })
})
