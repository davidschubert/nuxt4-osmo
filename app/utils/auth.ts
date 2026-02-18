import type { UserProfile } from '~/types'

/**
 * Typed Appwrite user object matching the Account.get() response
 */
export interface AppwriteUser {
  $id: string
  email: string
  name: string
  emailVerification: boolean
  labels: string[]
}

/**
 * Appwrite error shape (AppwriteException)
 */
export interface AppwriteError {
  code: number
  message: string
}

/**
 * Type guard for Appwrite errors
 */
export function isAppwriteError(err: unknown): err is AppwriteError {
  return typeof err === 'object' && err !== null && 'code' in err && 'message' in err
}

/**
 * Map Appwrite user + optional profile document to our UserProfile interface
 */
export function mapAppwriteUser(
  user: AppwriteUser,
  profile?: Record<string, unknown> | null
): UserProfile {
  return {
    $id: (profile?.$id as string) || user.$id,
    userId: user.$id,
    displayName: user.name || user.email?.split('@')[0] || 'User',
    email: user.email,
    avatarUrl: (profile?.avatarUrl as string) || undefined,
    subscriptionStatus: (profile?.subscriptionStatus as UserProfile['subscriptionStatus']) || 'free',
    stripeCustomerId: (profile?.stripeCustomerId as string) || undefined,
    stripeSubscriptionId: (profile?.stripeSubscriptionId as string) || undefined,
    subscribedAt: (profile?.subscribedAt as string) || undefined,
    teamId: (profile?.teamId as string) || undefined,
    planType: (profile?.planType as UserProfile['planType']) || undefined
  }
}
