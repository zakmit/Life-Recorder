import { describe, expect, it } from 'vitest'
import { byStartTimeAsc, byStartTimeDesc } from './history-queries'
import type { Entry } from '#/db/schema'

function entry(id: string, startTime: string): Entry {
  return {
    id,
    userId: 'alice',
    title: id,
    startTime: new Date(startTime),
    endTime: new Date(startTime),
    elapse: 60,
    isPomodoro: false,
    pattern: [],
    createdAt: new Date(startTime),
  }
}

const entries = [
  entry('mid', '2026-01-02T00:00:00Z'),
  entry('old', '2026-01-01T00:00:00Z'),
  entry('new', '2026-01-03T00:00:00Z'),
]

describe('history sort comparators', () => {
  it('sorts newest-first with byStartTimeDesc', () => {
    expect([...entries].sort(byStartTimeDesc).map((e) => e.id)).toEqual([
      'new',
      'mid',
      'old',
    ])
  })

  it('sorts oldest-first with byStartTimeAsc', () => {
    expect([...entries].sort(byStartTimeAsc).map((e) => e.id)).toEqual([
      'old',
      'mid',
      'new',
    ])
  })
})
