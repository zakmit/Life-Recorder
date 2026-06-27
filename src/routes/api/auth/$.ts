import { createFileRoute } from '@tanstack/react-router'
import { createAuth } from '#/auth/config'

/**
 * Catch-all route that hands every `/api/auth/*` request to Better Auth.
 * This is where OAuth sign-in, callback, session, and sign-out are served.
 */
export const Route = createFileRoute('/api/auth/$')({
  server: {
    handlers: {
      GET: ({ request }) => createAuth().handler(request),
      POST: ({ request }) => createAuth().handler(request),
    },
  },
})
