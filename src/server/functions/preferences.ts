import { createServerFn } from '@tanstack/react-start'
import { preferenceUpdateSchema } from '#/server/validation'
import {
  initializePreferencesForSession,
  readPreferencesForSession,
  updatePreferencesForSession,
} from './preferences.handlers.server'
import type { PreferenceUpdateInput } from '#/server/validation'

/**
 * Read the signed-in user's preferences while preserving row presence.
 * Anonymous callers are rejected by `requireUser`.
 */
export const getPreferences = createServerFn({ method: 'GET' }).handler(
  readPreferencesForSession,
)

/**
 * Initialize preferences only when the signed-in user has no row. Ownership
 * comes exclusively from the session; concurrent callers receive the same
 * canonical first-writer row.
 */
export const initializePreferences = createServerFn({ method: 'POST' })
  .validator((data: PreferenceUpdateInput) =>
    preferenceUpdateSchema.parse(data),
  )
  .handler(initializePreferencesForSession)

/**
 * Update the signed-in user's preferences. Ownership comes from the session,
 * never from the payload; the input schema carries no user id.
 */
export const updatePreferences = createServerFn({ method: 'POST' })
  .validator((data: PreferenceUpdateInput) =>
    preferenceUpdateSchema.parse(data),
  )
  .handler(updatePreferencesForSession)
