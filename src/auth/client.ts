import { createAuthClient } from 'better-auth/react'

/**
 * Browser-side Better Auth client. Talks to the `/api/auth/*` route on the
 * same origin, so no baseURL is needed. Exposes session state and sign-in/out.
 */
export const authClient = createAuthClient()

export const AUTH_SESSION_CHANGE_EVENT = 'life-recorder:auth-session-change'

export const { signIn, useSession } = authClient

export async function signOut() {
  const result = await authClient.signOut()
  window.dispatchEvent(new Event(AUTH_SESSION_CHANGE_EVENT))
  return result
}
