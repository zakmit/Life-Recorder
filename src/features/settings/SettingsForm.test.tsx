import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { SettingsForm } from './SettingsForm'
import { DEFAULT_FORM } from './preferences-schema'

describe('SettingsForm', () => {
  it('renders the initial preference values', () => {
    const { getByDisplayValue, getByRole } = render(
      <SettingsForm
        initial={{ ...DEFAULT_FORM, pomoMinutes: 25 }}
        onSave={vi.fn()}
      />,
    )
    expect(getByDisplayValue('25')).toBeTruthy()
    expect((getByRole('checkbox') as HTMLInputElement).checked).toBe(true)
  })

  it('saves an updated pomodoro length on blur', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined)
    const { getByDisplayValue } = render(
      <SettingsForm initial={DEFAULT_FORM} onSave={onSave} />,
    )
    const input = getByDisplayValue('10') as HTMLInputElement
    fireEvent.change(input, { target: { value: '45' } })
    fireEvent.blur(input)
    await waitFor(() =>
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({ pomoMinutes: 45 }),
      ),
    )
  })

  it('saves when toggling show-hours', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined)
    const { getByRole } = render(
      <SettingsForm initial={DEFAULT_FORM} onSave={onSave} />,
    )
    fireEvent.click(getByRole('checkbox'))
    await waitFor(() =>
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({ showHours: false }),
      ),
    )
  })

  it('does not save an invalid pomodoro value and reverts the input', async () => {
    const onSave = vi.fn()
    const { getByDisplayValue } = render(
      <SettingsForm initial={DEFAULT_FORM} onSave={onSave} />,
    )
    const input = getByDisplayValue('10') as HTMLInputElement
    fireEvent.change(input, { target: { value: '0' } })
    fireEvent.blur(input)
    expect(onSave).not.toHaveBeenCalled()
    expect(input.value).toBe('10')
  })
})
