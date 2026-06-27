import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import { ProfileBlock } from './ProfileBlock'

describe('ProfileBlock', () => {
  it('signed out: stranger avatar + Hello, Stranger', () => {
    const { getByAltText, getByText } = render(<ProfileBlock user={null} />)
    expect(getByAltText('profile').getAttribute('src')).toBe('/img/stranger.png')
    expect(getByText('Hello,')).toBeTruthy()
    expect(getByText('Stranger.')).toBeTruthy()
  })

  it('signed in: user avatar + name + email', () => {
    const { getByAltText, getByText } = render(
      <ProfileBlock
        user={{
          id: 'u1',
          name: 'Ada Lovelace',
          email: 'ada@example.com',
          image: 'https://example.com/ada.png',
        }}
      />,
    )
    expect(getByAltText('profile').getAttribute('src')).toBe(
      'https://example.com/ada.png',
    )
    expect(getByText('Ada Lovelace')).toBeTruthy()
    expect(getByText('ada@example.com')).toBeTruthy()
  })

  it('signed in without an image falls back to the stranger avatar', () => {
    const { getByAltText } = render(
      <ProfileBlock
        user={{ id: 'u2', name: 'No Pic', email: 'np@example.com', image: null }}
      />,
    )
    expect(getByAltText('profile').getAttribute('src')).toBe('/img/stranger.png')
  })
})
