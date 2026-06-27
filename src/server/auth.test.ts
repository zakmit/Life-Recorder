import { describe, expect, it } from 'vitest'
import { UnauthorizedError, assertUser } from './auth'
import type { SessionUser } from '#/auth/session'

const user: SessionUser = {
  id: 'alice',
  email: 'alice@example.com',
  name: 'Alice',
  image: null,
}

describe('assertUser', () => {
  it('returns the user when a session exists', () => {
    expect(assertUser(user)).toBe(user)
  })

  it('throws UnauthorizedError for an anonymous (null) session', () => {
    expect(() => assertUser(null)).toThrow(UnauthorizedError)
  })
})
