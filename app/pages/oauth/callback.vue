<script setup lang="ts">
/**
 * OAuth callback page.
 *
 * After the user authenticates with an OAuth provider (Google, GitHub),
 * Appwrite redirects back here with `userId` and `secret` query params.
 * We use these to create a session via the SDK, which correctly sets
 * the cookie-fallback in localStorage (avoiding third-party cookie issues).
 */
definePageMeta({
  layout: 'default'
})

const route = useRoute()
const toast = useToast()

const error = ref<string | null>(null)

onMounted(async () => {
  const userId = route.query.userId as string
  const secret = route.query.secret as string

  if (!userId || !secret) {
    error.value = 'Missing OAuth credentials. Please try logging in again.'
    return
  }

  try {
    const { account, databases, Permission, Role } = useAppwrite()

    // Create the session using the token from the OAuth flow
    await account.createSession({ userId, secret })

    // Fetch user data and ensure profile exists
    const rawUser = await account.get() as unknown as {
      $id: string
      email: string
      name: string
      emailVerification: boolean
      labels: string[]
    }

    const authStore = useAuthStore()
    authStore.setEmailVerified(rawUser.emailVerification ?? false)
    authStore.setAccountLabels(rawUser.labels ?? [])

    // Ensure user profile document exists (creates on first OAuth login)
    let profile: Record<string, unknown> | null = null
    try {
      profile = await databases.getDocument({
        databaseId: APPWRITE.DATABASE_ID,
        collectionId: APPWRITE.COLLECTIONS.USER_PROFILES,
        documentId: rawUser.$id
      })
    } catch {
      // Profile doesn't exist — create it
      try {
        profile = await databases.createDocument({
          databaseId: APPWRITE.DATABASE_ID,
          collectionId: APPWRITE.COLLECTIONS.USER_PROFILES,
          documentId: rawUser.$id,
          data: {
            userId: rawUser.$id,
            displayName: rawUser.name || rawUser.email?.split('@')[0] || 'User',
            subscriptionStatus: 'free'
          },
          permissions: [
            Permission.read(Role.user(rawUser.$id)),
            Permission.update(Role.user(rawUser.$id))
          ]
        })
      } catch (createErr: unknown) {
        // 409 = concurrent creation (race condition)
        if (typeof createErr === 'object' && createErr !== null && 'code' in createErr && (createErr as { code: number }).code === 409) {
          try {
            profile = await databases.getDocument({
              databaseId: APPWRITE.DATABASE_ID,
              collectionId: APPWRITE.COLLECTIONS.USER_PROFILES,
              documentId: rawUser.$id
            })
          } catch {
            // Fall through
          }
        }
      }
    }

    // Build user profile object
    authStore.setUser({
      $id: (profile?.$id as string) || rawUser.$id,
      userId: rawUser.$id,
      displayName: rawUser.name || rawUser.email?.split('@')[0] || 'User',
      email: rawUser.email,
      avatarUrl: (profile?.avatarUrl as string) || undefined,
      subscriptionStatus: (profile?.subscriptionStatus as 'free' | 'active' | 'canceled' | 'past_due') || 'free',
      stripeCustomerId: (profile?.stripeCustomerId as string) || undefined,
      stripeSubscriptionId: (profile?.stripeSubscriptionId as string) || undefined,
      subscribedAt: (profile?.subscribedAt as string) || undefined,
      teamId: (profile?.teamId as string) || undefined,
      planType: (profile?.planType as 'solo' | 'team' | 'lifetime') || undefined
    })
    authStore.setInitialized()

    toast.add({ title: 'Welcome!', description: 'You have been logged in successfully.' })
    await navigateTo('/vault', { replace: true })
  } catch (err: unknown) {
    console.error('[OAuth callback] Failed to create session:', err)
    error.value = 'Authentication failed. Please try again.'
  }
})
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] px-4 py-12">
    <div
      v-if="error"
      class="text-center space-y-4"
    >
      <UIcon
        name="i-lucide-alert-circle"
        class="size-12 text-red-500 mx-auto"
      />
      <p class="text-lg font-medium">
        {{ error }}
      </p>
      <UButton
        to="/login"
        label="Back to Login"
        variant="outline"
        color="neutral"
      />
    </div>
    <div
      v-else
      class="text-center space-y-4"
    >
      <div class="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
      <p class="text-sm text-muted">
        Completing login...
      </p>
    </div>
  </div>
</template>
