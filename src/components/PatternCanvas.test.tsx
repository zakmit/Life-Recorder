import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import { PatternCanvas } from './PatternCanvas'
import { SEASHORE, SEASHORE_BLUE } from '#/features/audio/themes'

describe('PatternCanvas', () => {
  it('renders a labelled canvas with a pattern and theme without throwing', () => {
    const { getByRole } = render(
      <PatternCanvas
        theme={SEASHORE_BLUE}
        pattern={[
          [10, 2],
          [200, 50],
          [33, 1],
        ]}
      />,
    )
    expect(getByRole('img', { name: /pattern/i })).toBeTruthy()
  })

  it('handles an empty pattern', () => {
    const { getByRole } = render(<PatternCanvas pattern={[]} />)
    expect(getByRole('img')).toBeTruthy()
  })

  it('renders under jsdom (no real canvas/image) without crashing — SSR-safety proxy', () => {
    // jsdom has no canvas context and does not load images; the component must
    // guard both and never throw at render time.
    expect(() =>
      render(
        <PatternCanvas
          theme={SEASHORE}
          pattern={Array.from({ length: 30 }, (_, i) => [i * 7, i % 6])}
        />,
      ),
    ).not.toThrow()
  })

  it('accepts preview-scale overrides (imgSize/radius)', () => {
    const { getByRole } = render(
      <PatternCanvas
        theme={SEASHORE_BLUE}
        pattern={[[1, 0]]}
        width={280}
        height={140}
        imgSize={SEASHORE_BLUE.imgSize / 5}
        radius={SEASHORE_BLUE.radius / 5}
      />,
    )
    expect(getByRole('img')).toBeTruthy()
  })
})
