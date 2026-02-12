import { mockUser } from '~/utils/mock-data'
import type { UserProfile } from '~/types'
import { APPWRITE } from '~/utils/constants'

// Auto-detect mock mode: active when no Appwrite project is configured
const MOCK_MODE = !import.meta.env.NUXT_PUBLIC_APPWRITE_PROJECT
  || import.meta.env.NUXT_PUBLIC_APPWRITE_PROJECT === ''
  || import.meta.env.NUXT_PUBLIC_APPWRITE_PROJECT === 'placeholder'

interface LoginParams {
  email: string
  password: string
}

interface RegisterParams {
  name: string
  email: string
  password: string
}

/**
 * Map Appwrite user + optional profile document to our UserProfile interface
 */
function mapAppwriteUser(
  user: Record<string, unknown>,
  profile?: Record<string, unknown> | null
): UserProfile {
  return {
    $id: (profile?.$id as string) || (user.$id as string),
    userId: user.$id as string,
    displayName: (user.name as string) || (user.email as string)?.split('@')[0] || 'User',
    email: user.email as string,
    avatarUrl: (profile?.avatarUrl as string) || undefined,
    subscriptionStatus: (profile?.subscriptionStatus as UserProfile['subscriptionStatus']) || 'free',
    stripeCustomerId: (profile?.stripeCustomerId as string) || undefined,
    stripeSubscriptionId: (profile?.stripeSubscriptionId as string) || undefined,
    subscribedAt: (profile?.subscribedAt as string) || undefined
  }
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
        if (import.meta.client) {
          const savedSession = localStorage.getItem('vault-mock-session')
          if (savedSession) {
            authStore.setUser(JSON.parse(savedSession) as UserProfile)
          }
        }
      } else {
        const { account, database } = useAppwrite()
        const user = await account.get()
        // Try to fetch user profile from database
        let profile: Record<string, unknown> | null = null
        try {
          profile = await database.getDocument(
            APPWRITE.DATABASE_ID,
            APPWRITE.COLLECTIONS.USER_PROFILES,
            user.$id
          )
        } catch {
          // Profile may not exist yet for new users
        }
        authStore.setUser(mapAppwriteUser(user as unknown as Record<string, unknown>, profile))
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
        await new Promise(resolve => setTimeout(resolve, 500))
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
        const { account, database } = useAppwrite()
        await account.createEmailPasswordSession(email, password)
        const user = await account.get()
        let profile: Record<string, unknown> | null = null
        try {
          profile = await database.getDocument(
            APPWRITE.DATABASE_ID,
            APPWRITE.COLLECTIONS.USER_PROFILES,
            user.$id
          )
        } catch {
          // Profile may not exist yet
        }
        authStore.setUser(mapAppwriteUser(user as unknown as Record<string, unknown>, profile))
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
        const { account, database, ID, Permission, Role } = useAppwrite()
        // Create Appwrite account
        await account.create(ID.unique(), email, password, name)
        // Auto-login after registration
        await account.createEmailPasswordSession(email, password)
        const user = await account.get()
        // Create user profile document (for subscription tracking)
        try {
          await database.createDocument(
            APPWRITE.DATABASE_ID,
            APPWRITE.COLLECTIONS.USER_PROFILES,
            user.$id,
            {
              userId: user.$id,
              displayName: name,
              subscriptionStatus: 'free'
            },
            [
              Permission.read(Role.user(user.$id)),
              Permission.update(Role.user(user.$id))
            ]
          )
        } catch {
          // Profile creation may fail if collection isn't set up yet
        }
        authStore.setUser(mapAppwriteUser(user as unknown as Record<string, unknown>))
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
        const { account } = useAppwrite()
        await account.deleteSession('current')
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
   * Login with OAuth provider
   * Note: OAuth redirects the browser, so this function does not return in real mode
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
        toast.add({ title: 'Welcome!', description: `Logged in with ${provider}.` })
        await navigateTo('/vault')
      } else {
        const { account } = useAppwrite()
        // OAuth redirects the browser – this call does not return
        account.createOAuth2Session(
          provider as never,
          `${window.location.origin}/vault`,
          `${window.location.origin}/login`
        )
      }
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
