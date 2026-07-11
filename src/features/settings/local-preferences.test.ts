import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_FORM } from './preferences-schema'
import {
  LOCAL_PREFERENCES_KEY,
  readLocalPreferences,
  writeLocalPreferences,
} from './local-preferences'

describe('local preferences', () => {
  let values: Map<string, string>
  let storage: Pick<Storage, 'getItem' | 'setItem'>

  beforeEach(() => {
    values = new Map()
    storage = {
      getItem: vi.fn((key: string) => values.get(key) ?? null),
      setItem: vi.fn((key: string, value: string) => {
        values.set(key, value)
      }),
    }
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns defaults when storage is empty', () => {
    expect(readLocalPreferences(storage)).toEqual(DEFAULT_FORM)
  })

  it('round-trips a valid full preference form', () => {
    const preferences = {
      themeName: 'Seashore' as const,
      pomoMinutes: 25,
      showHours: false,
    }

    expect(writeLocalPreferences(preferences, storage)).toBe(true)
    expect(readLocalPreferences(storage)).toEqual(preferences)
  })

  it.each([
    ['malformed JSON', '{not json'],
    [
      'an unknown version',
      JSON.stringify({ version: 2, preferences: DEFAULT_FORM }),
    ],
    [
      'schema-invalid fields',
      JSON.stringify({
        version: 1,
        preferences: { ...DEFAULT_FORM, pomoMinutes: 0 },
      }),
    ],
  ])('returns defaults for %s', (_label, storedValue) => {
    storage.setItem(LOCAL_PREFERENCES_KEY, storedValue)

    expect(readLocalPreferences(storage)).toEqual(DEFAULT_FORM)
  })

  it('does not persist invalid or partial forms', () => {
    expect(
      writeLocalPreferences({ themeName: 'Seashore' }, storage),
    ).toBe(false)
    expect(storage.getItem(LOCAL_PREFERENCES_KEY)).toBeNull()
  })

  it('does not require browser globals in a server environment', () => {
    vi.stubGlobal('window', undefined)

    expect(readLocalPreferences()).toEqual(DEFAULT_FORM)
    expect(writeLocalPreferences(DEFAULT_FORM)).toBe(false)
  })
})
