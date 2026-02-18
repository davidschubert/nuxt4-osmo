import { APPWRITE } from '~/utils/constants'

export function useSubscription() {
  const authStore = useAuthStore()
  const toast = useToast()
  const MOCK_MODE = isMockMode()
  const checkoutLoading = ref(false)
  const portalLoading = ref(false)

  /**
   * Navigate to the embedded checkout flow.
   * Replaces the old Stripe Hosted Checkout redirect.
   *
   * @param _priceId - Deprecated, plan is selected via URL
   * @param mode - Checkout mode: 'subscription' for recurring, 'payment' for one-time (Lifetime)
   */
  async function startCheckout(_priceId?: string, mode: 'subscription' | 'payment' = 'subscription') {
    const planSlug = mode === 'payment' ? 'lifetime' : 'subscription'
    await navigateTo(`/plans/${planSlug}`)
  }

  /**
   * Open Stripe Customer Portal for subscription management.
   * In mock mode, shows a toast that portal is unavailable.
   */
  async function openPortal() {
    const user = authStore.user
    if (!user) return

    if (MOCK_MODE) {
      toast.add({
        title: 'Mock mode',
        description: 'Customer portal is not available in mock mode.'
      })
      return
    }

    portalLoading.value = true
    try {
      const response = await $fetch<{ url: string }>('/api/stripe/portal', {
        method: 'POST',
        body: { userId: user.userId }
      })

      if (response.url) {
        window.location.href = response.url
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to open portal'
      toast.add({
        title: 'Portal failed',
        description: message,
        color: 'error'
      })
    } finally {
      portalLoading.value = false
    }
  }

  /**
   * Refresh subscription status from Appwrite.
   * Called after returning from Stripe Checkout to pick up webhook updates.
   */
  async function refreshStatus() {
    const user = authStore.user
    if (!user) return

    if (MOCK_MODE) return

    try {
      const { databases } = useAppwrite()
      const profile = await databases.getDocument({
        databaseId: APPWRITE.DATABASE_ID,
        collectionId: APPWRITE.COLLECTIONS.USER_PROFILES,
        documentId: user.userId
      })

      authStore.setUser({
        ...user,
        subscriptionStatus: (profile.subscriptionStatus as typeof user.subscriptionStatus) || 'free',
        stripeCustomerId: (profile.stripeCustomerId as string) || undefined,
        stripeSubscriptionId: (profile.stripeSubscriptionId as string) || undefined,
        subscribedAt: (profile.subscribedAt as string) || undefined,
        planType: (profile.planType as typeof user.planType) || undefined,
        teamId: (profile.teamId as string) || undefined
      })
    } catch (error) {
      console.error('Failed to refresh subscription status:', error)
    }
  }

  /**
   * Cancel subscription in mock mode (for testing).
   * In real mode, cancellation happens through the Stripe Customer Portal.
   */
  async function mockCancelSubscription() {
    if (!MOCK_MODE) return
    const user = authStore.user
    if (!user) return

    authStore.setUser({
      ...user,
      subscriptionStatus: 'free',
      stripeSubscriptionId: undefined,
      subscribedAt: undefined,
      planType: undefined
    })
    if (import.meta.client) {
      localStorage.setItem('vault-mock-session', JSON.stringify(authStore.user))
    }
    toast.add({
      title: 'Subscription canceled',
      description: 'Mock cancellation complete.'
    })
  }

  return {
    startCheckout,
    openPortal,
    refreshStatus,
    mockCancelSubscription,
    checkoutLoading: computed(() => checkoutLoading.value),
    portalLoading: computed(() => portalLoading.value),
    isMockMode: MOCK_MODE
  }
}
