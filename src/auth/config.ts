import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { env } from 'cloudflare:workers'
import { getDb, schema } from '#/db/client'
import type { BetterAuthOptions } from 'better-auth'

/**
 * Build the Better Auth instance for the current request.
 *
 * Auth is server-owned: sessions are stored in D1 via the Drizzle adapter and
 * carried in secure, httpOnly cookies. GitHub is the demo OAuth provider.
 *
 * The instance is created per call rather than as a module singleton so it
 * always binds to the live Worker `env` (secrets, bindings) for the request.
 */
export function createAuth() {
  const options: BetterAuthOptions = {
    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,
    database: drizzleAdapter(getDb(), {
      provider: 'sqlite',
      schema: {
        user: schema.user,
        session: schema.session,
        account: schema.account,
        verification: schema.verification,
      },
    }),
    socialProviders: {
      github: {
        clientId: env.GITHUB_CLIENT_ID,
        clientSecret: env.GITHUB_CLIENT_SECRET,
      },
    },
    advanced: {
      // Cloudflare serves the demo over HTTPS; cookies stay locked down.
      defaultCookieAttributes: {
        httpOnly: true,
        sameSite: 'lax',
        secure: true,
      },
    },
  }

  return betterAuth(options)
}

export type Auth = ReturnType<typeof createAuth>
