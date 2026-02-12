import { mockUser } from '~/utils/mock-data'
import type { UserProfile } from '~/types'

// Mock auth mode: simulates Appwrite auth with local state
// Will be replaced with real Appwrite calls in Phase 7
const MOCK_MODE = true

interface LoginParams {
  email: string
  password: string
}

interface RegisterParams {
  name: string
  email: string
  password: string
}

export function useAuth() {
  const authStore = useAuthStore()
  const toast = useToast()

  /**
   * Initialize auth state – check if user has an active session
   */
  async function init() {
    if (authStore.initialized) return

    authStore.setLoading(true)
    try {
      if (MOCK_MODE) {
        // In mock mode, check localStorage for mock session
        if (import.meta.client) {
          const savedSession = localStorage.getItem('vault-mock-session')
          if (savedSession) {
            authStore.setUser(JSON.parse(savedSession) as UserProfile)
          }
        }
      } else {
        // Real Appwrite: check active session
        // const { account } = useAppwrite()
        // const user = await account.get()
        // authStore.setUser(mapAppwriteUser(user))
      }
    } catch {
      authStore.setUser(null)
    } finally {
      authStore.setLoading(false)
      authStore.setInitialized()
    }
  }

  /**
   * Login with email and password
   */
  async function login({ email, password }: LoginParams) {
    authStore.setLoading(true)
    try {
      if (MOCK_MODE) {
        // Simulate login delay
        await new Promise(resolve => setTimeout(resolve, 500))

        // Accept any email/password combo in mock mode
        if (!email || !password) {
          throw new Error('Email and password are required')
        }

        const user: UserProfile = {
          ...mockUser,
          email,
          displayName: email.split('@')[0] || mockUser.displayName
        }

        authStore.setUser(user)
        if (import.meta.client) {
          localStorage.setItem('vault-mock-session', JSON.stringify(user))
        }
      } else {
        // Real Appwrite
        // const { account } = useAppwrite()
        // await account.createEmailPasswordSession({ email, password })
        // const user = await account.get()
        // authStore.setUser(mapAppwriteUser(user))
      }

      toast.add({ title: 'Welcome back!', description: 'You have been logged in successfully.' })
      await navigateTo('/vault')
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Login failed. Please try again.'
      toast.add({ title: 'Login failed', description: message, color: 'error' })
      throw error
    } finally {
      authStore.setLoading(false)
    }
  }

  /**
   * Register a new account
   */
  async function register({ name, email, password }: RegisterParams) {
    authStore.setLoading(true)
    try {
      if (MOCK_MODE) {
        // Simulate registration delay
        await new Promise(resolve => setTimeout(resolve, 500))

        if (!name || !email || !password) {
          throw new Error('All fields are required')
        }

        const user: UserProfile = {
          ...mockUser,
          displayName: name,
          email
        }

        authStore.setUser(user)
        if (import.meta.client) {
          localStorage.setItem('vault-mock-session', JSON.stringify(user))
        }
      } else {
        // Real Appwrite
        // const { account, ID } = useAppwrite()
        // await account.create({ userId: ID.unique(), email, password, name })
        // await account.createEmailPasswordSession({ email, password })
        // const user = await account.get()
        // authStore.setUser(mapAppwriteUser(user))
      }

      toast.add({ title: 'Welcome!', description: 'Your account has been created.' })
      await navigateTo('/vault')
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Registration failed. Please try again.'
      toast.add({ title: 'Registration failed', description: message, color: 'error' })
      throw error
    } finally {
      authStore.setLoading(false)
    }
  }

  /**
   * Logout current user
   */
  async function logout() {
    authStore.setLoading(true)
    try {
      if (MOCK_MODE) {
        await new Promise(resolve => setTimeout(resolve, 200))
        if (import.meta.client) {
          localStorage.removeItem('vault-mock-session')
        }
      } else {
        // Real Appwrite
        // const { account } = useAppwrite()
        // await account.deleteSession({ sessionId: 'current' })
      }

      authStore.clear()
      toast.add({ title: 'Logged out', description: 'See you next time!' })
      await navigateTo('/')
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Logout failed.'
      toast.add({ title: 'Logout failed', description: message, color: 'error' })
    } finally {
      authStore.setLoading(false)
    }
  }

  /**
   * Login with OAuth provider (mock: direct login)
   */
  async function loginWithOAuth(provider: 'github' | 'google' | 'apple') {
    authStore.setLoading(true)
    try {
      if (MOCK_MODE) {
        await new Promise(resolve => setTimeout(resolve, 500))

        const user: UserProfile = {
          ...mockUser,
          displayName: `${provider.charAt(0).toUpperCase() + provider.slice(1)} User`
        }

        authStore.setUser(user)
        if (import.meta.client) {
          localStorage.setItem('vault-mock-session', JSON.stringify(user))
        }
      } else {
        // Real Appwrite
        // const { account, OAuthProvider } = useAppwrite()
        // const providerMap = { github: OAuthProvider.Github, google: OAuthProvider.Google, apple: OAuthProvider.Apple }
        // account.createOAuth2Session({ provider: providerMap[provider], success: `${window.location.origin}/vault`, failure: `${window.location.origin}/login` })
      }

      toast.add({ title: 'Welcome!', description: `Logged in with ${provider}.` })
      await navigateTo('/vault')
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'OAuth login failed.'
      toast.add({ title: 'Login failed', description: message, color: 'error' })
    } finally {
      authStore.setLoading(false)
    }
  }

  return {
    init,
    login,
    register,
    logout,
    loginWithOAuth,
    user: computed(() => authStore.user),
    isAuthenticated: computed(() => authStore.isAuthenticated),
    isSubscribed: computed(() => authStore.isSubscribed),
    loading: computed(() => authStore.loading),
    initialized: computed(() => authStore.initialized)
  }
}
