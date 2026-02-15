<script setup lang="ts">
// Load categories and resources when vault layout mounts
const { loadCategories } = useCategories()
const { loadResources } = useResources()
const { isAuthenticated, emailVerified, resendVerification } = useAuth()

const showVerifyBanner = computed(() => isAuthenticated.value && !emailVerified.value)
const resendingEmail = ref(false)

async function handleResendVerification() {
  resendingEmail.value = true
  try {
    await resendVerification()
  } finally {
    resendingEmail.value = false
  }
}

onMounted(async () => {
  await Promise.all([
    loadCategories(),
    loadResources()
  ])
})

// Keyboard shortcuts
defineShortcuts({
  'g-h': {
    handler: () => navigateTo('/vault')
  },
  'g-p': {
    handler: () => navigateTo('/plans')
  },
  'g-a': {
    handler: () => navigateTo('/account')
  }
})
</script>

<template>
  <UDashboardGroup unit="px">
    <VaultSidebar />

    <AppSearch />

    <UDashboardPanel>
      <template #header>
        <UDashboardNavbar>
          <template #leading>
            <UDashboardSidebarCollapse />
          </template>

          <template #right>
            <UDashboardSearchButton />
            <UButton
              icon="i-lucide-bookmark"
              variant="ghost"
              color="neutral"
              aria-label="Bookmarks"
            />
          </template>
        </UDashboardNavbar>
      </template>

      <template #body>
        <!-- Email verification banner -->
        <div
          v-if="showVerifyBanner"
          class="flex items-center justify-between gap-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-4 py-3 mx-4 mt-4 sm:mx-6 sm:mt-6"
        >
          <div class="flex items-center gap-3 min-w-0">
            <UIcon
              name="i-lucide-mail-warning"
              class="size-5 text-yellow-500 shrink-0"
            />
            <p class="text-sm text-yellow-200 truncate">
              Please verify your email to unlock premium resources.
            </p>
          </div>
          <UButton
            label="Resend"
            size="xs"
            variant="outline"
            color="warning"
            :loading="resendingEmail"
            @click="handleResendVerification"
          />
        </div>
        <slot />
      </template>
    </UDashboardPanel>
  </UDashboardGroup>
</template>
