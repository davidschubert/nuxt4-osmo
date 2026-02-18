import { describe, it, expect, beforeEach } from 'vitest'
import { mockUser } from '~/utils/mock-data'

// The Nuxt test environment has no appwriteProject configured,
// so isMockMode() returns true — we test mock mode paths here.

describe('useSubscription (mock mode)', () => {
  beforeEach(() => {
    const authStore = useAuthStore()
    authStore.clear()
    localStorage.clear()
  })

  it('returns expected interface', () => {
    const sub = useSubscription()
    expect(sub).toHaveProperty('startCheckout')
    expect(sub).toHaveProperty('openPortal')
    expect(sub).toHaveProperty('refreshStatus')
    expect(sub).toHaveProperty('mockCancelSubscription')
    expect(sub).toHaveProperty('checkoutLoading')
    expect(sub).toHaveProperty('portalLoading')
    expect(sub).toHaveProperty('isMockMode')
  })

  it('isMockMode is true in test environment', () => {
    const { isMockMode } = useSubscription()
    expect(isMockMode).toBe(true)
  })

  describe('startCheckout', () => {
    it('navigates to /plans/subscription for subscription mode', async () => {
      const { startCheckout } = useSubscription()
      // Should not throw — navigates to the embedded checkout page
      await startCheckout('price_123', 'subscription')
    })

    it('navigates to /plans/lifetime for payment mode', async () => {
      const { startCheckout } = useSubscription()
      await startCheckout('price_lifetime', 'payment')
    })

    it('defaults to subscription plan', async () => {
      const { startCheckout } = useSubscription()
      await startCheckout()
    })
  })

  describe('openPortal', () => {
    it('returns early when no user', async () => {
      const { openPortal, portalLoading } = useSubscription()
      await openPortal()
      expect(portalLoading.value).toBe(false)
    })

    it('shows toast in mock mode', async () => {
      const authStore = useAuthStore()
      authStore.setUser(mockUser)

      const { openPortal } = useSubscription()
      // Should not throw in mock mode
      await openPortal()
    })
  })

  describe('mockCancelSubscription', () => {
    it('resets subscription to free', async () => {
      const authStore = useAuthStore()
      authStore.setUser({
        ...mockUser,
        subscriptionStatus: 'active',
        stripeSubscriptionId: 'sub_123',
        subscribedAt: '2025-01-01',
        planType: 'solo'
      })

      const { mockCancelSubscription } = useSubscription()
      await mockCancelSubscription()

      expect(authStore.user?.subscriptionStatus).toBe('free')
      expect(authStore.user?.stripeSubscriptionId).toBeUndefined()
      expect(authStore.user?.subscribedAt).toBeUndefined()
      expect(authStore.user?.planType).toBeUndefined()
    })

    it('does nothing when no user', async () => {
      const { mockCancelSubscription } = useSubscription()
      await mockCancelSubscription() // should not throw
    })

    it('updates localStorage', async () => {
      const authStore = useAuthStore()
      authStore.setUser({
        ...mockUser,
        subscriptionStatus: 'active',
        planType: 'solo'
      })

      const { mockCancelSubscription } = useSubscription()
      await mockCancelSubscription()

      const stored = localStorage.getItem('vault-mock-session')
      expect(stored).toBeTruthy()
      const parsed = JSON.parse(stored!)
      expect(parsed.subscriptionStatus).toBe('free')
    })
  })

  describe('refreshStatus', () => {
    it('returns early when no user', async () => {
      const { refreshStatus } = useSubscription()
      await refreshStatus() // should not throw
    })

    it('is a no-op in mock mode', async () => {
      const authStore = useAuthStore()
      authStore.setUser(mockUser)

      const { refreshStatus } = useSubscription()
      await refreshStatus()

      // User should be unchanged
      expect(authStore.user?.subscriptionStatus).toBe(mockUser.subscriptionStatus)
    })
  })
})
