import { mockUser } from '~/utils/mock-data'
import type { UserProfile } from '~/types'
import { APPWRITE } from '~/utils/constants'
import { isAppwriteError, mapAppwriteUser } from '~/utils/auth'
import type { AppwriteUser } from '~/utils/auth'

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
 * Ensure a user-profiles document exists for the given user.
 * Creates one if it doesn't exist (e.g. first OAuth login).
 * Handles 409 Conflict from concurrent profile creation (race condition).
 */
async function ensureProfile(
  databases: ReturnType<typeof useAppwrite>['databases'],
  Permission: ReturnType<typeof useAppwrite>['Permission'],
  Role: ReturnType<typeof useAppwrite>['Role'],
  user: AppwriteUser
): Promise<Record<string, unknown> | null> {
  try {
    return await databases.getDocument({
      databaseId: APPWRITE.DATABASE_ID,
      collectionId: APPWRITE.COLLECTIONS.USER_PROFILES,
      documentId: user.$id
    })
  } catch {
    // Profile doesn't exist — create it (first login / first OAuth)
    try {
      return await databases.createDocument({
        databaseId: APPWRITE.DATABASE_ID,
        collectionId: APPWRITE.COLLECTIONS.USER_PROFILES,
        documentId: user.$id,
        data: {
          userId: user.$id,
          displayName: user.name || user.email?.split('@')[0] || 'User',
          subscriptionStatus: 'free'
        } as Record<string, unknown>,
        permissions: [
          Permission.read(Role.user(user.$id)),
          Permission.update(Role.user(user.$id))
        ]
      })
    } catch (createErr: unknown) {
      // 409 = document already created by a concurrent request (race condition)
      if (isAppwriteError(createErr) && createErr.code === 409) {
        try {
          return await databases.getDocument({
            databaseId: APPWRITE.DATABASE_ID,
            collectionId: APPWRITE.COLLECTIONS.USER_PROFILES,
            documentId: user.$id
          })
        } catch {
          // Fall through to return null
        }
      }
      console.error('[ensureProfile] Failed to create user profile:', createErr)
      return null
    }
  }
}

