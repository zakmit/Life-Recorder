import { describe, expect, it } from 'vitest'
import {
  DEFAULT_FORM,
  THEME_OPTIONS,
  preferencesFormSchema,
} from './preferences-schema'

describe('preferencesFormSchema', () => {
  it('accepts the default form', () => {
    expect(preferencesFormSchema.parse(DEFAULT_FORM)).toEqual(DEFAULT_FORM)
  })

  it('rejects an unknown theme', () => {
    expect(() =>
      preferencesFormSchema.parse({ ...DEFAULT_FORM, themeName: 'Nope' }),
    ).toThrow()
  })

  it('rejects non-positive pomodoro minutes', () => {
    expect(() =>
      preferencesFormSchema.parse({ ...DEFAULT_FORM, pomoMinutes: 0 }),
    ).toThrow()
  })

  it('default theme is one of the options', () => {
    expect(THEME_OPTIONS).toContain(DEFAULT_FORM.themeName)
  })
})
