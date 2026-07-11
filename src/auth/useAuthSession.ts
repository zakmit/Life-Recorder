import { useCallback, useEffect, useState } from 'react'
import { AUTH_SESSION_CHANGE_EVENT, authClient } from './client'

export type ClientSession = {
  user: { id: string; name: string; email: string; image?: string | null }
} | null

/**
 * SSR-safe session accessor. Better Auth's `useSession` reads a nanostore via
 * React hooks that are not safe to call during server rendering, so we read
 * the session only after mount on the client. During SSR (and the first client
 * paint) the result is `{ session: null, isPending: true }`, then it resolves.
 *
 * This keeps the timer shell visible to anonymous and not-yet-hydrated visitors
 * without throwing during SSR.
 */
export function useAuthSession(): {
  session: ClientSession
  isPending: boolean
  error: Error | null
  retry: () => void
} {
  const [session, setSession] = useState<ClientSession>(null)
  const [isPending, setIsPending] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [attempt, setAttempt] = useState(0)
  const retry = useCallback(() => setAttempt((value) => value + 1), [])

  useEffect(() => {
    let active = true
    let request = 0
    const load = () => {
      const current = ++request
      setIsPending(true)
      setError(null)
      void authClient
        .getSession()
        .then((res) => {
          if (!active || current !== request) return
          if (res.error) {
            const message =
              typeof res.error === 'object' &&
              res.error !== null &&
              'message' in res.error &&
              typeof res.error.message === 'string'
                ? res.error.message
                : 'Session lookup failed'
            setSession(null)
            setError(new Error(message))
            return
          }
          setSession(res.data ?? null)
        })
        .catch((cause: unknown) => {
          if (!active || current !== request) return
          setSession(null)
          setError(
            cause instanceof Error ? cause : new Error('Session lookup failed'),
          )
        })
        .finally(() => {
          if (active && current === request) setIsPending(false)
        })
    }

    load()
    window.addEventListener(AUTH_SESSION_CHANGE_EVENT, load)
    return () => {
      window.removeEventListener(AUTH_SESSION_CHANGE_EVENT, load)
      active = false
    }
  }, [attempt])

  return { session, isPending, error, retry }
}
