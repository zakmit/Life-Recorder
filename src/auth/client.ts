import { createAuthClient } from 'better-auth/react'

/**
 * Browser-side Better Auth client. Talks to the `/api/auth/*` route on the
 * same origin, so no baseURL is needed. Exposes session state and sign-in/out.
 */
export const authClient = createAuthClient()

export const { signIn, signOut, useSession } = authClient
