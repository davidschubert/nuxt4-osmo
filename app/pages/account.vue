<script setup lang="ts">
definePageMeta({
  layout: 'vault',
  middleware: 'auth'
})

useSeoMeta({
  title: 'Account - The Vault'
})

const { user, isSubscribed, updateDisplayName, updateUserEmail, updatePassword } = useAuth()
const authStore = useAuthStore()
const { openPortal, portalLoading, mockCancelSubscription, isMockMode } = useSubscription()

// Active tab for account sections
const activeTab = ref('profile')

const tabs = [
  { label: 'Profile', value: 'profile', icon: 'i-lucide-user' },
  { label: 'Account', value: 'account', icon: 'i-lucide-settings' },
  { label: 'Plan', value: 'plan', icon: 'i-lucide-credit-card' },
  { label: 'Team', value: 'team', icon: 'i-lucide-users' },
  { label: 'Billing', value: 'billing', icon: 'i-lucide-receipt' }
]

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

// --- Modal state ---
const showNameModal = ref(false)
const showEmailModal = ref(false)
const showPasswordModal = ref(false)

// --- Form data ---
const nameForm = ref('')
const emailForm = reactive({ email: '', password: '' })
const passwordForm = reactive({ oldPassword: '', newPassword: '', confirmPassword: '' })

// --- Loading state ---
const nameLoading = ref(false)
const emailLoading = ref(false)
const passwordLoading = ref(false)

// --- Handlers ---
function openNameModal() {
  nameForm.value = user.value?.displayName || ''
  showNameModal.value = true
}

function openEmailModal() {
  emailForm.email = ''
  emailForm.password = ''
  showEmailModal.value = true
}

function openPasswordModal() {
  passwordForm.oldPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
  showPasswordModal.value = true
}

async function submitName() {
  nameLoading.value = true
  try {
    await updateDisplayName(nameForm.value)
    showNameModal.value = false
  } catch {
    // Toast already shown by composable
  } finally {
    nameLoading.value = false
  }
}

async function submitEmail() {
  emailLoading.value = true
  try {
    await updateUserEmail(emailForm.email, emailForm.password)
    showEmailModal.value = false
  } catch {
    // Toast already shown by composable
  } finally {
    emailLoading.value = false
  }
}

const passwordError = computed(() => {
  if (passwordForm.newPassword && passwordForm.confirmPassword
    && passwordForm.newPassword !== passwordForm.confirmPassword) {
    return 'Passwords do not match'
  }
  return ''
})

