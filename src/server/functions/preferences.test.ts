import { beforeEach, describe, expect, it, vi } from 'vitest'
import { requireUser } from '#/server/auth.server'
import { getRepositories } from '#/server/repositories'
import {
  initializePreferencesForSession,
  readPreferencesForSession,
  updatePreferencesForSession,
} from './preferences.handlers.server'

vi.mock('#/server/auth.server', () => ({ requireUser: vi.fn() }))
vi.mock('#/server/repositories', () => ({
  DEFAULT_PREFERENCES: {
    themeName: 'Seashore[Blue]',
    pomoMinutes: 10,
    showHours: true,
  },
  getRepositories: vi.fn(),
}))

describe('preference server functions', () => {
  const repository = {
    lookup: vi.fn(),
    initializeIfAbsent: vi.fn(),
    upsert: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getRepositories).mockReturnValue({
      preferences: repository,
    } as never)
  })

  it('returns absent and present lookup results without conflating defaults', async () => {
    vi.mocked(requireUser).mockResolvedValue({ id: 'alice' } as never)
    repository.lookup
      .mockResolvedValueOnce({ present: false })
      .mockResolvedValueOnce({
        present: true,
        preferences: { userId: 'alice', pomoMinutes: 10 },
      })

    await expect(readPreferencesForSession()).resolves.toEqual({
      present: false,
    })
    await expect(readPreferencesForSession()).resolves.toMatchObject({
      present: true,
    })
    expect(repository.lookup).toHaveBeenNthCalledWith(1, 'alice')
    expect(repository.lookup).toHaveBeenNthCalledWith(2, 'alice')
  })

  it.each([
    ['read', () => readPreferencesForSession()],
    [
      'initialize',
      () =>
        initializePreferencesForSession({
          data: {
            themeName: 'Seashore',
            pomoMinutes: 25,
            showHours: false,
          },
        }),
    ],
    [
      'write',
      () => updatePreferencesForSession({ data: { pomoMinutes: 25 } }),
    ],
  ])('rejects anonymous %s before repository access', async (_name, invoke) => {
    const unauthorized = new Error('Unauthorized')
    vi.mocked(requireUser).mockRejectedValue(unauthorized)

    await expect(invoke()).rejects.toBe(unauthorized)
    expect(getRepositories).not.toHaveBeenCalled()
  })

  it('derives initialization ownership from the session', async () => {
    vi.mocked(requireUser).mockResolvedValue({ id: 'alice' } as never)
    repository.initializeIfAbsent.mockResolvedValue({ userId: 'alice' })

    await initializePreferencesForSession({
      data: {
        themeName: 'Seashore',
        pomoMinutes: 25,
        showHours: false,
      },
    })

    expect(repository.initializeIfAbsent).toHaveBeenCalledWith('alice', {
      themeName: 'Seashore',
      pomoMinutes: 25,
      showHours: false,
    })
  })
})
