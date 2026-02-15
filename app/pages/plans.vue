<script setup lang="ts">
import type { TabsItem } from '@nuxt/ui'
import { PRICING } from '~/utils/constants'

definePageMeta({
  layout: 'default'
})

useSeoMeta({
  title: 'Plans - The Vault',
  description: 'Choose the plan that fits your workflow. Member, Lifetime, or Team — all in EUR.',
  ogTitle: 'Plans - The Vault',
  ogDescription: 'Choose the plan that fits your workflow. Member, Lifetime, or Team.'
})

const { isAuthenticated, isSubscribed } = useAuth()
const { startCheckout, openPortal, checkoutLoading } = useSubscription()
const config = useRuntimeConfig()

// Tab state: 'individuals' or 'teams'
const activeTab = ref('individuals')

const tabItems: TabsItem[] = [
  { label: 'For Individuals', value: 'individuals' },
  { label: 'For Teams', value: 'teams' }
]

// Billing toggle: quarterly vs yearly
const isYearly = ref(false)

// --- CTA Handlers ---
function handleMemberClick() {
  if (!isAuthenticated.value) {
    navigateTo('/register')
  } else if (isSubscribed.value) {
    openPortal()
  } else {
    const priceId = isYearly.value
      ? config.public.stripeSoloYearlyPriceId as string
      : config.public.stripeSoloQuarterlyPriceId as string
    startCheckout(priceId, 'subscription')
  }
}

function handleLifetimeClick() {
  if (!isAuthenticated.value) {
    navigateTo('/register')
  } else if (isSubscribed.value) {
    openPortal()
  } else {
    startCheckout(config.public.stripeLifetimePriceId as string, 'payment')
  }
}

function handleTeamClick() {
  if (!isAuthenticated.value) {
    navigateTo('/register')
  } else if (isSubscribed.value) {
    openPortal()
  } else {
    const priceId = isYearly.value
      ? config.public.stripeTeamYearlyPriceId as string
      : config.public.stripeTeamQuarterlyPriceId as string
    startCheckout(priceId, 'subscription')
  }
}

// --- Computed Prices ---
const soloBilling = computed(() => isYearly.value ? PRICING.SOLO.yearly : PRICING.SOLO.quarterly)
const teamBilling = computed(() => isYearly.value ? PRICING.TEAM.yearly : PRICING.TEAM.quarterly)

// CTA button labels
const memberCtaLabel = computed(() => {
  if (!isAuthenticated.value) return 'Become a member'
  if (isSubscribed.value) return 'Manage Subscription'
  return 'Become a member'
})

const lifetimeCtaLabel = computed(() => {
  if (!isAuthenticated.value) return 'Become a Lifetime member'
  if (isSubscribed.value) return 'Manage Subscription'
  return 'Become a Lifetime member'
})

const teamCtaLabel = computed(() => {
  if (!isAuthenticated.value) return 'Sign up your team'
  if (isSubscribed.value) return 'Manage Subscription'
  return 'Sign up your team'
})

// --- Benefits ---
const memberBenefits = [
  { icon: 'i-lucide-layers', label: '153+ Resources' },
  { icon: 'i-lucide-book-open', label: 'Full Course included' },
  { icon: 'i-lucide-shapes', label: 'Icon library' },
  { icon: 'i-lucide-eye', label: 'Live previews' },
  { icon: 'i-lucide-copy', label: 'Copy-paste code' },
  { icon: 'i-lucide-figma', label: 'Figma source files' },
  { icon: 'i-lucide-file-text', label: 'Implementation docs' },
  { icon: 'i-lucide-shield-check', label: 'Commercial license' }
]

const lifetimeBenefits = [
  { icon: 'i-lucide-infinity', label: 'Lifetime access' },
  { icon: 'i-lucide-layers', label: 'All current + future resources' },
  { icon: 'i-lucide-book-open', label: 'Full Course included' },
  { icon: 'i-lucide-shapes', label: 'Icon library' },
  { icon: 'i-lucide-zap', label: 'Priority support forever' },
  { icon: 'i-lucide-award', label: 'Exclusive Lifetime badge' },
  { icon: 'i-lucide-shield-check', label: 'Commercial license' },
  { icon: 'i-lucide-ban', label: 'No recurring payments' }
]