export function useAuth() {
  const authStore = useAuthStore()
  const toast = useToast()
  const MOCK_MODE = isMockMode()

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
            authStore.setAccountLabels(['admin'])
            authStore.setEmailVerified(true)
          }
        }
      } else {
        const { account, databases, Permission, Role } = useAppwrite()
        const rawUser = await account.get()
        const user = rawUser as unknown as AppwriteUser
        // Set email verification status from Appwrite account
        authStore.setEmailVerified(user.emailVerification ?? false)
        // Ensure profile exists (creates on first OAuth login)
        const profile = await ensureProfile(databases, Permission, Role, user)
        authStore.setAccountLabels(user.labels ?? [])
        authStore.setUser(mapAppwriteUser(user, profile))
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
        authStore.setAccountLabels(['admin'])
        authStore.setEmailVerified(true)
        if (import.meta.client) {
          localStorage.setItem('vault-mock-session', JSON.stringify(user))
        }
      } else {
        const { account, databases, Permission, Role } = useAppwrite()
        await account.createEmailPasswordSession({ email, password })
        const rawUser = await account.get()
        const user = rawUser as unknown as AppwriteUser
        authStore.setEmailVerified(user.emailVerification ?? false)
        authStore.setAccountLabels(user.labels ?? [])
        const profile = await ensureProfile(databases, Permission, Role, user)
        authStore.setUser(mapAppwriteUser(user, profile))
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
        authStore.setAccountLabels(['admin'])
        authStore.setEmailVerified(true)
        if (import.meta.client) {
          localStorage.setItem('vault-mock-session', JSON.stringify(user))
        }
        toast.add({ title: 'Welcome!', description: 'Your account has been created.' })
        await navigateTo('/vault')
      } else {
        const { account, databases, ID, Permission, Role } = useAppwrite()
        // Create Appwrite account
        await account.create({ userId: ID.unique(), email, password, name })
        // Auto-login after registration
        await account.createEmailPasswordSession({ email, password })
        const rawUser = await account.get()
        const user = rawUser as unknown as AppwriteUser
        authStore.setEmailVerified(false) // New user, not yet verified
        authStore.setAccountLabels(user.labels ?? [])
        // Create user profile document
        const profile = await ensureProfile(databases, Permission, Role, user)
        authStore.setUser(mapAppwriteUser(user, profile))

        // Send email verification
        try {
          const config = useRuntimeConfig()
          const appUrl = config.public.appUrl as string
          await account.createVerification({
            url: `${appUrl}/verify-email`
          })
        } catch (err) {
          console.error('[register] Failed to send verification email:', err)
        }

        toast.add({
          title: 'Check your email!',
          description: 'We sent you a verification link. Please verify your email to continue.'
        })
        await navigateTo('/welcome')
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Registration failed. Please try again.'
      toast.add({ title: 'Registration failed', description: message, color: 'error' })
      throw error
    } finally {
      authStore.setLoading(false)
    }
  }

  /**
   * Resend email verification
   */
  async function resendVerification() {
    if (MOCK_MODE) return
    try {
      const { account } = useAppwrite()
      const config = useRuntimeConfig()
      const appUrl = config.public.appUrl as string
      await account.createVerification({
        url: `${appUrl}/verify-email`
      })
      toast.add({
        title: 'Verification email sent!',
        description: 'Please check your inbox.'
      })
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Could not send verification email.'
      toast.add({ title: 'Error', description: message, color: 'error' })
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
        await account.deleteSession({ sessionId: 'current' })
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
  async function loginWithOAuth(provider: 'github' | 'google') {
    authStore.setLoading(true)
    try {
      if (MOCK_MODE) {
        await new Promise(resolve => setTimeout(resolve, 500))
        const user: UserProfile = {
          ...mockUser,
          displayName: `${provider.charAt(0).toUpperCase() + provider.slice(1)} User`
        }
        authStore.setUser(user)
        authStore.setAccountLabels(['admin'])
        authStore.setEmailVerified(true)
        if (import.meta.client) {
          localStorage.setItem('vault-mock-session', JSON.stringify(user))
        }
        toast.add({ title: 'Welcome!', description: `Logged in with ${provider}.` })
        await navigateTo('/vault')
      } else {
        const { account, OAuthProvider } = useAppwrite()
        type OAuthProviderType = typeof OAuthProvider[keyof typeof OAuthProvider]
        const providerMap: Record<string, OAuthProviderType> = {
          github: OAuthProvider.Github,
          google: OAuthProvider.Google
        }
        // Use createOAuth2Token (not createOAuth2Session) so the callback
        // receives userId + secret as query params. This avoids third-party
        // cookie issues where the session cookie set by Appwrite's domain
        // is not available on our origin (localhost / custom domain).
        // The /oauth/callback page will call account.createSession() to
        // establish the session via the SDK's cookie-fallback mechanism.
        const config = useRuntimeConfig()
        const appUrl = config.public.appUrl as string
        account.createOAuth2Token({
          provider: providerMap[provider]!,
          success: `${appUrl}/oauth/callback`,
          failure: `${appUrl}/login?error=oauth`
        })
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'OAuth login failed.'
      toast.add({ title: 'Login failed', description: message, color: 'error' })
    } finally {
      authStore.setLoading(false)
    }
  }

  /**
   * Update display name
   */
  async function updateDisplayName(name: string) {
    if (!name.trim()) {
      toast.add({ title: 'Error', description: 'Name cannot be empty.', color: 'error' })
      return
    }
    try {
      if (MOCK_MODE) {
        if (authStore.user) {
          const updated = { ...authStore.user, displayName: name }
          authStore.setUser(updated)
          if (import.meta.client) {
            localStorage.setItem('vault-mock-session', JSON.stringify(updated))
          }
        }
      } else {
        const { account, databases } = useAppwrite()
        await account.updateName({ name })
        // Also update user profile document
        if (authStore.user) {
          try {
            await databases.updateDocument({
              databaseId: APPWRITE.DATABASE_ID,
              collectionId: APPWRITE.COLLECTIONS.USER_PROFILES,
              documentId: authStore.user.userId,
              data: { displayName: name }
            })
          } catch {
            // Profile update is non-critical
          }
          authStore.setUser({ ...authStore.user, displayName: name })
        }
      }
      toast.add({ title: 'Name updated', description: 'Your display name has been changed.' })
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Could not update name.'
      toast.add({ title: 'Update failed', description: message, color: 'error' })
      throw error
    }
  }

  /**
   * Update email (requires current password for verification)
   */
  async function updateUserEmail(newEmail: string, password: string) {
    if (!newEmail.trim() || !password) {
      toast.add({ title: 'Error', description: 'Email and password are required.', color: 'error' })
      return
    }
    try {
      if (MOCK_MODE) {
        if (authStore.user) {
          const updated = { ...authStore.user, email: newEmail }
          authStore.setUser(updated)
          if (import.meta.client) {
            localStorage.setItem('vault-mock-session', JSON.stringify(updated))
          }
        }
      } else {
        const { account } = useAppwrite()
        await account.updateEmail({ email: newEmail, password })
        if (authStore.user) {
          authStore.setUser({ ...authStore.user, email: newEmail })
        }
      }
      toast.add({ title: 'Email updated', description: 'Your email address has been changed.' })
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Could not update email.'
      toast.add({ title: 'Update failed', description: message, color: 'error' })
      throw error
    }
  }

  /**
   * Update password (requires current password)
   */
  async function updatePassword(oldPassword: string, newPassword: string) {
    if (!oldPassword || !newPassword) {
      toast.add({ title: 'Error', description: 'Both passwords are required.', color: 'error' })
      return
    }
    if (newPassword.length < 8) {
      toast.add({ title: 'Error', description: 'New password must be at least 8 characters.', color: 'error' })
      return
    }
    try {
      if (MOCK_MODE) {
        await new Promise(resolve => setTimeout(resolve, 300))
      } else {
        const { account } = useAppwrite()
        await account.updatePassword({ password: newPassword, oldPassword })
      }
      toast.add({ title: 'Password updated', description: 'Your password has been changed.' })
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Could not update password.'
      toast.add({ title: 'Update failed', description: message, color: 'error' })
      throw error
    }
  }

  return {
    init,
    login,
    register,
    logout,
    loginWithOAuth,
    resendVerification,
    updateDisplayName,
    updateUserEmail,
    updatePassword,
    user: computed(() => authStore.user),
    isAuthenticated: computed(() => authStore.isAuthenticated),
    isAdmin: computed(() => authStore.isAdmin),
    isSubscribed: computed(() => authStore.isSubscribed),
    emailVerified: computed(() => authStore.isEmailVerified),
    loading: computed(() => authStore.loading),
    initialized: computed(() => authStore.initialized)
  }
}
