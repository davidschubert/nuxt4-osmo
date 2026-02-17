<script setup lang="ts">
definePageMeta({
  layout: 'default'
})

useSeoMeta({
  title: 'Checkout Successful - OSMO',
  description: 'Your subscription has been activated. Welcome to Pro!'
})

const { refreshStatus } = useSubscription()
const { isSubscribed, isAuthenticated } = useAuth()

const statusChecked = ref(false)
const maxRetries = 5
let retryCount = 0

// Poll for subscription status (webhook may arrive after redirect)
async function pollStatus() {
  while (retryCount < maxRetries && !isSubscribed.value) {
    await refreshStatus()
    if (isSubscribed.value) break
    retryCount++
    await new Promise(resolve => setTimeout(resolve, 2000))
  }
  statusChecked.value = true
}

onMounted(() => {
  if (isAuthenticated.value) {
    pollStatus()
  } else {
    statusChecked.value = true
  }
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center px-4">
    <div class="max-w-md w-full text-center space-y-6">
      <!-- Loading state -->
      <template v-if="!statusChecked">
        <div class="size-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
          <UIcon
            name="i-lucide-loader-2"
            class="size-8 text-primary animate-spin"
          />
        </div>
        <h1 class="text-2xl font-bold">
          Activating your subscription...
        </h1>
        <p class="text-muted">
          Please wait while we confirm your payment.
        </p>
      </template>

      <!-- Success state -->
      <template v-else-if="isSubscribed">
        <div class="size-16 mx-auto rounded-full bg-green-500/10 flex items-center justify-center">
          <UIcon
            name="i-lucide-check"
            class="size-8 text-green-500"
          />
        </div>
        <h1 class="text-2xl font-bold">
          Welcome to Pro!
        </h1>
        <p class="text-muted">
          Your subscription is active. You now have full access to all premium resources in OSMO.
        </p>
        <UButton
          to="/vault"
          size="lg"
          trailing-icon="i-lucide-arrow-right"
        >
          Go to OSMO
        </UButton>
      </template>

      <!-- Processing state (webhook not yet received) -->
      <template v-else>
        <div class="size-16 mx-auto rounded-full bg-yellow-500/10 flex items-center justify-center">
          <UIcon
            name="i-lucide-clock"
            class="size-8 text-yellow-500"
          />
        </div>
        <h1 class="text-2xl font-bold">
          Payment received
        </h1>
        <p class="text-muted">
          Your payment was successful. Your subscription is being processed and should be active within a few moments.
        </p>
        <div class="flex flex-col sm:flex-row items-center justify-center gap-3">
          <UButton
            to="/vault"
            size="lg"
            trailing-icon="i-lucide-arrow-right"
          >
            Go to OSMO
          </UButton>
          <UButton
            variant="outline"
            color="neutral"
            size="lg"
            @click="() => { statusChecked = false; retryCount = 0; pollStatus() }"
          >
            Check again
          </UButton>
        </div>
      </template>
    </div>
  </div>
</template>
