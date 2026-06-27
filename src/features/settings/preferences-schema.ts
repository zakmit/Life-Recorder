import { z } from 'zod'

export const THEME_OPTIONS = ['Seashore[Blue]', 'Seashore'] as const
export type ThemeName = (typeof THEME_OPTIONS)[number]

/**
 * Form-level preferences schema. Mirrors the server-side
 * `preferenceUpdateSchema` shape but always carries a full value set (the form
 * edits all fields at once). Used to validate the form before submitting.
 */
export const preferencesFormSchema = z.object({
  themeName: z.enum(THEME_OPTIONS),
  pomoMinutes: z.number().int().positive().max(24 * 60),
  showHours: z.boolean(),
})

export type PreferencesForm = z.infer<typeof preferencesFormSchema>

export const DEFAULT_FORM: PreferencesForm = {
  themeName: 'Seashore[Blue]',
  pomoMinutes: 10,
  showHours: true,
}
