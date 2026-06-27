import { drizzle } from 'drizzle-orm/d1'
import { env } from 'cloudflare:workers'
import * as schema from './schema'

export type Database = ReturnType<typeof drizzle<typeof schema>>

/**
 * Build a Drizzle client over a D1 binding. Pass a binding explicitly in tests
 * (e.g. an in-memory better-sqlite3 D1 shim); in the Worker runtime the default
 * comes from the `DB` binding exposed by `cloudflare:workers`.
 */
export function createDb(d1: D1Database): Database {
  return drizzle(d1, { schema })
}

/**
 * Convenience accessor for the Worker runtime. Reads the `DB` binding from the
 * Cloudflare environment. Do not call this in unit tests — use `createDb` with
 * a test binding instead.
 */
export function getDb(): Database {
  return createDb(env.DB)
}

export { schema }
