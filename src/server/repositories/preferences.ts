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

export type PreferenceLookup =
  | { present: false }
  | { present: true; preferences: Preferences }

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

    /** Preserves whether the row exists, even when its values equal defaults. */
    async lookup(userId: string): Promise<PreferenceLookup> {
      const found = await this.find(userId)
      return found === null
        ? { present: false }
        : { present: true, preferences: found }
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

    /**
     * Insert initial preferences without overwriting an existing row. The
     * canonical row is read back so concurrent callers converge on whichever
     * insert won the unique user-id constraint.
     */
    async initializeIfAbsent(
      userId: string,
      values: PreferenceValues,
    ): Promise<Preferences> {
      await db
        .insert(preferences)
        .values({ userId, ...values, updatedAt: new Date() })
        .onConflictDoNothing({ target: preferences.userId })

      const canonical = await this.find(userId)
      if (canonical === null) {
        throw new Error('Preference initialization did not produce a row')
      }
      return canonical
    },
  }
}

export type PreferencesRepository = ReturnType<typeof makePreferencesRepository>
