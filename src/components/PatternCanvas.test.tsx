import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import { PatternCanvas } from './PatternCanvas'

describe('PatternCanvas', () => {
  it('renders a labelled canvas without throwing', () => {
    const { getByRole } = render(
      <PatternCanvas
        pattern={[
          [10, 2],
          [200, 50],
        ]}
      />,
    )
    expect(getByRole('img', { name: /pattern/i })).toBeTruthy()
  })

  it('handles an empty pattern', () => {
    const { getByRole } = render(<PatternCanvas pattern={[]} />)
    expect(getByRole('img')).toBeTruthy()
  })
})
