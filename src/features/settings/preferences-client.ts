import {
  getPreferences,
  updatePreferences,
} from '#/server/functions/preferences'
import type { PreferencesForm } from './preferences-schema'

/** Load the signed-in user's preferences (merged onto defaults). */
export function fetchPreferences() {
  return getPreferences()
}

/** Persist a full or partial preferences update for the signed-in user. */
export function savePreferences(update: Partial<PreferencesForm>) {
  return updatePreferences({ data: update })
}