async function submitPassword() {
  if (passwordForm.newPassword !== passwordForm.confirmPassword) return
  passwordLoading.value = true
  try {
    await updatePassword(passwordForm.oldPassword, passwordForm.newPassword)
    showPasswordModal.value = false
  } catch {
    // Toast already shown by composable
  } finally {
    passwordLoading.value = false
  }
}
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
                @click="openNameModal"
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
                @click="openEmailModal"
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
                @click="openPasswordModal"
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
                color="neutral"
                size="xs"
                disabled
                class="opacity-50"
              >
                Change address (Coming soon)
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
                color="neutral"
                size="xs"
                disabled
                class="opacity-50"
              >
                Change organization (Coming soon)
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
                You are on the free plan. Upgrade to unlock all resources.
              </p>
              <template v-else>
                <p class="text-sm text-muted">
                  You have full access to all resources.
                </p>
                <p
                  v-if="user?.subscribedAt"
                  class="text-xs text-muted"
                >
                  Subscribed since {{ new Date(user.subscribedAt).toLocaleDateString() }}
                </p>
                <UBadge
                  v-if="user?.planType === 'lifetime'"
                  color="warning"
                  variant="subtle"
                  size="sm"
                >
                  Lifetime — no recurring payments
                </UBadge>
              </template>
            </div>

            <UButton
              v-if="!isSubscribed"
              to="/plans"
            >
              View Plans
            </UButton>
            <div
              v-else
              class="flex items-center gap-3"
            >
              <UButton
                v-if="user?.planType !== 'lifetime'"
                :loading="portalLoading"
                @click="openPortal()"
              >
                Manage Subscription
              </UButton>
              <UButton
                v-if="isMockMode"
                variant="outline"
                color="neutral"
                @click="mockCancelSubscription()"
              >
                Cancel (Mock)
              </UButton>
            </div>
          </div>
        </div>

        <!-- Team Tab -->
        <div v-if="activeTab === 'team'">
          <AccountTeam />
        </div>

        <!-- Billing Tab -->
        <div v-if="activeTab === 'billing'">
          <div class="space-y-6">
            <div class="space-y-2">
              <label class="text-xs font-medium text-muted uppercase tracking-wider">Payment Information</label>
              <p
                v-if="!isSubscribed"
                class="text-sm text-muted"
              >
                No payment method on file. Subscribe to add a payment method.
              </p>
              <template v-else>
                <p class="text-sm text-muted">
                  Payment methods and invoices are managed through the Stripe Customer Portal.
                </p>
                <UButton
                  :loading="portalLoading"
                  @click="openPortal()"
                >
                  Manage Billing
                </UButton>
              </template>
            </div>

            <USeparator />

            <div class="space-y-2">
              <label class="text-xs font-medium text-muted uppercase tracking-wider">Invoices</label>
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
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Change Name Modal -->
    <UModal v-model:open="showNameModal">
      <template #content>
        <div class="p-6 space-y-4">
          <h3 class="text-lg font-semibold">
            Change Name
          </h3>
          <UFormField label="Display Name">
            <UInput
              v-model="nameForm"
              placeholder="Your name"
              autofocus
              @keydown.enter="submitName"
            />
          </UFormField>
          <div class="flex justify-end gap-3">
            <UButton
              variant="outline"
              color="neutral"
              @click="showNameModal = false"
            >
              Cancel
            </UButton>
            <UButton
              :loading="nameLoading"
              :disabled="!nameForm.trim()"
              @click="submitName"
            >
              Save
            </UButton>
          </div>
        </div>
      </template>
    </UModal>

    <!-- Change Email Modal -->
    <UModal v-model:open="showEmailModal">
      <template #content>
        <div class="p-6 space-y-4">
          <h3 class="text-lg font-semibold">
            Change Email
          </h3>
          <UFormField label="New Email">
            <UInput
              v-model="emailForm.email"
              type="email"
              placeholder="new@example.com"
              autofocus
            />
          </UFormField>
          <UFormField label="Current Password">
            <UInput
              v-model="emailForm.password"
              type="password"
              placeholder="Enter your current password"
              @keydown.enter="submitEmail"
            />
          </UFormField>
          <div class="flex justify-end gap-3">
            <UButton
              variant="outline"
              color="neutral"
              @click="showEmailModal = false"
            >
              Cancel
            </UButton>
            <UButton
              :loading="emailLoading"
              :disabled="!emailForm.email.trim() || !emailForm.password"
              @click="submitEmail"
            >
              Save
            </UButton>
          </div>
        </div>
      </template>
    </UModal>

    <!-- Change Password Modal -->
    <UModal v-model:open="showPasswordModal">
      <template #content>
        <div class="p-6 space-y-4">
          <h3 class="text-lg font-semibold">
            Change Password
          </h3>
          <UFormField label="Current Password">
            <UInput
              v-model="passwordForm.oldPassword"
              type="password"
              placeholder="Current password"
              autofocus
            />
          </UFormField>
          <UFormField
            label="New Password"
            :error="passwordError"
          >
            <UInput
              v-model="passwordForm.newPassword"
              type="password"
              placeholder="New password (min. 8 characters)"
            />
          </UFormField>
          <UFormField
            label="Confirm New Password"
            :error="passwordError"
          >
            <UInput
              v-model="passwordForm.confirmPassword"
              type="password"
              placeholder="Confirm new password"
              @keydown.enter="submitPassword"
            />
          </UFormField>
          <div class="flex justify-end gap-3">
            <UButton
              variant="outline"
              color="neutral"
              @click="showPasswordModal = false"
            >
              Cancel
            </UButton>
            <UButton
              :loading="passwordLoading"
              :disabled="!passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.confirmPassword || !!passwordError"
              @click="submitPassword"
            >
              Save
            </UButton>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>
