import { describe, it, expect } from 'vitest'
import { isAppwriteError, mapAppwriteUser } from '~/utils/auth'
import type { AppwriteUser } from '~/utils/auth'

const baseUser: AppwriteUser = {
  $id: 'user-123',
  email: 'test@example.com',
  name: 'Test User',
  emailVerification: true,
  labels: []
}

describe('isAppwriteError', () => {
  it('returns true for objects with code and message', () => {
    expect(isAppwriteError({ code: 409, message: 'Conflict' })).toBe(true)
  })

  it('returns false for null', () => {
    expect(isAppwriteError(null)).toBe(false)
  })

  it('returns false for undefined', () => {
    expect(isAppwriteError(undefined)).toBe(false)
  })

  it('returns false for a string', () => {
    expect(isAppwriteError('some error')).toBe(false)
  })

  it('returns false for objects missing code', () => {
    expect(isAppwriteError({ message: 'only message' })).toBe(false)
  })

  it('returns false for objects missing message', () => {
    expect(isAppwriteError({ code: 500 })).toBe(false)
  })

  it('returns true for Error-like objects with code and message', () => {
    const err = new Error('test')
    ;(err as unknown as Record<string, unknown>).code = 401
    expect(isAppwriteError(err)).toBe(true)
  })
})

describe('mapAppwriteUser', () => {
  it('maps user without profile', () => {
    const result = mapAppwriteUser(baseUser)
    expect(result).toEqual({
      $id: 'user-123',
      userId: 'user-123',
      displayName: 'Test User',
      email: 'test@example.com',
      avatarUrl: undefined,
      subscriptionStatus: 'free',
      stripeCustomerId: undefined,
      stripeSubscriptionId: undefined,
      subscribedAt: undefined,
      teamId: undefined,
      planType: undefined
    })
  })

  it('maps user with null profile', () => {
    const result = mapAppwriteUser(baseUser, null)
    expect(result.userId).toBe('user-123')
    expect(result.subscriptionStatus).toBe('free')
  })

  it('uses profile.$id when profile exists', () => {
    const profile = { $id: 'profile-456', subscriptionStatus: 'active' }
    const result = mapAppwriteUser(baseUser, profile)
    expect(result.$id).toBe('profile-456')
    expect(result.userId).toBe('user-123')
  })

  it('merges subscription data from profile', () => {
    const profile = {
      $id: 'profile-456',
      subscriptionStatus: 'active',
      stripeCustomerId: 'cus_abc',
      stripeSubscriptionId: 'sub_xyz',
      subscribedAt: '2025-01-01T00:00:00Z',
      planType: 'solo',
      teamId: 'team-1'
    }
    const result = mapAppwriteUser(baseUser, profile)
    expect(result.subscriptionStatus).toBe('active')
    expect(result.stripeCustomerId).toBe('cus_abc')
    expect(result.stripeSubscriptionId).toBe('sub_xyz')
    expect(result.subscribedAt).toBe('2025-01-01T00:00:00Z')
    expect(result.planType).toBe('solo')
    expect(result.teamId).toBe('team-1')
  })

  it('falls back to email prefix when user has no name', () => {
    const noNameUser = { ...baseUser, name: '' }
    const result = mapAppwriteUser(noNameUser)
    expect(result.displayName).toBe('test')
  })

  it('falls back to "User" when no name and no email prefix', () => {
    const emptyUser = { ...baseUser, name: '', email: '' }
    const result = mapAppwriteUser(emptyUser)
    expect(result.displayName).toBe('User')
  })

  it('maps avatarUrl from profile', () => {
    const profile = { $id: 'p-1', avatarUrl: 'https://example.com/avatar.jpg' }
    const result = mapAppwriteUser(baseUser, profile)
    expect(result.avatarUrl).toBe('https://example.com/avatar.jpg')
  })
})
