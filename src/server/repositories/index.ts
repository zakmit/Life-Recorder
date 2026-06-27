import { getDb } from '#/db/client'
import { makeUsersRepository } from './users'
import { makePreferencesRepository } from './preferences'
import { makeEntriesRepository } from './entries'
import type { Database } from '#/db/client'

export * from './users'
export * from './preferences'
export * from './entries'

/**
 * Bundle of all repositories over a single database connection. Pass a
 * test database in unit tests; in the Worker runtime call `getRepositories()`.
 */
export function makeRepositories(db: Database) {
  return {
    users: makeUsersRepository(db),
    preferences: makePreferencesRepository(db),
    entries: makeEntriesRepository(db),
  }
}

export type Repositories = ReturnType<typeof makeRepositories>

export function getRepositories(): Repositories {
  return makeRepositories(getDb())
}
