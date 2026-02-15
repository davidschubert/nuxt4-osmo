import { mockUser } from '~/utils/mock-data'
import type { UserProfile } from '~/types'
import { APPWRITE } from '~/utils/constants'

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
    subscribedAt: (profile?.subscribedAt as string) || undefined,
    teamId: (profile?.teamId as string) || undefined,
    planType: (profile?.planType as UserProfile['planType']) || undefined
  }
}

/**
 * Ensure a user-profiles document exists for the given user.
 * Creates one if it doesn't exist (e.g. first OAuth login).
 */
async function ensureProfile(
  databases: ReturnType<typeof useAppwrite>['databases'],
  Permission: ReturnType<typeof useAppwrite>['Permission'],
  Role: ReturnType<typeof useAppwrite>['Role'],
  user: Record<string, unknown>
): Promise<Record<string, unknown> | null> {
  try {
    return await databases.getDocument({
      databaseId: APPWRITE.DATABASE_ID,
      collectionId: APPWRITE.COLLECTIONS.USER_PROFILES,
      documentId: user.$id as string
    })
  } catch {
    // Profile doesn't exist — create it (first login / first OAuth)
    try {
      return await databases.createDocument({
        databaseId: APPWRITE.DATABASE_ID,
        collectionId: APPWRITE.COLLECTIONS.USER_PROFILES,
        documentId: user.$id as string,
        data: {
          userId: user.$id as string,
          displayName: (user.name as string) || (user.email as string)?.split('@')[0] || 'User',
          subscriptionStatus: 'free'
        },
        permissions: [
          Permission.read(Role.user(user.$id as string)),
          Permission.update(Role.user(user.$id as string))
        ]
      })
    } catch (err) {
      console.error('[ensureProfile] Failed to create user profile:', err)
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
        const user = await account.get()
        // Set email verification status from Appwrite account
        authStore.setEmailVerified(
          (user as unknown as Record<string, boolean>).emailVerification ?? false
        )
        // Ensure profile exists (creates on first OAuth login)
        const profile = await ensureProfile(
          databases,
          Permission,
          Role,
          user as unknown as Record<string, unknown>
        )
        authStore.setAccountLabels((user as unknown as Record<string, string[]>).labels ?? [])
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
        authStore.setAccountLabels(['admin'])
        authStore.setEmailVerified(true)
        if (import.meta.client) {
          localStorage.setItem('vault-mock-session', JSON.stringify(user))
        }
      } else {
        const { account, databases, Permission, Role } = useAppwrite()
        await account.createEmailPasswordSession({ email, password })
        const user = await account.get()
        authStore.setEmailVerified(
          (user as unknown as Record<string, boolean>).emailVerification ?? false
        )
        authStore.setAccountLabels((user as unknown as Record<string, string[]>).labels ?? [])
        const profile = await ensureProfile(
          databases,
          Permission,
          Role,
          user as unknown as Record<string, unknown>
        )
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
        const user = await account.get()
        authStore.setEmailVerified(false) // New user, not yet verified
        authStore.setAccountLabels((user as unknown as Record<string, string[]>).labels ?? [])
        // Create user profile document
        const profile = await ensureProfile(
          databases,
          Permission,
          Role,
          user as unknown as Record<string, unknown>
        )
        authStore.setUser(mapAppwriteUser(user as unknown as Record<string, unknown>, profile))

        // Send email verification
        try {
          await account.createVerification({
            url: `${window.location.origin}/verify-email`
          })
        } catch (err) {
          console.error('[register] Failed to send verification email:', err)
        }

        toast.add({
          title: 'Check your email!',
          description: 'We sent you a verification link. Please verify your email to continue.'
        })
        await navigateTo('/register?verify=pending')
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
      await account.createVerification({
        url: `${window.location.origin}/verify-email`
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
        const providerMap: Record<string, string> = {
          github: OAuthProvider.Github,
          google: OAuthProvider.Google
        }
        // OAuth redirects the browser – this call does not return
        account.createOAuth2Session({
          provider: providerMap[provider] as string,
          success: `${window.location.origin}/vault`,
          failure: `${window.location.origin}/login`
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
