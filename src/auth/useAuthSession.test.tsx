import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AUTH_SESSION_CHANGE_EVENT } from './client'
import { useAuthSession } from './useAuthSession'

const getSession = vi.hoisted(() => vi.fn())

vi.mock('./client', () => ({
  AUTH_SESSION_CHANGE_EVENT: 'life-recorder:auth-session-change',
  authClient: { getSession },
}))

function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((done) => {
    resolve = done
  })
  return { promise, resolve }
}

describe('useAuthSession', () => {
  beforeEach(() => vi.clearAllMocks())

  it('keeps a resolved Better Auth error distinct from anonymous', async () => {
    getSession.mockResolvedValue({
      data: null,
      error: { message: 'Unavailable' },
    })
    const { result } = renderHook(() => useAuthSession())
    await waitFor(() => expect(result.current.isPending).toBe(false))
    expect(result.current.session).toBeNull()
    expect(result.current.error?.message).toBe('Unavailable')
  })

  it('ignores an older lookup that resolves after an auth-change lookup', async () => {
    const first = deferred<{ data: null; error: null }>()
    const second = deferred<{
      data: { user: { id: string; name: string; email: string } }
      error: null
    }>()
    getSession
      .mockReturnValueOnce(first.promise)
      .mockReturnValueOnce(second.promise)
    const { result } = renderHook(() => useAuthSession())

    act(() => window.dispatchEvent(new Event(AUTH_SESSION_CHANGE_EVENT)))
    second.resolve({
      data: { user: { id: 'bob', name: 'Bob', email: 'bob@test.dev' } },
      error: null,
    })
    await waitFor(() => expect(result.current.session?.user.id).toBe('bob'))

    first.resolve({ data: null, error: null })
    await act(async () => first.promise)
    expect(result.current.session?.user.id).toBe('bob')
  })
})