const teamBenefits = [
  { icon: 'i-lucide-layers', label: '153+ Resources' },
  { icon: 'i-lucide-users', label: '2 seats included' },
  { icon: 'i-lucide-user-plus', label: 'Unlimited members' },
  { icon: 'i-lucide-book-open', label: 'Full Course included' },
  { icon: 'i-lucide-shapes', label: 'Icon library' },
  { icon: 'i-lucide-building', label: 'Team management dashboard' },
  { icon: 'i-lucide-headphones', label: 'Priority support' },
  { icon: 'i-lucide-shield-check', label: 'Commercial license' }
]

// --- FAQ ---
const faqItems = [
  {
    label: 'What is the difference between Member and Team?',
    content: 'Member gives full access to one developer. Team includes 2 seats so you can invite colleagues to share access, with the ability to add unlimited members.'
  },
  {
    label: 'Can I switch between quarterly and yearly billing?',
    content: 'Yes! You can switch plans at any time from your account settings. The remaining balance will be prorated.'
  },
  {
    label: 'What does Lifetime include?',
    content: 'Lifetime gives you permanent access to all current and future resources with a single payment. No recurring fees ever.'
  },
  {
    label: 'Can I add more team members?',
    content: 'The Team plan starts with 2 seats. You can add unlimited members at the same per-user rate.'
  },
  {
    label: 'What payment methods do you accept?',
    content: 'We accept all major credit cards through Stripe. All prices are in EUR.'
  }
]
</script>

