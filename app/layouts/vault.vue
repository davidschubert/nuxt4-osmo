<script setup lang="ts">
// Load categories and resources when vault layout mounts
const { loadCategories } = useCategories()
const { loadResources } = useResources()
const { isAuthenticated, emailVerified, resendVerification } = useAuth()

// Email verification banner (dismissable per session)
const bannerDismissed = ref(false)
const showVerifyBanner = computed(() =>
  isAuthenticated.value && !emailVerified.value && !bannerDismissed.value
)
const resendingEmail = ref(false)

async function handleResendVerification() {
  resendingEmail.value = true
  try {
    await resendVerification()
  } finally {
    resendingEmail.value = false
  }
}

function dismissBanner() {
  bannerDismissed.value = true
}

onMounted(async () => {
  await Promise.all([
    loadCategories(),
    loadResources()
  ])
})

// Keyboard shortcuts help modal
const showShortcutsHelp = ref(false)

const shortcuts = [
  { keys: 'g h', description: 'Go to Home (Vault)' },
  { keys: 'g p', description: 'Go to Plans' },
  { keys: 'g a', description: 'Go to Account' },
  { keys: '\u2318 K', description: 'Open Search' },
  { keys: '?', description: 'Show this help' }
]

defineShortcuts({
  'g-h': {
    handler: () => navigateTo('/vault')
  },
  'g-p': {
    handler: () => navigateTo('/plans')
  },
  'g-a': {
    handler: () => navigateTo('/account')
  },
  '?': {
    handler: () => { showShortcutsHelp.value = true }
  }
})

// Notifications
const notif = useNotifications()
onMounted(() => notif.loadNotifications())
</script>

<template>
  <div>
    <a
      href="#main-content"
      class="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-lg focus:outline-none"
    >
      Skip to content
    </a>
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
              <div class="relative">
                <UButton
                  icon="i-lucide-bell"
                  variant="ghost"
                  color="neutral"
                  aria-label="Notifications"
                  @click="notif.open()"
                />
                <span
                  v-if="notif.unreadCount.value > 0"
                  class="absolute -top-1 -right-1 size-4 rounded-full bg-primary text-[10px] font-bold text-white flex items-center justify-center pointer-events-none"
                >
                  {{ notif.unreadCount.value > 9 ? '9+' : notif.unreadCount.value }}
                </span>
              </div>
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
          <!-- Email verification banner (dismissable) -->
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
            <div class="flex items-center gap-2 shrink-0">
              <UButton
                label="Resend"
                size="xs"
                variant="outline"
                color="warning"
                :loading="resendingEmail"
                @click="handleResendVerification"
              />
              <UButton
                icon="i-lucide-x"
                size="xs"
                variant="ghost"
                color="neutral"
                aria-label="Dismiss"
                @click="dismissBanner"
              />
            </div>
          </div>
          <main id="main-content">
            <slot />
          </main>
        </template>
      </UDashboardPanel>
    </UDashboardGroup>

    <AppNotifications />

    <!-- Keyboard Shortcuts Help Modal -->
    <UModal v-model:open="showShortcutsHelp">
      <template #content>
        <div class="p-6 space-y-4">
          <h3 class="text-lg font-semibold">
            Keyboard Shortcuts
          </h3>
          <div class="space-y-3">
            <div
              v-for="shortcut in shortcuts"
              :key="shortcut.keys"
              class="flex items-center justify-between"
            >
              <span class="text-sm text-muted">{{ shortcut.description }}</span>
              <div class="flex gap-1">
                <kbd
                  v-for="key in shortcut.keys.split(' ')"
                  :key="key"
                  class="inline-flex items-center justify-center min-w-[24px] px-1.5 py-0.5 text-xs font-mono font-medium rounded border border-default bg-muted"
                >
                  {{ key }}
                </kbd>
              </div>
            </div>
          </div>
          <div class="flex justify-end">
            <UButton
              variant="outline"
              color="neutral"
              @click="showShortcutsHelp = false"
            >
              Close
            </UButton>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>
