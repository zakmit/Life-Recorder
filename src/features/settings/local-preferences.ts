import { DEFAULT_FORM, preferencesFormSchema } from './preferences-schema'
import type { PreferencesForm } from './preferences-schema'

export const LOCAL_PREFERENCES_KEY = 'life-recorder:preferences'

const STORAGE_VERSION = 1

type PreferencesStorage = Pick<Storage, 'getItem' | 'setItem'>

function defaults(): PreferencesForm {
  return { ...DEFAULT_FORM }
}

function browserStorage(): PreferencesStorage | undefined {
  if (typeof window === 'undefined') return undefined

  try {
    return window.localStorage
  } catch {
    return undefined
  }
}

export function readLocalPreferences(
  storage: PreferencesStorage | undefined = browserStorage(),
): PreferencesForm {
  if (!storage) return defaults()

  try {
    const rawValue = storage.getItem(LOCAL_PREFERENCES_KEY)
    if (rawValue === null) return defaults()

    const storedValue: unknown = JSON.parse(rawValue)
    if (
      typeof storedValue !== 'object' ||
      storedValue === null ||
      !('version' in storedValue) ||
      storedValue.version !== STORAGE_VERSION ||
      !('preferences' in storedValue)
    ) {
      return defaults()
    }

    const result = preferencesFormSchema.safeParse(storedValue.preferences)
    return result.success ? result.data : defaults()
  } catch {
    return defaults()
  }
}

export function writeLocalPreferences(
  preferences: unknown,
  storage: PreferencesStorage | undefined = browserStorage(),
): boolean {
  if (!storage) return false

  const result = preferencesFormSchema.safeParse(preferences)
  if (!result.success) return false

  try {
    storage.setItem(
      LOCAL_PREFERENCES_KEY,
      JSON.stringify({ version: STORAGE_VERSION, preferences: result.data }),
    )
    return true
  } catch {
    return false
  }
}
