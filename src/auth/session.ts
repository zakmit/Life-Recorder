import { getRequestHeaders } from '@tanstack/react-start/server'
import { createAuth } from './config'

export type SessionUser = {
  id: string
  email: string
  name: string
  image: string | null
}

/**
 * Resolve the signed-in user from the request's session cookie, or null when
 * the request is anonymous or the session is invalid/expired.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const auth = createAuth()
  const headers = getRequestHeaders() as unknown as Headers
  const session = await auth.api.getSession({ headers })
  if (!session?.user) return null
  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    image: session.user.image ?? null,
  }
}
