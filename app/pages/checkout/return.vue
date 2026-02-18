<script setup lang="ts">
definePageMeta({
  layout: 'default'
})

useSeoMeta({
  title: 'Payment Complete - OSMO',
  robots: 'noindex'
})

const route = useRoute()
const { refreshStatus, isMockMode } = useSubscription()
const { isSubscribed, user } = useAuth()

const sessionId = computed(() => route.query.session_id as string)
const status = ref<'loading' | 'complete' | 'processing' | 'failed'>('loading')
const customerEmail = ref('')

// Poll for session status and subscription activation
async function checkStatus() {
  if (!sessionId.value) {
    status.value = 'failed'
    return
  }

  // Mock mode: auth store was already updated by [plan].vue — show success immediately
  if (isMockMode) {
    customerEmail.value = user.value?.email || ''
    status.value = 'complete'
    return
  }

  try {
    const session = await $fetch<{
      status: string
      paymentStatus: string
      customerEmail: string | null
    }>('/api/stripe/session-status', {
      query: { session_id: sessionId.value }
    })

    if (session.customerEmail) {
      customerEmail.value = session.customerEmail
    }

    if (session.status === 'complete' && session.paymentStatus === 'paid') {
      // Payment succeeded — refresh subscription status from Appwrite
      await refreshStatus()

      // Poll a few times if subscription isn't active yet (webhook delay)
      let retries = 0
      while (!isSubscribed.value && retries < 5) {
        await new Promise(resolve => setTimeout(resolve, 2000))
        await refreshStatus()
        retries++
      }

      status.value = isSubscribed.value ? 'complete' : 'processing'
    } else if (session.status === 'open') {
      // Session is still open — redirect back to checkout
      status.value = 'failed'
    } else {
      status.value = 'processing'
    }
  } catch {
    status.value = 'failed'
  }
}

onMounted(() => {
  checkStatus()
})
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] px-4 py-12">
    <!-- Loading -->
    <div
      v-if="status === 'loading'"
      class="text-center space-y-4"
    >
      <div class="size-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto animate-pulse">
        <UIcon
          name="i-lucide-loader-2"
          class="size-8 text-primary animate-spin"
        />
      </div>
      <h1 class="text-xl font-semibold">
        Activating your subscription...
      </h1>
      <p class="text-sm text-muted">
        Please wait while we confirm your payment.
      </p>
    </div>

    <!-- Success -->
    <UPageCard
      v-else-if="status === 'complete'"
      class="w-full max-w-md text-center"
    >
      <div class="space-y-4">
        <div class="size-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
          <UIcon
            name="i-lucide-check"
            class="size-8 text-primary"
          />
        </div>
        <h1 class="text-2xl font-bold">
          Welcome to Pro!
        </h1>
        <p class="text-sm text-muted">
          Your subscription is now active. You have full access to all resources.
        </p>
        <p
          v-if="customerEmail"
          class="text-xs text-muted"
        >
          A confirmation has been sent to {{ customerEmail }}.
        </p>
        <UButton
          to="/vault"
          label="Start exploring"
          size="lg"
          block
        />
      </div>
    </UPageCard>

    <!-- Processing (payment received but webhook hasn't fired yet) -->
    <UPageCard
      v-else-if="status === 'processing'"
      class="w-full max-w-md text-center"
    >
      <div class="space-y-4">
        <div class="size-16 rounded-full bg-yellow-500/10 flex items-center justify-center mx-auto">
          <UIcon
            name="i-lucide-clock"
            class="size-8 text-yellow-500"
          />
        </div>
        <h1 class="text-xl font-bold">
          Payment received
        </h1>
        <p class="text-sm text-muted">
          Your payment was successful. Your subscription will be activated shortly.
        </p>
        <div class="flex flex-col gap-2 pt-2">
          <UButton
            to="/vault"
            label="Go to OSMO"
            size="lg"
            block
          />
          <UButton
            label="Check again"
            variant="outline"
            color="neutral"
            block
            @click="status = 'loading'; checkStatus()"
          />
        </div>
      </div>
    </UPageCard>

    <!-- Failed -->
    <UPageCard
      v-else
      class="w-full max-w-md text-center"
    >
      <div class="space-y-4">
        <div class="size-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
          <UIcon
            name="i-lucide-x"
            class="size-8 text-red-500"
          />
        </div>
        <h1 class="text-xl font-bold">
          Something went wrong
        </h1>
        <p class="text-sm text-muted">
          We could not verify your payment. Please try again or contact support.
        </p>
        <div class="flex flex-col gap-2 pt-2">
          <UButton
            to="/plans"
            label="Back to plans"
            variant="outline"
            color="neutral"
            block
          />
          <UButton
            to="/vault"
            label="Go to OSMO"
            block
          />
        </div>
      </div>
    </UPageCard>
  </div>
</template>
