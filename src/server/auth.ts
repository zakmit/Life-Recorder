import { getSessionUser } from '#/auth/session'
import type { SessionUser } from '#/auth/session'

/**
 * Error thrown when a protected server function is called without a valid
 * session. Server functions surface this as an authorization failure rather
 * than leaking data.
 */
export class UnauthorizedError extends Error {
  constructor(message = 'Authentication required') {
    super(message)
    this.name = 'UnauthorizedError'
  }
}

/**
 * Pure guard: given a possibly-null session user, return it or throw. Kept
 * separate from request access so it can be unit-tested without a Worker.
 */
export function assertUser(user: SessionUser | null): SessionUser {
  if (!user) throw new UnauthorizedError()
  return user
}

/**
 * Resolve and require the signed-in user for the current request. Throws
 * `UnauthorizedError` for anonymous or invalid sessions. The returned id is
 * the only trusted ownership key — never trust a client-supplied user id.
 */
export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser()
  return assertUser(user)
}
