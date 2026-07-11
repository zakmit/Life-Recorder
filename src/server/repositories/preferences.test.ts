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

  it('initializes a missing row without replacing the first writer', async () => {
    const first = await repo.initializeIfAbsent('alice', {
      themeName: 'Seashore',
      pomoMinutes: 25,
      showHours: false,
    })
    const second = await repo.initializeIfAbsent('alice', {
      themeName: 'Seashore[Blue]',
      pomoMinutes: 50,
      showHours: true,
    })

    expect(first).toEqual(second)
    expect(second).toMatchObject({
      userId: 'alice',
      themeName: 'Seashore',
      pomoMinutes: 25,
      showHours: false,
    })
  })

  it('returns one canonical first-writer row to concurrent initializers', async () => {
    const [first, second] = await Promise.all([
      repo.initializeIfAbsent('alice', {
        themeName: 'Seashore',
        pomoMinutes: 25,
        showHours: false,
      }),
      repo.initializeIfAbsent('alice', {
        themeName: 'Seashore[Blue]',
        pomoMinutes: 50,
        showHours: true,
      }),
    ])

    expect(first).toEqual(second)
    expect(await repo.find('alice')).toEqual(first)
  })
})
