import { describe, expect, it } from 'vitest'
import {
  accumulateFrames,
  extractPatternPoint,
  peakIndex,
  randomPatternPoint,
} from './pattern'
import { timeToString, clockString } from '#/features/timer/format'

describe('peakIndex', () => {
  it('finds the max index', () => {
    expect(peakIndex([1, 9, 3, 2], 'max')).toBe(1)
  })
  it('finds the min index', () => {
    expect(peakIndex([5, 2, 8, 1, 4], 'min')).toBe(3)
  })
  it('returns 0 for an empty array', () => {
    expect(peakIndex([], 'max')).toBe(0)
  })
})

describe('accumulateFrames', () => {
  it('sums frames element-wise', () => {
    const summed = accumulateFrames([
      [1, 2, 3],
      [4, 5, 6],
    ])
    expect(summed).toEqual([5, 7, 9])
  })
  it('returns empty for no frames', () => {
    expect(accumulateFrames([])).toEqual([])
  })
})

describe('extractPatternPoint', () => {
  it('reduces accumulated frames to a [max, min] processed point', () => {
    // Summed: [2, 20, 6] -> max idx 1, min idx 0
    const point = extractPatternPoint([
      [1, 10, 3],
      [1, 10, 3],
    ])
    expect(point).toEqual([1, 0])
  })

  it('returns only two integers (no raw samples leak)', () => {
    const point = extractPatternPoint([new Uint8Array([3, 1, 9, 2])])
    expect(point).toHaveLength(2)
    expect(Number.isInteger(point[0])).toBe(true)
    expect(Number.isInteger(point[1])).toBe(true)
  })
})

describe('randomPatternPoint', () => {
  it('produces a point within byte range', () => {
    for (let i = 0; i < 50; i++) {
      const [a, b] = randomPatternPoint()
      expect(a).toBeGreaterThanOrEqual(0)
      expect(a).toBeLessThan(128)
      expect(b).toBeGreaterThanOrEqual(0)
      expect(b).toBeLessThan(128)
    }
  })
})

describe('time formatting', () => {
  it('formats elapsed seconds with units', () => {
    expect(timeToString(0)).toBe('Nothing')
    expect(timeToString(1)).toBe('1 sec')
    expect(timeToString(61)).toBe('1 min 1 sec')
    expect(timeToString(3661)).toBe('1 hr 1 min 1 sec')
    expect(timeToString(7200)).toBe('2 hrs')
  })

  it('formats a clock face', () => {
    expect(clockString(3661, true)).toBe('01:01:01')
    expect(clockString(61, false)).toBe('01:01')
  })
})
