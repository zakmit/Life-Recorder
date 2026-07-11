import { requireUser } from '#/server/auth.server'
import { DEFAULT_PREFERENCES, getRepositories } from '#/server/repositories'
import type { PreferenceUpdateInput } from '#/server/validation'

export async function readPreferencesForSession() {
  const user = await requireUser()
  const { preferences } = getRepositories()
  return preferences.lookup(user.id)
}

export async function initializePreferencesForSession({
  data,
}: {
  data: PreferenceUpdateInput
}) {
  const user = await requireUser()
  const { preferences } = getRepositories()
  return preferences.initializeIfAbsent(user.id, {
    themeName: data.themeName ?? DEFAULT_PREFERENCES.themeName,
    pomoMinutes: data.pomoMinutes ?? DEFAULT_PREFERENCES.pomoMinutes,
    showHours: data.showHours ?? DEFAULT_PREFERENCES.showHours,
  })
}

export async function updatePreferencesForSession({
  data,
}: {
  data: PreferenceUpdateInput
}) {
  const user = await requireUser()
  const { preferences } = getRepositories()
  return preferences.upsert(user.id, data)
}
