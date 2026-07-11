import {
  getPreferences,
  initializePreferences,
  updatePreferences,
} from '#/server/functions/preferences'
import type { PreferencesForm } from './preferences-schema'

/** Load preferences while preserving whether the signed-in user has a row. */
export function fetchPreferences() {
  return getPreferences()
}

/** Seed a missing account row without overwriting a concurrent first writer. */
export function initializePreferencesIfAbsent(values: PreferencesForm) {
  return initializePreferences({ data: values })
}

/** Persist a full or partial preferences update for the signed-in user. */
export function savePreferences(update: Partial<PreferencesForm>) {
  return updatePreferences({ data: update })
}
