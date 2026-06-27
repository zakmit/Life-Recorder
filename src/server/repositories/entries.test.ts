import { beforeEach, describe, expect, it } from 'vitest'
import { createTestDb, seedUser } from '#/test/db'
import { makeEntriesRepository } from './entries'
import type { CreateEntryInput } from './entries'
import type { Database } from '#/db/client'

function entry(over: Partial<CreateEntryInput> = {}): CreateEntryInput {
  return {
    userId: 'alice',
    title: 'Focus',
    startTime: new Date('2026-01-01T10:00:00Z'),
    endTime: new Date('2026-01-01T10:25:00Z'),
    elapse: 1500,
    isPomodoro: false,
    pattern: [
      [120, 4],
      [80, 9],
    ],
    ...over,
  }
}

describe('entries repository', () => {
  let db: Database
  let repo: ReturnType<typeof makeEntriesRepository>

  beforeEach(async () => {
    db = createTestDb()
    repo = makeEntriesRepository(db)
    await seedUser(db, 'alice')
    await seedUser(db, 'bob')
  })

  it('creates an entry and assigns an id', async () => {
    const created = await repo.create(entry())
    expect(created.id).toBeTruthy()
    expect(created.title).toBe('Focus')
    expect(created.isPomodoro).toBe(false)
  })

  it('stores the pattern as processed points only (no raw audio field)', async () => {
    const created = await repo.create(
      entry({
        pattern: [
          [10, 2],
          [200, 50],
        ],
      }),
    )
    expect(created.pattern).toEqual([
      [10, 2],
      [200, 50],
    ])
    // The persisted shape is exactly the entry columns — no raw-audio key exists.
    expect(Object.keys(created)).not.toContain('audio')
    expect(Object.keys(created)).not.toContain('raw')
  })

  it('preserves the Pomodoro flag', async () => {
    const created = await repo.create(entry({ isPomodoro: true }))
    expect(created.isPomodoro).toBe(true)
  })

  it('findAll returns a user entries newest-first', async () => {
    await repo.create(
      entry({ title: 'old', startTime: new Date('2026-01-01T08:00:00Z') }),
    )
    await repo.create(
      entry({ title: 'new', startTime: new Date('2026-01-01T12:00:00Z') }),
    )
    const all = await repo.findAll('alice')
    expect(all.map((e) => e.title)).toEqual(['new', 'old'])
  })

  it('findLatest returns at most 10 newest entries and paginates by cursor', async () => {
    for (let i = 0; i < 12; i++) {
      await repo.create(
        entry({
          title: `e${i}`,
          startTime: new Date(Date.UTC(2026, 0, 1, i, 0, 0)),
        }),
      )
    }
    const first = await repo.findLatest('alice')
    expect(first).toHaveLength(10)
    expect(first[0].title).toBe('e11')

    const cursor = first[first.length - 1].startTime
    const next = await repo.findLatest('alice', cursor)
    expect(next).toHaveLength(2)
    expect(next[0].title).toBe('e1')
  })

  it('findInRange filters by start time window, oldest first', async () => {
    await repo.create(
      entry({ title: 'before', startTime: new Date('2026-01-01T00:00:00Z') }),
    )
    await repo.create(
      entry({ title: 'in1', startTime: new Date('2026-01-05T00:00:00Z') }),
    )
    await repo.create(
      entry({ title: 'in2', startTime: new Date('2026-01-06T00:00:00Z') }),
    )
    await repo.create(
      entry({ title: 'after', startTime: new Date('2026-02-01T00:00:00Z') }),
    )
    const inRange = await repo.findInRange(
      'alice',
      new Date('2026-01-02T00:00:00Z'),
      new Date('2026-01-10T00:00:00Z'),
    )
    expect(inRange.map((e) => e.title)).toEqual(['in1', 'in2'])
  })

  it('never returns another user entries', async () => {
    await repo.create(entry({ userId: 'alice', title: 'alice-entry' }))
    await repo.create(entry({ userId: 'bob', title: 'bob-entry' }))

    expect((await repo.findAll('alice')).map((e) => e.title)).toEqual([
      'alice-entry',
    ])
    expect((await repo.findLatest('bob')).map((e) => e.title)).toEqual([
      'bob-entry',
    ])
    const aliceRange = await repo.findInRange(
      'alice',
      new Date('2026-01-01T00:00:00Z'),
      new Date('2026-01-02T00:00:00Z'),
    )
    expect(aliceRange.every((e) => e.userId === 'alice')).toBe(true)
  })
})
