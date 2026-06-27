import { createServerFn } from '@tanstack/react-start'
import { requireUser } from '#/server/auth.server'
import { getRepositories } from '#/server/repositories'
import { preferenceUpdateSchema } from '#/server/validation'
import type { PreferenceUpdateInput } from '#/server/validation'

/**
 * Read the signed-in user's preferences (merged onto defaults).
 * Anonymous callers are rejected by `requireUser`.
 */
export const getPreferences = createServerFn({ method: 'GET' }).handler(
  async () => {
    const user = await requireUser()
    const { preferences } = getRepositories()
    return preferences.findOrDefault(user.id)
  },
)

/**
 * Update the signed-in user's preferences. Ownership comes from the session,
 * never from the payload; the input schema carries no user id.
 */
export const updatePreferences = createServerFn({ method: 'POST' })
  .inputValidator((data: PreferenceUpdateInput) =>
    preferenceUpdateSchema.parse(data),
  )
  .handler(async ({ data }) => {
    const user = await requireUser()
    const { preferences } = getRepositories()
    return preferences.upsert(user.id, data)
  })
