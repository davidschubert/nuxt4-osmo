import { defineStore } from 'pinia'
import type { UserProfile, SubscriptionStatus } from '~/types'

interface AuthState {
  user: UserProfile | null
  loading: boolean
  initialized: boolean
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    loading: false,
    initialized: false
  }),

  getters: {
    isAuthenticated: (state): boolean => !!state.user,
    isSubscribed: (state): boolean => state.user?.subscriptionStatus === 'active',
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

    setLoading(loading: boolean) {
      this.loading = loading
    },

    setInitialized() {
      this.initialized = true
    },

    clear() {
      this.user = null
      this.loading = false
    }
  }
})
