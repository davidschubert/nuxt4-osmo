import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useAuthStore } from '~/stores/auth'
import type { UserProfile } from '~/types'

const mockUser: UserProfile = {
  $id: 'user-1',
  userId: 'user-1',
  displayName: 'David Schubert',
  email: 'test@example.com',
  subscriptionStatus: 'free'
}

describe('useAuthStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('has correct initial state', () => {
    const store = useAuthStore()
    expect(store.user).toBeNull()
    expect(store.loading).toBe(false)
    expect(store.initialized).toBe(false)
    expect(store.accountLabels).toEqual([])
  })

  it('setUser sets and clears user', () => {
    const store = useAuthStore()
    store.setUser(mockUser)
    expect(store.user).toEqual(mockUser)

    store.setUser(null)
    expect(store.user).toBeNull()
  })

  it('isAuthenticated reflects user presence', () => {
    const store = useAuthStore()
    expect(store.isAuthenticated).toBe(false)

    store.setUser(mockUser)
    expect(store.isAuthenticated).toBe(true)

    store.setUser(null)
    expect(store.isAuthenticated).toBe(false)
  })

  it('isAdmin checks accountLabels for admin', () => {
    const store = useAuthStore()
    expect(store.isAdmin).toBe(false)

    store.setAccountLabels(['user'])
    expect(store.isAdmin).toBe(false)

    store.setAccountLabels(['admin'])
    expect(store.isAdmin).toBe(true)

    store.setAccountLabels(['user', 'admin'])
    expect(store.isAdmin).toBe(true)
  })

  it('isSubscribed checks subscription status active', () => {
    const store = useAuthStore()
    expect(store.isSubscribed).toBe(false)

    store.setUser({ ...mockUser, subscriptionStatus: 'free' })
    expect(store.isSubscribed).toBe(false)

    store.setUser({ ...mockUser, subscriptionStatus: 'active' })
    expect(store.isSubscribed).toBe(true)

    store.setUser({ ...mockUser, subscriptionStatus: 'canceled' })
    expect(store.isSubscribed).toBe(false)

    store.setUser({ ...mockUser, subscriptionStatus: 'past_due' })
    expect(store.isSubscribed).toBe(false)
  })

  it('subscriptionStatus defaults to free when no user', () => {
    const store = useAuthStore()
    expect(store.subscriptionStatus).toBe('free')

    store.setUser({ ...mockUser, subscriptionStatus: 'active' })
    expect(store.subscriptionStatus).toBe('active')
  })

  it('initials computes from displayName', () => {
    const store = useAuthStore()
    expect(store.initials).toBe('')

    store.setUser({ ...mockUser, displayName: 'David Schubert' })
    expect(store.initials).toBe('DS')

    store.setUser({ ...mockUser, displayName: 'Alice' })
    expect(store.initials).toBe('A')

    store.setUser({ ...mockUser, displayName: 'John Michael Doe' })
    expect(store.initials).toBe('JM')
  })

  it('displayName returns name or empty string', () => {
    const store = useAuthStore()
    expect(store.displayName).toBe('')

    store.setUser(mockUser)
    expect(store.displayName).toBe('David Schubert')
  })

  it('clear resets all state including initialized', () => {
    const store = useAuthStore()
    store.setUser(mockUser)
    store.setAccountLabels(['admin'])
    store.setLoading(true)
    store.setInitialized()

    store.clear()

    expect(store.user).toBeNull()
    expect(store.accountLabels).toEqual([])
    expect(store.loading).toBe(false)
    expect(store.initialized).toBe(false) // reset so init() runs again on next login
  })

  it('setInitialized marks store as initialized', () => {
    const store = useAuthStore()
    expect(store.initialized).toBe(false)

    store.setInitialized()
    expect(store.initialized).toBe(true)
  })
})
