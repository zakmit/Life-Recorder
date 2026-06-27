import { eq } from 'drizzle-orm'
import { preferences } from '#/db/schema'
import type { Database } from '#/db/client'
import type { Preferences } from '#/db/schema'

export type PreferenceValues = {
  themeName: string
  pomoMinutes: number
  showHours: boolean
}

export const DEFAULT_PREFERENCES: PreferenceValues = {
  themeName: 'Seashore[Blue]',
  pomoMinutes: 10,
  showHours: true,
}

export type PreferenceUpdate = Partial<{
  themeName: string
  pomoMinutes: number
  showHours: boolean
}>

/**
 * Per-user preference reads/writes. Every method is scoped by `userId`; there
 * is no cross-user access path.
 */
export function makePreferencesRepository(db: Database) {
  return {
    /** Returns the stored preferences, or null if the user has none yet. */
    async find(userId: string): Promise<Preferences | null> {
      const rows = await db
        .select()
        .from(preferences)
        .where(eq(preferences.userId, userId))
        .limit(1)
      return rows[0] ?? null
    },

    /** Returns stored preferences merged onto defaults. */
    async findOrDefault(
      userId: string,
    ): Promise<PreferenceValues & { userId: string }> {
      const found = await this.find(userId)
      return {
        userId,
        themeName: found?.themeName ?? DEFAULT_PREFERENCES.themeName,
        pomoMinutes: found?.pomoMinutes ?? DEFAULT_PREFERENCES.pomoMinutes,
        showHours: found?.showHours ?? DEFAULT_PREFERENCES.showHours,
      }
    },

    /**
     * Insert-or-update the user's preferences. Only provided fields change;
     * missing fields fall back to defaults on first insert.
     */
    async upsert(
      userId: string,
      update: PreferenceUpdate,
    ): Promise<Preferences> {
      const now = new Date()
      const existing = await this.find(userId)
      const next = {
        userId,
        themeName:
          update.themeName ??
          existing?.themeName ??
          DEFAULT_PREFERENCES.themeName,
        pomoMinutes:
          update.pomoMinutes ??
          existing?.pomoMinutes ??
          DEFAULT_PREFERENCES.pomoMinutes,
        showHours:
          update.showHours ??
          existing?.showHours ??
          DEFAULT_PREFERENCES.showHours,
        updatedAt: now,
      }

      await db
        .insert(preferences)
        .values(next)
        .onConflictDoUpdate({
          target: preferences.userId,
          set: {
            themeName: next.themeName,
            pomoMinutes: next.pomoMinutes,
            showHours: next.showHours,
            updatedAt: now,
          },
        })

      const saved = await this.find(userId)
      return saved!
    },
  }
}

export type PreferencesRepository = ReturnType<typeof makePreferencesRepository>
