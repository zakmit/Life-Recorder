import { describe, expect, it, beforeEach, vi } from 'vitest'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { PreferencesProvider, usePreferences } from './PreferencesProvider'
import { DEFAULT_FORM } from './preferences-schema'

const authState = vi.hoisted(() => ({
  session: null as { user: { id: string; name: string; email: string } } | null,
  isPending: false,
  error: null as Error | null,
  retry: vi.fn(),
}))
const api = vi.hoisted(() => ({
  fetchPreferences: vi.fn(),
  initializePreferencesIfAbsent: vi.fn(),
  savePreferences: vi.fn(),
}))

vi.mock('#/auth/useAuthSession', () => ({ useAuthSession: () => authState }))
vi.mock('./preferences-client', () => api)

function Probe() {
  const value = usePreferences()
  return (
    <div>
      <span data-testid="status">{value.status}</span>
      <span data-testid="minutes">{value.preferences.pomoMinutes}</span>
      <button
        type="button"
        onClick={() => {
          void value
            .save({ ...value.preferences, pomoMinutes: 30 })
            .catch(() => undefined)
        }}
      >
        Save 30
      </button>
    </div>
  )
}

function renderProvider() {
  return render(
    <PreferencesProvider>
      <Probe />
    </PreferencesProvider>,
  )
}

function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((done) => {
    resolve = done
  })
  return { promise, resolve }
}

describe('PreferencesProvider', () => {
  beforeEach(() => {
    const values = new Map<string, string>()
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: {
        getItem: (key: string) => values.get(key) ?? null,
        setItem: (key: string, value: string) => values.set(key, value),
        removeItem: (key: string) => values.delete(key),
        clear: () => values.clear(),
      },
    })
    authState.session = null
    authState.isPending = false
    authState.error = null
    vi.clearAllMocks()
  })

  it('hydrates and saves anonymous preferences locally', async () => {
    window.localStorage.setItem(
      'life-recorder:preferences',
      JSON.stringify({
        version: 1,
        preferences: { ...DEFAULT_FORM, pomoMinutes: 20 },
      }),
    )
    const view = renderProvider()
    await waitFor(() =>
      expect(view.getByTestId('minutes').textContent).toBe('20'),
    )
    fireEvent.click(view.getByRole('button', { name: 'Save 30' }))
    await waitFor(() =>
      expect(view.getByTestId('minutes').textContent).toBe('30'),
    )
    expect(api.savePreferences).not.toHaveBeenCalled()
  })

  it('uses existing server preferences and replaces the local copy', async () => {
    authState.session = {
      user: { id: 'alice', name: 'Alice', email: 'a@test.dev' },
    }
    api.fetchPreferences.mockResolvedValue({
      present: true,
      preferences: { ...DEFAULT_FORM, userId: 'alice', pomoMinutes: 45 },
    })
    const view = renderProvider()
    await waitFor(() =>
      expect(view.getByTestId('minutes').textContent).toBe('45'),
    )
    expect(api.initializePreferencesIfAbsent).not.toHaveBeenCalled()
    expect(window.localStorage.getItem('life-recorder:preferences')).toContain(
      '45',
    )
  })

  it('initializes a missing server row from local preferences', async () => {
    authState.session = {
      user: { id: 'new', name: 'New', email: 'n@test.dev' },
    }
    window.localStorage.setItem(
      'life-recorder:preferences',
      JSON.stringify({
        version: 1,
        preferences: { ...DEFAULT_FORM, pomoMinutes: 35 },
      }),
    )
    api.fetchPreferences.mockResolvedValue({ present: false })
    api.initializePreferencesIfAbsent.mockResolvedValue({
      ...DEFAULT_FORM,
      userId: 'new',
      pomoMinutes: 35,
    })
    const view = renderProvider()
    await waitFor(() =>
      expect(view.getByTestId('minutes').textContent).toBe('35'),
    )
    expect(api.initializePreferencesIfAbsent).toHaveBeenCalledWith(
      expect.objectContaining({ pomoMinutes: 35 }),
    )
  })

  it('does not treat a session lookup error as anonymous', async () => {
    authState.error = new Error('Session unavailable')
    const view = renderProvider()
    await waitFor(() =>
      expect(view.getByTestId('status').textContent).toBe('session-error'),
    )
    expect(api.fetchPreferences).not.toHaveBeenCalled()
  })

  it('ignores a signed-in save that resolves after logout', async () => {
    authState.session = {
      user: { id: 'alice', name: 'Alice', email: 'a@test.dev' },
    }
    api.fetchPreferences.mockResolvedValue({
      present: true,
      preferences: { ...DEFAULT_FORM, userId: 'alice', pomoMinutes: 10 },
    })
    const saving = deferred<typeof DEFAULT_FORM & { userId: string }>()
    api.savePreferences.mockReturnValue(saving.promise)
    const view = renderProvider()
    await waitFor(() =>
      expect(view.getByTestId('status').textContent).toBe('authenticated'),
    )

    fireEvent.click(view.getByRole('button', { name: 'Save 30' }))
    await waitFor(() => expect(api.savePreferences).toHaveBeenCalled())
    authState.session = null
    view.rerender(
      <PreferencesProvider>
        <Probe />
      </PreferencesProvider>,
    )
    await waitFor(() =>
      expect(view.getByTestId('status').textContent).toBe('anonymous'),
    )

    saving.resolve({ ...DEFAULT_FORM, userId: 'alice', pomoMinutes: 30 })
    await saving.promise
    await waitFor(() =>
      expect(view.getByTestId('minutes').textContent).toBe('10'),
    )
  })
})
