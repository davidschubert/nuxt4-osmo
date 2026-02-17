<script setup lang="ts">
definePageMeta({
  layout: 'vault',
  middleware: 'auth'
})

useSeoMeta({
  title: 'Account - The Vault'
})

const route = useRoute()
const router = useRouter()
const { user, isSubscribed, updateDisplayName, updateUserEmail, updatePassword } = useAuth()
const authStore = useAuthStore()
const { openPortal, portalLoading, mockCancelSubscription, isMockMode } = useSubscription()

// ─── Tab Navigation ─────────────────────────────

const tabItems = [
  { label: 'General', value: 'general', icon: 'i-lucide-user' },
  { label: 'Security', value: 'security', icon: 'i-lucide-shield' },
  { label: 'Plan', value: 'plan', icon: 'i-lucide-credit-card' },
  { label: 'Team', value: 'team', icon: 'i-lucide-users' },
  { label: 'Billing', value: 'billing', icon: 'i-lucide-receipt' }
]

// Sync active tab with URL query
const activeTab = computed({
  get: () => (route.query.tab as string) || 'general',
  set: (tab: string) => router.replace({ query: { tab } })
})

// ─── General Tab: Inline Editing ──────────────────

const generalForm = reactive({
  name: user.value?.displayName || '',
  email: user.value?.email || ''
})

// Track original values to detect changes
const originalName = computed(() => user.value?.displayName || '')
const originalEmail = computed(() => user.value?.email || '')
const hasGeneralChanges = computed(() =>
  generalForm.name !== originalName.value
  || generalForm.email !== originalEmail.value
)

// If email changed, we need password confirmation
const emailChanged = computed(() => generalForm.email !== originalEmail.value)
const emailPassword = ref('')

const generalSaving = ref(false)

async function saveGeneral() {
  generalSaving.value = true
  try {
    if (generalForm.name !== originalName.value) {
      await updateDisplayName(generalForm.name)
    }
    if (generalForm.email !== originalEmail.value) {
      if (!emailPassword.value) return
      await updateUserEmail(generalForm.email, emailPassword.value)
      emailPassword.value = ''
    }
  } catch {
    // Toast already shown by composable
  } finally {
    generalSaving.value = false
  }
}

// Sync form when user data updates
watch(user, (u) => {
  if (u) {
    generalForm.name = u.displayName
    generalForm.email = u.email
  }
}, { deep: true })

// ─── Security Tab: Password ───────────────────────

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const passwordError = computed(() => {
  if (passwordForm.newPassword && passwordForm.confirmPassword
    && passwordForm.newPassword !== passwordForm.confirmPassword) {
    return 'Passwords do not match'
  }
  return ''
})

const passwordValid = computed(() =>
  passwordForm.oldPassword
  && passwordForm.newPassword
  && passwordForm.confirmPassword
  && !passwordError.value
  && passwordForm.newPassword.length >= 8
)

const passwordLoading = ref(false)

async function submitPassword() {
  if (!passwordValid.value) return
  passwordLoading.value = true
  try {
    await updatePassword(passwordForm.oldPassword, passwordForm.newPassword)
    passwordForm.oldPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
  } catch {
    // Toast already shown by composable
  } finally {
    passwordLoading.value = false
  }
}

// ─── Plan Tab ─────────────────────────────────────

const subscriptionLabel = computed(() => {
  if (user.value?.planType === 'lifetime') return 'Lifetime Member'
  if (user.value?.planType === 'team') return 'Team Plan'
  switch (user.value?.subscriptionStatus) {
    case 'active':
      return 'Solo Plan'
    case 'canceled':
      return 'Canceled'
    default:
      return 'Free Plan'
  }
})
</script>

