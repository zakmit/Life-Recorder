import { useEffect, useState } from 'react'
import { authClient } from './client'

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
} {
  const [session, setSession] = useState<ClientSession>(null)
  const [isPending, setIsPending] = useState(true)

  useEffect(() => {
    let active = true
    authClient
      .getSession()
      .then((res) => {
        if (!active) return
        setSession((res.data as ClientSession) ?? null)
      })
      .finally(() => {
        if (active) setIsPending(false)
      })
    return () => {
      active = false
    }
  }, [])

  return { session, isPending }
}
