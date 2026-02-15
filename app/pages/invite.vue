<script setup lang="ts">
import { APPWRITE } from '~/utils/constants'

definePageMeta({
  layout: 'default'
})

useSeoMeta({
  title: 'Join Team - The Vault'
})

const route = useRoute()
const { isAuthenticated, user } = useAuth()
const toast = useToast()

const processing = ref(true)
const success = ref(false)
const errorMsg = ref('')

onMounted(async () => {
  const token = route.query.token as string
  const teamId = route.query.teamId as string

  if (!token || !teamId) {
    errorMsg.value = 'Invalid invitation link. Please ask the team owner to send a new invite.'
    processing.value = false
    return
  }

  if (!isAuthenticated.value) {
    // Redirect to register with return URL
    await navigateTo(`/register?redirect=${encodeURIComponent(`/invite?token=${token}&teamId=${teamId}`)}`)
    return
  }

  try {
    const { databases } = useAppwrite()
    // Get the team document
    const teamDoc = await databases.getDocument({
      databaseId: APPWRITE.DATABASE_ID,
      collectionId: APPWRITE.COLLECTIONS.TEAMS,
      documentId: teamId
    })

    const memberIds = (teamDoc.memberIds as string[]) || []
    if (memberIds.length >= 2) {
      errorMsg.value = 'This team is already full (2/2 members).'
      processing.value = false
      return
    }

    if (user.value && memberIds.includes(user.value.userId)) {
      errorMsg.value = 'You are already a member of this team.'
      processing.value = false
      return
    }

    // Add current user to team
    if (user.value) {
      await databases.updateDocument({
        databaseId: APPWRITE.DATABASE_ID,
        collectionId: APPWRITE.COLLECTIONS.TEAMS,
        documentId: teamId,
        data: { memberIds: [...memberIds, user.value.userId] }
      })

      // Update user profile with team reference
      await databases.updateDocument({
        databaseId: APPWRITE.DATABASE_ID,
        collectionId: APPWRITE.COLLECTIONS.USER_PROFILES,
        documentId: user.value.userId,
        data: {
          teamId,
          planType: 'team',
          subscriptionStatus: teamDoc.subscriptionStatus as string
        }
      })
    }

    success.value = true
    toast.add({
      title: 'Welcome to the team!',
      description: 'You now have full access to all team resources.'
    })
  } catch (e: unknown) {
    errorMsg.value = e instanceof Error ? e.message : 'Failed to join team. The invitation may have expired.'
  } finally {
    processing.value = false
  }
})
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] px-4 py-12">
    <UPageCard class="w-full max-w-md text-center">
      <!-- Loading -->
      <div
        v-if="processing"
        class="space-y-4"
      >
        <UIcon
          name="i-lucide-loader-2"
          class="size-12 text-primary mx-auto animate-spin"
        />
        <h2 class="text-xl font-bold">
          Joining team...
        </h2>
        <p class="text-sm text-muted">
          Please wait while we add you to the team.
        </p>
      </div>

      <!-- Success -->
      <div
        v-else-if="success"
        class="space-y-4"
      >
        <UIcon
          name="i-lucide-users"
          class="size-12 text-green-500 mx-auto"
        />
        <h2 class="text-xl font-bold">
          You're in!
        </h2>
        <p class="text-sm text-muted">
          You've successfully joined the team. You now have full access to all resources.
        </p>
        <UButton
          to="/vault"
          label="Go to Vault"
          color="primary"
          class="mt-4"
        />
      </div>

      <!-- Error -->
      <div
        v-else
        class="space-y-4"
      >
        <UIcon
          name="i-lucide-x-circle"
          class="size-12 text-red-500 mx-auto"
        />
        <h2 class="text-xl font-bold">
          Could not join team
        </h2>
        <p class="text-sm text-muted">
          {{ errorMsg }}
        </p>
        <div class="flex gap-2 justify-center mt-4">
          <UButton
            to="/vault"
            label="Go to Vault"
            variant="outline"
            color="neutral"
          />
          <UButton
            to="/login"
            label="Sign in"
            color="primary"
          />
        </div>
      </div>
    </UPageCard>
  </div>
</template>
