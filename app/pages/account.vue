<script setup lang="ts">
definePageMeta({
  layout: 'vault',
  middleware: 'auth'
})

useSeoMeta({
  title: 'Account - The Vault'
})

const { user, isSubscribed } = useAuth()
const authStore = useAuthStore()

// Active tab for account sections
const activeTab = ref('profile')

const tabs = [
  { label: 'Profile', value: 'profile', icon: 'i-lucide-user' },
  { label: 'Account', value: 'account', icon: 'i-lucide-settings' },
  { label: 'Plan', value: 'plan', icon: 'i-lucide-credit-card' },
  { label: 'Billing', value: 'billing', icon: 'i-lucide-receipt' }
]

const subscriptionLabel = computed(() => {
  switch (user.value?.subscriptionStatus) {
    case 'active':
      return 'Pro Member'
    case 'canceled':
      return 'Canceled'
    default:
      return 'Free Plan'
  }
})
</script>

<template>
  <div class="max-w-4xl mx-auto p-6 lg:p-8">
    <h1 class="text-2xl font-bold mb-6">
      Account Settings
    </h1>

    <div class="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-8">
      <!-- Sidebar Navigation -->
      <nav class="space-y-1">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          class="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors"
          :class="activeTab === tab.value
            ? 'bg-primary/10 text-primary'
            : 'text-muted hover:text-default hover:bg-muted/50'"
          @click="activeTab = tab.value"
        >
          <UIcon
            :name="tab.icon"
            class="size-4"
          />
          {{ tab.label }}
        </button>
      </nav>

      <!-- Content -->
      <div class="space-y-6">
        <!-- Profile Tab -->
        <div v-if="activeTab === 'profile'">
          <div class="space-y-6">
            <!-- Avatar -->
            <div class="flex items-center gap-4">
              <UAvatar
                size="xl"
                :text="authStore.initials"
                :src="user?.avatarUrl"
              />
              <div>
                <UButton
                  variant="outline"
                  color="neutral"
                  size="sm"
                >
                  Change photo
                </UButton>
              </div>
            </div>

            <USeparator />

            <!-- Name -->
            <div class="space-y-2">
              <label class="text-xs font-medium text-muted uppercase tracking-wider">Name</label>
              <p class="text-sm font-medium">
                {{ user?.displayName }}
              </p>
              <UButton
                variant="link"
                color="primary"
                size="xs"
              >
                Change name
              </UButton>
            </div>

            <USeparator />

            <!-- Email -->
            <div class="space-y-2">
              <label class="text-xs font-medium text-muted uppercase tracking-wider">Email</label>
              <p class="text-sm font-medium">
                {{ user?.email }}
              </p>
              <UButton
                variant="link"
                color="primary"
                size="xs"
              >
                Change email
              </UButton>
            </div>

            <USeparator />

            <!-- Password -->
            <div class="space-y-2">
              <label class="text-xs font-medium text-muted uppercase tracking-wider">Password</label>
              <p class="text-sm text-muted">
                ********
              </p>
              <UButton
                variant="link"
                color="primary"
                size="xs"
              >
                Change password
              </UButton>
            </div>
          </div>
        </div>

        <!-- Account Tab -->
        <div v-if="activeTab === 'account'">
          <div class="space-y-6">
            <div class="space-y-2">
              <label class="text-xs font-medium text-muted uppercase tracking-wider">Billing Address</label>
              <p class="text-sm text-muted">
                No billing address set
              </p>
              <UButton
                variant="link"
                color="primary"
                size="xs"
              >
                Change address
              </UButton>
            </div>

            <USeparator />

            <div class="space-y-2">
              <label class="text-xs font-medium text-muted uppercase tracking-wider">Organization</label>
              <p class="text-sm text-muted">
                No organization set
              </p>
              <UButton
                variant="link"
                color="primary"
                size="xs"
              >
                Change organization
              </UButton>
            </div>
          </div>
        </div>

        <!-- Plan Tab -->
        <div v-if="activeTab === 'plan'">
          <div class="space-y-6">
            <div class="space-y-2">
              <h3 class="text-lg font-semibold">
                {{ subscriptionLabel }}
              </h3>
              <p
                v-if="!isSubscribed"
                class="text-sm text-muted"
              >
                You are on the free plan. Upgrade to Pro to unlock all resources.
              </p>
              <p
                v-else
                class="text-sm text-muted"
              >
                You have full access to all resources.
              </p>
            </div>

            <UButton
              v-if="!isSubscribed"
              to="/pricing"
            >
              Upgrade to Pro
            </UButton>
            <div
              v-else
              class="space-y-2"
            >
              <UButton
                variant="link"
                color="primary"
                size="xs"
              >
                Change plan
              </UButton>
            </div>
          </div>
        </div>

        <!-- Billing Tab -->
        <div v-if="activeTab === 'billing'">
          <div class="space-y-6">
            <div class="space-y-2">
              <label class="text-xs font-medium text-muted uppercase tracking-wider">Payment Information</label>
              <p class="text-sm text-muted">
                No payment method on file
              </p>
              <UButton
                variant="link"
                color="primary"
                size="xs"
              >
                Add payment method
              </UButton>
            </div>

            <USeparator />

            <div class="space-y-2">
              <label class="text-xs font-medium text-muted uppercase tracking-wider">Invoices</label>
              <p class="text-sm text-muted">
                No invoices yet
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
