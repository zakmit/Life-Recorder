import { getSessionUser } from '#/auth/session'
import { assertUser } from './auth'
import type { SessionUser } from '#/auth/session'

/**
 * Resolve and require the signed-in user for the current request. Throws
 * `UnauthorizedError` for anonymous or invalid sessions. The returned id is
 * the only trusted ownership key — never trust a client-supplied user id.
 *
 * Server-only: this module reaches `@tanstack/react-start/server`, so it must
 * never be imported into client code. Server functions import it directly.
 */
export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser()
  return assertUser(user)
}
