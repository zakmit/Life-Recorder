import { useState } from 'react'
import { THEME_OPTIONS } from './preferences-schema'
import type { PreferencesForm } from './preferences-schema'

export type SettingsFormProps = {
  initial: PreferencesForm
  onSave: (values: PreferencesForm) => Promise<void> | void
}

/**
 * Preferences editor: theme, Pomodoro length, and show-hours toggle. Mirrors
 * the legacy Settings surface. Persists for the authenticated user via onSave.
 */
export function SettingsForm({ initial, onSave }: SettingsFormProps) {
  const [values, setValues] = useState<PreferencesForm>(initial)
  const [pomoInput, setPomoInput] = useState(String(initial.pomoMinutes))
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>(
    'idle',
  )

  async function commit(next: PreferencesForm) {
    setValues(next)
    setStatus('saving')
    try {
      await onSave(next)
      setStatus('saved')
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="flex max-w-md flex-col gap-6">
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Theme</span>
        <select
          className="rounded border px-3 py-2"
          value={values.themeName}
          onChange={(e) =>
            void commit({
              ...values,
              themeName: e.target.value as PreferencesForm['themeName'],
            })
          }
        >
          {THEME_OPTIONS.map((theme) => (
            <option key={theme} value={theme}>
              {theme}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Pomodoro length (minutes)</span>
        <input
          type="number"
          min={1}
          className="rounded border px-3 py-2"
          value={pomoInput}
          onChange={(e) => setPomoInput(e.target.value)}
          onBlur={() => {
            const minutes = parseInt(pomoInput, 10)
            if (Number.isInteger(minutes) && minutes > 0) {
              void commit({ ...values, pomoMinutes: minutes })
            } else {
              setPomoInput(String(values.pomoMinutes))
            }
          }}
        />
      </label>

      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={values.showHours}
          onChange={(e) =>
            void commit({ ...values, showHours: e.target.checked })
          }
        />
        <span className="text-sm font-medium">Show hours on the clock</span>
      </label>

      <div className="h-5 text-sm" aria-live="polite">
        {status === 'saving' && <span className="text-slate-500">Saving…</span>}
        {status === 'saved' && (
          <span className="text-emerald-600">Saved.</span>
        )}
        {status === 'error' && (
          <span className="text-red-600">Could not save. Try again.</span>
        )}
      </div>
    </div>
  )
}