<template>
  <div>
    <!-- Hero -->
    <UPageHero
      headline="Plans"
      title="Choose the plan that fits your workflow"
      description="All plans include full access to every resource, live previews, and copy-paste code."
      :ui="{
        root: 'py-16 sm:py-24'
      }"
    />

    <!-- Tabs: For Individuals / For Teams -->
    <UPageSection
      :ui="{
        root: 'pt-0 pb-8'
      }"
    >
      <UTabs
        v-model="activeTab"
        :items="tabItems"
        variant="pill"
        color="neutral"
        size="lg"
        :content="false"
        :ui="{
          list: 'justify-center'
        }"
      />
    </UPageSection>

    <!-- ====== FOR INDIVIDUALS ====== -->
    <UPageSection
      v-if="activeTab === 'individuals'"
      :ui="{ root: 'pt-0' }"
    >
      <!-- Billing Toggle -->
      <div class="flex items-center justify-center gap-3 mb-10">
        <span
          class="text-sm font-medium transition-colors"
          :class="!isYearly ? 'text-default' : 'text-muted'"
        >
          Quarterly
        </span>
        <USwitch
          v-model="isYearly"
          size="lg"
        />
        <span
          class="text-sm font-medium transition-colors"
          :class="isYearly ? 'text-default' : 'text-muted'"
        >
          Yearly
        </span>
        <UBadge
          v-if="isYearly"
          color="primary"
          variant="subtle"
          size="sm"
        >
          Save ~20%
        </UBadge>
      </div>

      <!-- Cards Grid: Member + Lifetime -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <!-- Member Card -->
        <div class="relative rounded-2xl border border-default bg-elevated p-8 flex flex-col">
          <div class="mb-6">
            <h3 class="text-xl font-bold mb-1">
              Member
            </h3>
            <p class="text-sm text-muted">
              Full access for one developer.
            </p>
          </div>

          <div class="mb-6">
            <div class="flex items-baseline gap-1">
              <span class="text-4xl font-bold">{{ soloBilling.perMonth }}</span>
              <span class="text-muted text-sm">/month</span>
            </div>
            <p class="text-xs text-muted mt-1">
              {{ soloBilling.label }} billed {{ isYearly ? 'yearly' : 'quarterly' }}
            </p>
          </div>

          <ul class="space-y-3 mb-8 flex-1">
            <li
              v-for="benefit in memberBenefits"
              :key="benefit.label"
              class="flex items-center gap-3 text-sm"
            >
              <UIcon
                :name="benefit.icon"
                class="size-4 text-primary shrink-0"
              />
              {{ benefit.label }}
            </li>
          </ul>

          <UButton
            block
            size="lg"
            color="neutral"
            variant="outline"
            :label="memberCtaLabel"
            :loading="checkoutLoading"
            @click="handleMemberClick"
          />
        </div>

        <!-- Lifetime Card (Highlighted) -->
        <div class="relative rounded-2xl border-2 border-primary bg-primary/5 p-8 flex flex-col ring-1 ring-primary/20">
          <!-- Popular Badge -->
          <div class="absolute -top-3 left-1/2 -translate-x-1/2">
            <UBadge
              color="primary"
              variant="solid"
              size="sm"
            >
              Most popular
            </UBadge>
          </div>

          <div class="mb-6">
            <h3 class="text-xl font-bold mb-1">
              Lifetime
            </h3>
            <p class="text-sm text-muted">
              Pay once, use forever.
            </p>
          </div>

          <div class="mb-6">
            <div class="flex items-baseline gap-1">
              <span class="text-4xl font-bold">{{ PRICING.LIFETIME.label }}</span>
            </div>
            <p class="text-xs text-muted mt-1">
              One-time payment
            </p>
          </div>

          <ul class="space-y-3 mb-8 flex-1">
            <li
              v-for="benefit in lifetimeBenefits"
              :key="benefit.label"
              class="flex items-center gap-3 text-sm"
            >
              <UIcon
                :name="benefit.icon"
                class="size-4 text-primary shrink-0"
              />
              {{ benefit.label }}
            </li>
          </ul>

          <UButton
            block
            size="lg"
            :label="lifetimeCtaLabel"
            :loading="checkoutLoading"
            @click="handleLifetimeClick"
          />
        </div>
      </div>
    </UPageSection>

    <!-- ====== FOR TEAMS ====== -->
    <UPageSection
      v-if="activeTab === 'teams'"
      :ui="{ root: 'pt-0' }"
    >
      <!-- Billing Toggle -->
      <div class="flex items-center justify-center gap-3 mb-10">
        <span
          class="text-sm font-medium transition-colors"
          :class="!isYearly ? 'text-default' : 'text-muted'"
        >
          Quarterly
        </span>
        <USwitch
          v-model="isYearly"
          size="lg"
        />
        <span
          class="text-sm font-medium transition-colors"
          :class="isYearly ? 'text-default' : 'text-muted'"
        >
          Yearly
        </span>
        <UBadge
          v-if="isYearly"
          color="primary"
          variant="subtle"
          size="sm"
        >
          Save ~20% per user
        </UBadge>
      </div>

      <!-- Single Team Card, centered -->
      <div class="max-w-lg mx-auto">
        <div class="relative rounded-2xl border border-default bg-elevated p-8 flex flex-col">
          <div class="mb-6">
            <h3 class="text-xl font-bold mb-1">
              Team
            </h3>
            <p class="text-sm text-muted">
              Perfect for small teams and agencies.
            </p>
          </div>

          <div class="mb-6">
            <div class="flex items-baseline gap-1">
              <span class="text-4xl font-bold">{{ teamBilling.perMonth }}</span>
              <span class="text-muted text-sm">/month per user</span>
            </div>
            <p class="text-xs text-muted mt-1">
              {{ teamBilling.label }} billed {{ isYearly ? 'yearly' : 'quarterly' }}
            </p>
          </div>

          <!-- Adding Members Info -->
          <div class="rounded-lg bg-muted/50 p-4 mb-6">
            <p class="text-sm font-medium mb-1">
              Adding members
            </p>
            <p class="text-xs text-muted">
              Minimum 2 users. Add unlimited members at the same per-user rate. Each member gets full access to all resources.
            </p>
          </div>

          <ul class="space-y-3 mb-8 flex-1">
            <li
              v-for="benefit in teamBenefits"
              :key="benefit.label"
              class="flex items-center gap-3 text-sm"
            >
              <UIcon
                :name="benefit.icon"
                class="size-4 text-primary shrink-0"
              />
              {{ benefit.label }}
            </li>
          </ul>

          <UButton
            block
            size="lg"
            :label="teamCtaLabel"
            :loading="checkoutLoading"
            @click="handleTeamClick"
          />
        </div>
      </div>
    </UPageSection>

    <USeparator />

    <!-- FAQ -->
    <UPageSection
      headline="FAQ"
      title="Frequently asked questions"
      description="Everything you need to know about The Vault and our plans."
    >
      <div class="max-w-3xl mx-auto mt-8">
        <UAccordion :items="faqItems" />
      </div>
    </UPageSection>

    <USeparator />

    <!-- CTA -->
    <UPageSection
      :ui="{ container: 'px-0 sm:px-6 lg:px-8' }"
    >
      <UPageCTA
        title="Start building faster today"
        description="Join The Vault and explore production-ready components, animations, and code snippets."
        variant="subtle"
        :links="[
          {
            label: 'Get Started',
            to: '/register',
            trailingIcon: 'i-lucide-arrow-right',
            color: 'neutral' as const
          }
        ]"
        class="rounded-none sm:rounded-xl"
      />
    </UPageSection>
  </div>
</template>
