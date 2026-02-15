<script setup lang="ts">
import type { PricingPlanProps, ButtonProps } from '@nuxt/ui'
import { PRICING } from '~/utils/constants'

definePageMeta({
  layout: 'default'
})

useSeoMeta({
  title: 'Pricing - The Vault',
  description: 'Choose the plan that fits your workflow. Solo, Team, or Lifetime — all in EUR.',
  ogTitle: 'Pricing - The Vault',
  ogDescription: 'Choose the plan that fits your workflow. Solo, Team, or Lifetime.'
})

const { isAuthenticated, isSubscribed } = useAuth()
const { startCheckout, openPortal, checkoutLoading } = useSubscription()
const config = useRuntimeConfig()

// Billing toggle: quarterly vs yearly
const isYearly = ref(false)

function handleSoloClick() {
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

function handleLifetimeClick() {
  if (!isAuthenticated.value) {
    navigateTo('/register')
  } else if (isSubscribed.value) {
    openPortal()
  } else {
    startCheckout(config.public.stripeLifetimePriceId as string, 'payment')
  }
}

const plans = computed<PricingPlanProps[]>(() => {
  const solo = PRICING.SOLO
  const team = PRICING.TEAM
  const lifetime = PRICING.LIFETIME

  const soloBilling = isYearly.value ? solo.yearly : solo.quarterly
  const teamBilling = isYearly.value ? team.yearly : team.quarterly

  return [
    {
      title: solo.name,
      description: 'Full access for one developer.',
      price: soloBilling.label,
      billingCycle: isYearly.value ? '/year' : '/quarter',
      billingPeriod: `${soloBilling.perMonth}/month`,
      features: [
        'Access to all resources',
        'Live previews & code snippets',
        'Figma source files',
        'Implementation docs',
        'Commercial license',
        '1 seat'
      ],
      button: {
        label: isSubscribed.value ? 'Manage Subscription' : 'Get Solo',
        loading: checkoutLoading.value,
        color: 'neutral',
        variant: 'outline',
        onClick: handleSoloClick
      } as ButtonProps
    },
    {
      title: team.name,
      description: 'Perfect for small teams and agencies.',
      price: teamBilling.label,
      billingCycle: isYearly.value ? '/year' : '/quarter',
      billingPeriod: `${teamBilling.perMonth}/month`,
      badge: 'Best value',
      highlight: true,
      scale: true,
      features: [
        'Everything in Solo',
        '2 team seats included',
        'Invite team members',
        'Shared access to all resources',
        'Team management dashboard',
        'Priority support'
      ],
      button: {
        label: isSubscribed.value ? 'Manage Subscription' : 'Get Team',
        loading: checkoutLoading.value,
        onClick: handleTeamClick
      } as ButtonProps
    },
    {
      title: lifetime.name,
      description: 'Pay once, use forever.',
      price: lifetime.label,
      tagline: 'One-time payment',
      features: [
        'Everything in Solo',
        'Lifetime access to all resources',
        'All future updates included',
        'Priority support forever',
        'Exclusive lifetime badge',
        '1 seat'
      ],
      button: {
        label: isSubscribed.value ? 'Manage Subscription' : 'Buy Lifetime',
        color: 'neutral',
        variant: 'subtle',
        onClick: handleLifetimeClick
      } as ButtonProps
    }
  ]
})

const faqItems = [
  {
    question: 'What is the difference between Solo and Team?',
    answer: 'Solo gives full access to one developer. Team includes 2 seats so you can invite a colleague or collaborator to share access.'
  },
  {
    question: 'Can I switch between quarterly and yearly billing?',
    answer: 'Yes! You can switch plans at any time from your account settings. The remaining balance will be prorated.'
  },
  {
    question: 'What does Lifetime include?',
    answer: 'Lifetime gives you permanent access to all current and future resources with a single payment. No recurring fees ever.'
  },
  {
    question: 'Can I add more team members?',
    answer: 'The Team plan includes 2 seats. If you need more seats, please reach out and we can discuss a custom arrangement.'
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards through Stripe. All prices are in EUR.'
  }
]

const ctaLinks: ButtonProps[] = [
  {
    label: 'Get Started',
    to: '/register',
    trailingIcon: 'i-lucide-arrow-right',
    color: 'neutral'
  }
]
</script>

<template>
  <div>
    <!-- Hero -->
    <UPageHero
      headline="Pricing"
      title="Choose the plan that fits your workflow"
      description="All plans include full access to every resource. Solo for individuals, Team for collaboration, Lifetime for forever."
      :ui="{
        root: 'py-16 sm:py-24'
      }"
    />

    <!-- Billing toggle -->
    <UPageSection
      :ui="{
        root: 'pt-0 pb-4'
      }"
    >
      <div class="flex items-center justify-center gap-3">
        <span
          class="text-sm font-medium"
          :class="!isYearly ? 'text-primary' : 'text-muted'"
        >
          Quarterly
        </span>
        <USwitch
          v-model="isYearly"
          size="lg"
        />
        <span
          class="text-sm font-medium"
          :class="isYearly ? 'text-primary' : 'text-muted'"
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
    </UPageSection>

    <!-- Pricing Plans -->
    <UPageSection
      :ui="{
        root: 'pt-0'
      }"
    >
      <UPricingPlans
        :plans="plans"
        scale
        compact
      />
    </UPageSection>

    <USeparator />

    <!-- FAQ -->
    <UPageSection
      headline="FAQ"
      title="Frequently asked questions"
      description="Everything you need to know about The Vault and our pricing."
    >
      <div class="max-w-3xl mx-auto mt-8 space-y-6">
        <div
          v-for="item in faqItems"
          :key="item.question"
          class="space-y-2"
        >
          <h3 class="text-base font-semibold">
            {{ item.question }}
          </h3>
          <p class="text-sm text-muted">
            {{ item.answer }}
          </p>
        </div>
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
        :links="ctaLinks"
        class="rounded-none sm:rounded-xl"
      />
    </UPageSection>
  </div>
</template>
