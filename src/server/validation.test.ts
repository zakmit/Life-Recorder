import { describe, expect, it } from 'vitest'
import {
  createEntrySchema,
  preferenceUpdateSchema,
  rangeQuerySchema,
} from './validation'

describe('preferenceUpdateSchema', () => {
  it('accepts a valid partial update', () => {
    const parsed = preferenceUpdateSchema.parse({ pomoMinutes: 25 })
    expect(parsed.pomoMinutes).toBe(25)
  })

  it('rejects an empty update', () => {
    expect(() => preferenceUpdateSchema.parse({})).toThrow()
  })

  it('rejects non-positive pomodoro minutes', () => {
    expect(() => preferenceUpdateSchema.parse({ pomoMinutes: 0 })).toThrow()
    expect(() => preferenceUpdateSchema.parse({ pomoMinutes: -5 })).toThrow()
  })

  it('rejects unknown theme names', () => {
    expect(() =>
      preferenceUpdateSchema.parse({ themeName: 'Hacker' }),
    ).toThrow()
  })

  it('ignores a client-supplied userId (ownership comes from the session)', () => {
    const parsed = preferenceUpdateSchema.parse({
      pomoMinutes: 30,
      userId: 'victim',
    } as Record<string, unknown>)
    expect(parsed).not.toHaveProperty('userId')
  })
})

describe('createEntrySchema', () => {
  const base = {
    title: 'Focus',
    startTime: '2026-01-01T10:00:00Z',
    endTime: '2026-01-01T10:25:00Z',
    elapse: 1500,
    isPomodoro: false,
    pattern: [
      [120, 4],
      [80, 9],
    ],
  }

  it('coerces ISO date strings to Date objects', () => {
    const parsed = createEntrySchema.parse(base)
    expect(parsed.startTime).toBeInstanceOf(Date)
    expect(parsed.endTime).toBeInstanceOf(Date)
  })

  it('rejects pattern points outside 0-255', () => {
    expect(() =>
      createEntrySchema.parse({ ...base, pattern: [[300, 0]] }),
    ).toThrow()
  })

  it('strips a forged userId from the payload', () => {
    const parsed = createEntrySchema.parse({
      ...base,
      userId: 'victim',
    } as Record<string, unknown>)
    expect(parsed).not.toHaveProperty('userId')
  })

  it('rejects a negative elapse', () => {
    expect(() => createEntrySchema.parse({ ...base, elapse: -1 })).toThrow()
  })
})

describe('rangeQuerySchema', () => {
  it('coerces a date range', () => {
    const parsed = rangeQuerySchema.parse({
      startDate: '2026-01-01',
      endDate: '2026-02-01',
    })
    expect(parsed.startDate).toBeInstanceOf(Date)
    expect(parsed.endDate).toBeInstanceOf(Date)
  })
})
