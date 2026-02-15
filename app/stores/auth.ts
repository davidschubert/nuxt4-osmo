import { defineStore } from 'pinia'
import type { UserProfile, SubscriptionStatus } from '~/types'

interface AuthState {
  user: UserProfile | null
  accountLabels: string[]
  emailVerified: boolean
  loading: boolean
  initialized: boolean
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    accountLabels: [],
    emailVerified: false,
    loading: false,
    initialized: false
  }),

  getters: {
    isAuthenticated: (state): boolean => !!state.user,
    isAdmin: (state): boolean => state.accountLabels.includes('admin'),
    isSubscribed: (state): boolean => state.user?.subscriptionStatus === 'active',
    isEmailVerified: (state): boolean => state.emailVerified,
    subscriptionStatus: (state): SubscriptionStatus => state.user?.subscriptionStatus ?? 'free',
    displayName: (state): string => state.user?.displayName ?? '',
    initials: (state): string => {
      if (!state.user?.displayName) return ''
      return state.user.displayName
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
  },

  actions: {
    setUser(user: UserProfile | null) {
      this.user = user
    },

    setAccountLabels(labels: string[]) {
      this.accountLabels = labels
    },

    setEmailVerified(verified: boolean) {
      this.emailVerified = verified
    },

    setLoading(loading: boolean) {
      this.loading = loading
    },

    setInitialized() {
      this.initialized = true
    },

    clear() {
      this.user = null
      this.accountLabels = []
      this.emailVerified = false
      this.loading = false
    }
  }
})
