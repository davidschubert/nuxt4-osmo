<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent, AuthFormField } from '@nuxt/ui'
import { PRICING } from '~/utils/constants'

definePageMeta({
  layout: 'default'
})

const route = useRoute()
const config = useRuntimeConfig()
const toast = useToast()
const { register, loginWithOAuth, isAuthenticated, user, loading: authLoading } = useAuth()
const { isMockMode } = useSubscription()

// --- Plan Configuration ---
const planSlug = computed(() => route.params.plan as string)
const billing = computed(() => (route.query.billing as string) || 'quarterly')

interface PlanConfig {
  name: string
  description: string
  mode: 'subscription' | 'payment'
  getPriceId: (billing: string) => string
  getLabel: (billing: string) => string
  getPrice: (billing: string) => string
}

const planConfigs: Record<string, PlanConfig> = {
  subscription: {
    name: 'Member',
    description: 'Full access for one developer.',
    mode: 'subscription',
    getPriceId: b => b === 'yearly'
      ? config.public.stripeSoloYearlyPriceId as string
      : config.public.stripeSoloQuarterlyPriceId as string,
    getLabel: b => b === 'yearly'
      ? `${PRICING.SOLO.yearly.perMonth}/month, billed yearly`
      : `${PRICING.SOLO.quarterly.perMonth}/month, billed quarterly`,
    getPrice: b => b === 'yearly'
      ? PRICING.SOLO.yearly.label
      : PRICING.SOLO.quarterly.label
  },
  lifetime: {
    name: 'Lifetime',
    description: 'Pay once, use forever.',
    mode: 'payment',
    getPriceId: () => config.public.stripeLifetimePriceId as string,
    getLabel: () => 'One-time payment',
    getPrice: () => PRICING.LIFETIME.label
  },
  team: {
    name: 'Team',
    description: 'Perfect for small teams and agencies.',
    mode: 'subscription',
    getPriceId: b => b === 'yearly'
      ? config.public.stripeTeamYearlyPriceId as string
      : config.public.stripeTeamQuarterlyPriceId as string,
    getLabel: b => b === 'yearly'
      ? `${PRICING.TEAM.yearly.perMonth}/month per user, billed yearly`
      : `${PRICING.TEAM.quarterly.perMonth}/month per user, billed quarterly`,
    getPrice: b => b === 'yearly'
      ? PRICING.TEAM.yearly.label
      : PRICING.TEAM.quarterly.label
  }
}

const plan = computed(() => planConfigs[planSlug.value])
const isValidPlan = computed(() => !!plan.value)
// Non-null accessor for use inside v-if="isValidPlan" guarded template
const activePlan = computed(() => plan.value!)

useSeoMeta({
  title: computed(() => plan.value ? `${plan.value.name} - OSMO` : 'Plan - OSMO'),
  robots: 'noindex'
})

// --- Step Management ---
// If user is already logged in, skip to step 2 (payment)
const currentStep = ref(isAuthenticated.value ? 2 : 1)

watch(isAuthenticated, (loggedIn) => {
  if (loggedIn && currentStep.value === 1) {
    currentStep.value = 2
  }
})

// --- Step 1: Registration ---
const registrationFields: AuthFormField[] = [
  {
    name: 'firstName',
    type: 'text',
    label: 'First name',
    placeholder: 'Enter your first name',
    required: true
  },
  {
    name: 'lastName',
    type: 'text',
    label: 'Last name',
    placeholder: 'Enter your last name',
    required: true
  },
  {
    name: 'email',
    type: 'email',
    label: 'Email',
    placeholder: 'Enter your email',
    required: true
  },
  {
    name: 'password',
    label: 'Password',
    type: 'password',
    placeholder: 'Create a password',
    required: true
  }
]

const oauthProviders = [
  {
    label: 'GitHub',
    icon: 'i-simple-icons-github',
    onClick: () => {
      // Store selected plan in localStorage so we can resume after OAuth redirect
      if (import.meta.client) {
        localStorage.setItem('osmo-pending-plan', JSON.stringify({
          plan: planSlug.value,
          billing: billing.value
        }))
      }
      loginWithOAuth('github')
    }
  },
  {
    label: 'Google',
    icon: 'i-simple-icons-google',
    onClick: () => {
      if (import.meta.client) {
        localStorage.setItem('osmo-pending-plan', JSON.stringify({
          plan: planSlug.value,
          billing: billing.value
        }))
      }
      loginWithOAuth('google')
    }
  }
]

const registrationSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.email('Invalid email address'),
  password: z.string().min(8, 'Must be at least 8 characters')
})

type RegistrationSchema = z.output<typeof registrationSchema>

async function onRegister(payload: FormSubmitEvent<RegistrationSchema>) {
  const fullName = `${payload.data.firstName} ${payload.data.lastName}`
  await register({
    name: fullName,
    email: payload.data.email,
    password: payload.data.password
  })
  // After registration, auth state is updated and watcher will advance to step 2
}

// --- Step 2: Stripe Embedded Checkout ---
const checkoutLoading = ref(false)
const checkoutError = ref('')
const checkoutMounted = ref(false)
let checkoutInstance: { destroy: () => void } | null = null

async function mountStripeCheckout() {
  if (!user.value || !plan.value || checkoutMounted.value) return

  // Mock mode: simulate checkout locally (no Stripe redirect)
  if (isMockMode) {
    checkoutLoading.value = true
    await new Promise(resolve => setTimeout(resolve, 800))
    const authStore = useAuthStore()
    if (authStore.user) {
      authStore.setUser({
        ...authStore.user,
        subscriptionStatus: 'active',
        stripeCustomerId: 'cus_mock_123',
        stripeSubscriptionId: plan.value.mode === 'subscription' ? 'sub_mock_123' : undefined,
        subscribedAt: new Date().toISOString(),
        planType: plan.value.mode === 'payment' ? 'lifetime' : 'solo'
      })
      if (import.meta.client) {
        localStorage.setItem('vault-mock-session', JSON.stringify(authStore.user))
      }
    }
    checkoutLoading.value = false
    await navigateTo('/checkout/return?session_id=mock_session')
    return
  }

  checkoutLoading.value = true
  checkoutError.value = ''

  try {
    const { loadStripe } = await import('@stripe/stripe-js/pure')
    const stripe = await loadStripe(config.public.stripePublishableKey as string)

    if (!stripe) {
      checkoutError.value = 'Failed to load payment system. Please try again.'
      return
    }

    const fetchClientSecret = async (): Promise<string> => {
      const response = await $fetch<{ clientSecret: string }>('/api/stripe/embedded-checkout', {
        method: 'POST',
        body: {
          userId: user.value!.userId,
          userEmail: user.value!.email,
          priceId: plan.value!.getPriceId(billing.value),
          checkoutMode: plan.value!.mode
        }
      })
      return response.clientSecret
    }

    const checkout = await stripe.initEmbeddedCheckout({
      fetchClientSecret
    })

    checkout.mount('#stripe-checkout')
    checkoutInstance = checkout
    checkoutMounted.value = true
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Payment initialization failed'
    checkoutError.value = message
    toast.add({ title: 'Payment error', description: message, color: 'error' })
  } finally {
    checkoutLoading.value = false
  }
}

// Mount checkout when step 2 becomes active
watch(currentStep, async (step) => {
  if (step === 2) {
    await nextTick()
    mountStripeCheckout()
  }
})

// If already logged in, mount checkout on page load
onMounted(() => {
  if (isAuthenticated.value) {
    currentStep.value = 2
    nextTick(() => mountStripeCheckout())
  }
})

// Cleanup on unmount
onBeforeUnmount(() => {
  if (checkoutInstance) {
    checkoutInstance.destroy()
    checkoutInstance = null
  }
})

// Breadcrumb
const breadcrumbItems = computed(() => [
  { label: 'Plans', to: '/plans' },
  { label: activePlan.value.name }
])
</script>

