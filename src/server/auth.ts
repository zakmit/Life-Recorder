import type { SessionUser } from '#/auth/session'

/**
 * Client-safe auth primitives. This module deliberately imports no server-only
 * code so it can be referenced from route loaders and components (e.g. to catch
 * `UnauthorizedError`). The request-bound `requireUser` lives in
 * `auth.server.ts`.
 */

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
