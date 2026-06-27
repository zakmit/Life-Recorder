import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  isMicSupported,
  queryMicPermission,
  requestMicStream,
} from './audio-permission'

const originalNavigator = globalThis.navigator

afterEach(() => {
  Object.defineProperty(globalThis, 'navigator', {
    value: originalNavigator,
    configurable: true,
  })
  vi.restoreAllMocks()
})

function setNavigator(value: unknown) {
  Object.defineProperty(globalThis, 'navigator', {
    value,
    configurable: true,
  })
}

describe('isMicSupported', () => {
  it('is false when mediaDevices is missing', () => {
    setNavigator({})
    expect(isMicSupported()).toBe(false)
  })

  it('is true when getUserMedia exists', () => {
    setNavigator({ mediaDevices: { getUserMedia: () => {} } })
    expect(isMicSupported()).toBe(true)
  })
})

describe('queryMicPermission', () => {
  it('returns unsupported without the API', async () => {
    setNavigator({})
    expect(await queryMicPermission()).toBe('unsupported')
  })

  it('returns the queried permission state', async () => {
    setNavigator({
      mediaDevices: { getUserMedia: () => {} },
      permissions: { query: async () => ({ state: 'granted' }) },
    })
    expect(await queryMicPermission()).toBe('granted')
  })

  it('falls back to prompt when the permissions API throws', async () => {
    setNavigator({
      mediaDevices: { getUserMedia: () => {} },
      permissions: {
        query: async () => {
          throw new Error('not supported')
        },
      },
    })
    expect(await queryMicPermission()).toBe('prompt')
  })
})

describe('requestMicStream', () => {
  it('returns null when denied, never throwing', async () => {
    setNavigator({
      mediaDevices: {
        getUserMedia: async () => {
          throw new Error('denied')
        },
      },
    })
    await expect(requestMicStream()).resolves.toBeNull()
  })

  it('returns null when unsupported', async () => {
    setNavigator({})
    await expect(requestMicStream()).resolves.toBeNull()
  })

  it('returns the stream when granted', async () => {
    const fakeStream = {} as MediaStream
    setNavigator({
      mediaDevices: { getUserMedia: async () => fakeStream },
    })
    await expect(requestMicStream()).resolves.toBe(fakeStream)
  })
})