<template>
  <div class="min-h-[calc(100vh-8rem)] px-4 py-12">
    <!-- Invalid plan -->
    <div
      v-if="!isValidPlan"
      class="flex flex-col items-center justify-center py-20 text-center"
    >
      <UIcon
        name="i-lucide-alert-circle"
        class="size-12 text-muted mb-4"
      />
      <h1 class="text-xl font-semibold mb-2">
        Plan not found
      </h1>
      <p class="text-sm text-muted mb-4">
        The plan you selected does not exist.
      </p>
      <UButton
        to="/plans"
        label="View all plans"
        variant="outline"
        color="neutral"
      />
    </div>

    <!-- Valid plan flow -->
    <div
      v-else
      class="max-w-lg mx-auto"
    >
      <!-- Breadcrumb -->
      <UBreadcrumb
        :items="breadcrumbItems"
        class="mb-6"
      />

      <!-- Plan Header -->
      <div class="text-center mb-8">
        <h1 class="text-2xl sm:text-3xl font-serif mb-2">
          {{ activePlan.name }}
        </h1>
        <p class="text-muted text-sm mb-3">
          {{ activePlan.description }}
        </p>
        <div class="flex items-center justify-center gap-2">
          <span class="text-2xl font-bold">{{ activePlan.getPrice(billing) }}</span>
        </div>
        <p class="text-xs text-muted mt-1">
          {{ activePlan.getLabel(billing) }}
        </p>
      </div>

      <!-- Step Indicator -->
      <div class="flex items-center justify-center gap-4 mb-8">
        <div class="flex items-center gap-2">
          <div
            class="size-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors"
            :class="currentStep >= 1 ? 'bg-primary text-white' : 'bg-muted text-muted'"
          >
            <UIcon
              v-if="currentStep > 1"
              name="i-lucide-check"
              class="size-4"
            />
            <span v-else>1</span>
          </div>
          <span
            class="text-sm font-medium"
            :class="currentStep >= 1 ? 'text-default' : 'text-muted'"
          >
            Account
          </span>
        </div>
        <div class="w-12 h-px bg-default" />
        <div class="flex items-center gap-2">
          <div
            class="size-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors"
            :class="currentStep >= 2 ? 'bg-primary text-white' : 'bg-muted text-muted'"
          >
            2
          </div>
          <span
            class="text-sm font-medium"
            :class="currentStep >= 2 ? 'text-default' : 'text-muted'"
          >
            Payment
          </span>
        </div>
      </div>

      <!-- Step 1: Registration -->
      <div v-if="currentStep === 1">
        <UPageCard class="w-full">
          <UAuthForm
            :schema="registrationSchema"
            :fields="registrationFields"
            :providers="oauthProviders"
            :loading="authLoading"
            title="Create your account"
            :description="`Sign up to get the ${activePlan.name} plan.`"
            icon="i-lucide-user-plus"
            :submit="{ label: 'Create account & continue' }"
            @submit="onRegister"
          >
            <template #description>
              Already have an account? <NuxtLink
                to="/login"
                class="text-primary font-medium"
              >
                Sign in
              </NuxtLink>.
            </template>
            <template #footer>
              By creating an account, you agree to our <NuxtLink
                to="#"
                class="text-primary font-medium"
              >
                Terms of Service
              </NuxtLink> and <NuxtLink
                to="#"
                class="text-primary font-medium"
              >
                Privacy Policy
              </NuxtLink>.
            </template>
          </UAuthForm>
        </UPageCard>
      </div>

      <!-- Step 2: Stripe Embedded Checkout -->
      <div v-if="currentStep === 2">
        <!-- Loading state -->
        <div
          v-if="checkoutLoading"
          class="flex flex-col items-center justify-center py-12 space-y-4"
        >
          <USkeleton class="h-10 w-full rounded-lg" />
          <USkeleton class="h-40 w-full rounded-lg" />
          <USkeleton class="h-10 w-full rounded-lg" />
          <p class="text-sm text-muted">
            Loading payment form...
          </p>
        </div>

        <!-- Error state -->
        <div
          v-if="checkoutError"
          class="text-center py-12 space-y-4"
        >
          <UIcon
            name="i-lucide-alert-triangle"
            class="size-12 text-red-500 mx-auto"
          />
          <p class="text-sm text-muted">
            {{ checkoutError }}
          </p>
          <UButton
            label="Try again"
            variant="outline"
            color="neutral"
            @click="checkoutError = ''; mountStripeCheckout()"
          />
        </div>

        <!-- Stripe Embedded Checkout container -->
        <div
          id="stripe-checkout"
          class="rounded-xl overflow-hidden"
        />
      </div>
    </div>
  </div>
</template>