<template>
  <div>
    <!-- Header + Tabs (full-width with bottom border) -->
    <div class="border-b border-default">
      <div class="max-w-3xl mx-auto px-6 lg:px-8">
        <h1 class="text-2xl font-bold pt-6 pb-4">
          Account
        </h1>
        <UTabs
          v-model="activeTab"
          :items="tabItems"
          variant="link"
          :content="false"
        />
      </div>
    </div>

    <!-- Tab Content (centered) -->
    <div class="max-w-3xl mx-auto px-6 lg:px-8 py-6">
      <!-- General Tab -->
      <div v-if="activeTab === 'general'">
        <div class="space-y-8">
          <!-- Avatar Section -->
          <div class="flex items-center gap-4">
            <UAvatar
              size="xl"
              :text="authStore.initials"
              :src="user?.avatarUrl"
            />
            <div class="space-y-1">
              <p class="text-sm font-medium">
                Profile Photo
              </p>
              <UButton
                variant="outline"
                color="neutral"
                size="xs"
              >
                Change photo
              </UButton>
            </div>
          </div>

          <USeparator />

          <!-- Inline Form -->
          <div class="space-y-6">
            <div class="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-2 sm:gap-4 items-start">
              <label class="text-sm font-medium text-muted sm:pt-2">Display Name</label>
              <UInput
                v-model="generalForm.name"
                placeholder="Your name"
              />
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-2 sm:gap-4 items-start">
              <label class="text-sm font-medium text-muted sm:pt-2">Email</label>
              <div class="space-y-2">
                <UInput
                  v-model="generalForm.email"
                  type="email"
                  placeholder="your@email.com"
                />
                <!-- Password confirmation for email change -->
                <div
                  v-if="emailChanged"
                  class="space-y-1"
                >
                  <p class="text-xs text-muted">
                    Enter your current password to confirm email change
                  </p>
                  <UInput
                    v-model="emailPassword"
                    type="password"
                    placeholder="Current password"
                    size="sm"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Save Button -->
          <div class="flex justify-end">
            <UButton
              :loading="generalSaving"
              :disabled="!hasGeneralChanges || (emailChanged && !emailPassword)"
              @click="saveGeneral"
            >
              Save changes
            </UButton>
          </div>
        </div>
      </div>

      <!-- Security Tab -->
      <div v-if="activeTab === 'security'">
        <div class="space-y-6">
          <!-- Password Card -->
          <UCard>
            <template #header>
              <h3 class="font-semibold">
                Change Password
              </h3>
            </template>

            <div class="space-y-4">
              <div class="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-2 sm:gap-4 items-start">
                <label class="text-sm font-medium text-muted sm:pt-2">Current Password</label>
                <UInput
                  v-model="passwordForm.oldPassword"
                  type="password"
                  placeholder="Enter current password"
                />
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-2 sm:gap-4 items-start">
                <label class="text-sm font-medium text-muted sm:pt-2">New Password</label>
                <UInput
                  v-model="passwordForm.newPassword"
                  type="password"
                  placeholder="Min. 8 characters"
                />
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-2 sm:gap-4 items-start">
                <label class="text-sm font-medium text-muted sm:pt-2">Confirm Password</label>
                <UInput
                  v-model="passwordForm.confirmPassword"
                  type="password"
                  placeholder="Confirm new password"
                  :color="passwordError ? 'error' : undefined"
                  @keydown.enter="submitPassword"
                />
              </div>

              <p
                v-if="passwordError"
                class="text-xs text-error"
              >
                {{ passwordError }}
              </p>

              <div class="flex justify-end">
                <UButton
                  :loading="passwordLoading"
                  :disabled="!passwordValid"
                  @click="submitPassword"
                >
                  Update password
                </UButton>
              </div>
            </div>
          </UCard>

          <!-- Danger Zone -->
          <UCard class="border-error/20">
            <template #header>
              <h3 class="font-semibold text-error">
                Danger Zone
              </h3>
            </template>

            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p class="text-sm font-medium">
                  Delete Account
                </p>
                <p class="text-xs text-muted">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
              </div>
              <UButton
                variant="outline"
                color="error"
                class="shrink-0"
                disabled
              >
                Delete Account
              </UButton>
            </div>
          </UCard>
        </div>
      </div>

      <!-- Plan Tab -->
      <div v-if="activeTab === 'plan'">
        <div class="space-y-6">
          <UCard>
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-lg font-semibold">
                    {{ subscriptionLabel }}
                  </h3>
                  <p
                    v-if="!isSubscribed"
                    class="text-sm text-muted"
                  >
                    You are on the free plan. Upgrade to unlock all resources.
                  </p>
                  <p
                    v-else
                    class="text-sm text-muted"
                  >
                    You have full access to all resources.
                  </p>
                </div>
                <UBadge
                  v-if="user?.planType === 'lifetime'"
                  color="warning"
                  variant="subtle"
                >
                  Lifetime
                </UBadge>
              </div>

              <p
                v-if="user?.subscribedAt"
                class="text-xs text-muted"
              >
                Subscribed since {{ new Date(user.subscribedAt).toLocaleDateString() }}
              </p>

              <div class="flex items-center gap-3">
                <UButton
                  v-if="!isSubscribed"
                  to="/plans"
                >
                  View Plans
                </UButton>
                <UButton
                  v-if="isSubscribed && user?.planType !== 'lifetime'"
                  :loading="portalLoading"
                  @click="openPortal()"
                >
                  Manage Subscription
                </UButton>
                <UButton
                  v-if="isMockMode && isSubscribed"
                  variant="outline"
                  color="neutral"
                  @click="mockCancelSubscription()"
                >
                  Cancel (Mock)
                </UButton>
              </div>
            </div>
          </UCard>
        </div>
      </div>

      <!-- Team Tab -->
      <div v-if="activeTab === 'team'">
        <AccountTeam />
      </div>

      <!-- Billing Tab -->
      <div v-if="activeTab === 'billing'">
        <div class="space-y-6">
          <UCard>
            <template #header>
              <h3 class="font-semibold">
                Payment Information
              </h3>
            </template>

            <div v-if="!isSubscribed">
              <p class="text-sm text-muted">
                No payment method on file. Subscribe to add a payment method.
              </p>
            </div>
            <div
              v-else
              class="space-y-4"
            >
              <p class="text-sm text-muted">
                Payment methods and invoices are managed through the Stripe Customer Portal.
              </p>
              <UButton
                :loading="portalLoading"
                @click="openPortal()"
              >
                Manage Billing
              </UButton>
            </div>
          </UCard>

          <UCard>
            <template #header>
              <h3 class="font-semibold">
                Invoices
              </h3>
            </template>

            <p
              v-if="!isSubscribed"
              class="text-sm text-muted"
            >
              No invoices yet
            </p>
            <p
              v-else
              class="text-sm text-muted"
            >
              View and download invoices in the Stripe Customer Portal.
            </p>
          </UCard>
        </div>
      </div>
    </div>
  </div>
</template>
