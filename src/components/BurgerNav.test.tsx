import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render } from '@testing-library/react'
import type { ProfileUser } from './ProfileBlock'

// Stub the router Link and auth client so BurgerNav renders in isolation.
vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}))
vi.mock('#/auth/client', () => ({
  signIn: { social: vi.fn() },
  signOut: vi.fn(),
}))

type SessionResult = {
  session: { user: ProfileUser } | null
  isPending: boolean
}
const sessionMock = vi.fn<() => SessionResult>(() => ({
  session: null,
  isPending: false,
}))
vi.mock('#/auth/useAuthSession', () => ({
  useAuthSession: () => sessionMock(),
}))

const { BurgerNav } = await import('./BurgerNav')

describe('BurgerNav', () => {
  it('toggles the menu open and closed', () => {
    const { getByLabelText, queryByLabelText, getAllByLabelText } = render(
      <BurgerNav />,
    )
    expect(getByLabelText('Open menu')).toBeTruthy()
    fireEvent.click(getByLabelText('Open menu'))
    expect(queryByLabelText('Open menu')).toBeNull()
    // Close controls (× and overlay) appear when open.
    const closes = getAllByLabelText('Close menu')
    expect(closes.length).toBeGreaterThan(0)
    fireEvent.click(closes[0])
    expect(getByLabelText('Open menu')).toBeTruthy()
  })

  it('signed out: profile block + Sign in + nav links', () => {
    sessionMock.mockReturnValue({ session: null, isPending: false })
    const { getByText } = render(<BurgerNav />)
    expect(getByText('Hello,')).toBeTruthy()
    expect(getByText('Stranger.')).toBeTruthy()
    expect(getByText('Sign in')).toBeTruthy()
    expect(getByText('Home')).toBeTruthy()
    expect(getByText('Settings')).toBeTruthy()
    expect(getByText('Statistics')).toBeTruthy()
  })

  it('signed in: name + Sign out', () => {
    sessionMock.mockReturnValue({
      session: {
        user: {
          id: 'u1',
          name: 'Grace Hopper',
          email: 'grace@example.com',
          image: null,
        },
      },
      isPending: false,
    })
    const { getByText } = render(<BurgerNav />)
    expect(getByText('Grace Hopper')).toBeTruthy()
    expect(getByText('Sign out')).toBeTruthy()
  })
})
