<script setup lang="ts">
definePageMeta({
  layout: 'default'
})

useSeoMeta({
  title: 'Verify Email - OSMO'
})

const route = useRoute()
const verifying = ref(true)
const success = ref(false)
const errorMsg = ref('')

onMounted(async () => {
  const userId = route.query.userId as string
  const secret = route.query.secret as string

  if (!userId || !secret) {
    errorMsg.value = 'Invalid verification link. Please check your email and try again.'
    verifying.value = false
    return
  }

  try {
    const { account } = useAppwrite()
    await account.updateVerification({ userId, secret })
    success.value = true
  } catch (e: unknown) {
    errorMsg.value = e instanceof Error ? e.message : 'Verification failed. The link may have expired.'
  } finally {
    verifying.value = false
  }
})
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] px-4 py-12">
    <UPageCard class="w-full max-w-md text-center">
      <!-- Loading -->
      <div
        v-if="verifying"
        class="space-y-4"
      >
        <UIcon
          name="i-lucide-loader-2"
          class="size-12 text-primary mx-auto animate-spin"
        />
        <h2 class="text-xl font-bold">
          Verifying your email...
        </h2>
        <p class="text-sm text-muted">
          Please wait while we verify your email address.
        </p>
      </div>

      <!-- Success -->
      <div
        v-else-if="success"
        class="space-y-4"
      >
        <UIcon
          name="i-lucide-check-circle"
          class="size-12 text-green-500 mx-auto"
        />
        <h2 class="text-xl font-bold">
          Email verified!
        </h2>
        <p class="text-sm text-muted">
          Your email has been successfully verified. You now have full access to OSMO.
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
          Verification failed
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
