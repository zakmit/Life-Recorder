import { beforeEach, describe, expect, it } from 'vitest'
import { createTestDb, seedUser } from '#/test/db'
import { makeUsersRepository } from './users'
import type { Database } from '#/db/client'

describe('users repository', () => {
  let db: Database
  let repo: ReturnType<typeof makeUsersRepository>

  beforeEach(async () => {
    db = createTestDb()
    repo = makeUsersRepository(db)
  })

  it('finds a user by id', async () => {
    await seedUser(db, 'alice', 'alice@test.dev')
    const found = await repo.findById('alice')
    expect(found?.email).toBe('alice@test.dev')
  })

  it('returns null for an unknown user', async () => {
    expect(await repo.findById('nobody')).toBeNull()
  })
})
