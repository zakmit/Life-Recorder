import { beforeEach, describe, expect, it } from 'vitest'
import { createTestDb, seedUser } from '#/test/db'
import { makePreferencesRepository, DEFAULT_PREFERENCES } from './preferences'
import type { Database } from '#/db/client'

describe('preferences repository', () => {
  let db: Database
  let repo: ReturnType<typeof makePreferencesRepository>

  beforeEach(async () => {
    db = createTestDb()
    repo = makePreferencesRepository(db)
    await seedUser(db, 'alice')
    await seedUser(db, 'bob')
  })

  it('returns defaults for a user with no stored preferences', async () => {
    const prefs = await repo.findOrDefault('alice')
    expect(prefs).toMatchObject(DEFAULT_PREFERENCES)
    expect(await repo.find('alice')).toBeNull()
  })

  it('upserts new preferences and reads them back', async () => {
    const saved = await repo.upsert('alice', {
      themeName: 'Seashore',
      pomoMinutes: 25,
      showHours: false,
    })
    expect(saved.themeName).toBe('Seashore')
    expect(saved.pomoMinutes).toBe(25)
    expect(saved.showHours).toBe(false)

    const reread = await repo.find('alice')
    expect(reread?.pomoMinutes).toBe(25)
  })

  it('partial upsert preserves unspecified fields', async () => {
    await repo.upsert('alice', { pomoMinutes: 50 })
    const afterTheme = await repo.upsert('alice', { themeName: 'Seashore' })
    expect(afterTheme.pomoMinutes).toBe(50)
    expect(afterTheme.themeName).toBe('Seashore')
  })

  it('scopes preferences per user', async () => {
    await repo.upsert('alice', { pomoMinutes: 99 })
    expect(await repo.find('bob')).toBeNull()
    expect((await repo.findOrDefault('bob')).pomoMinutes).toBe(
      DEFAULT_PREFERENCES.pomoMinutes,
    )
  })
})
