<script setup lang="ts">
import type { PricingPlanProps, ButtonProps } from '@nuxt/ui'

definePageMeta({
  layout: 'default'
})

useSeoMeta({
  title: 'Pricing - The Vault',
  description: 'Choose the plan that fits your workflow. Start free with essential resources, or unlock the full library with Pro.',
  ogTitle: 'Pricing - The Vault',
  ogDescription: 'Choose the plan that fits your workflow. Start free or go Pro.'
})

const plans: PricingPlanProps[] = [
  {
    title: 'Free',
    description: 'Perfect for exploring and getting started.',
    price: '$0',
    billingCycle: '/forever',
    features: [
      'Access to free resources',
      'Live previews',
      'Copy-paste code snippets',
      'Dark & light mode',
      'Search across all resources',
      'Community access'
    ],
    button: {
      label: 'Get Started',
      to: '/register',
      color: 'neutral',
      variant: 'outline'
    }
  },
  {
    title: 'Pro',
    description: 'For serious builders who want the full library.',
    price: '$19',
    billingCycle: '/month',
    billingPeriod: 'or $149/year (save 35%)',
    badge: 'Most popular',
    highlight: true,
    scale: true,
    features: [
      'Everything in Free',
      'Access to all premium resources',
      'Early access to new additions',
      'Priority support',
      'Figma source files',
      'Implementation documentation',
      'Commercial license included'
    ],
    button: {
      label: 'Subscribe to Pro',
      to: '/register'
    }
  },
  {
    title: 'Lifetime',
    description: 'Pay once, own it forever.',
    price: '$499',
    tagline: 'One-time payment',
    features: [
      'Everything in Pro',
      'Lifetime access to all resources',
      'All future updates included',
      'Priority support forever',
      'Exclusive lifetime badge',
      'Early access to new features'
    ],
    button: {
      label: 'Buy Lifetime',
      to: '/register',
      color: 'neutral',
      variant: 'subtle'
    }
  }
]

const faqItems = [
  {
    question: 'Can I use the free resources in commercial projects?',
    answer: 'Yes! All free resources come with a permissive license that allows commercial use.'
  },
  {
    question: 'What happens if I cancel my Pro subscription?',
    answer: 'You\'ll keep access until the end of your billing period. After that, you\'ll revert to the Free plan and can still access free resources.'
  },
  {
    question: 'Can I upgrade from monthly to yearly?',
    answer: 'Absolutely! You can switch plans at any time from your account settings. The remaining balance will be prorated.'
  },
  {
    question: 'Do you offer team or enterprise plans?',
    answer: 'Not yet, but we\'re working on it. Reach out to us if you\'re interested in a team plan.'
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards through Stripe. For Lifetime plans, we also support bank transfers.'
  }
]

const ctaLinks: ButtonProps[] = [
  {
    label: 'Get Started for Free',
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
      description="Start free with essential resources, or unlock the full library with Pro. No hidden fees, cancel anytime."
      :ui="{
        root: 'py-16 sm:py-24'
      }"
    />

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
        description="Join The Vault for free and explore production-ready components, animations, and code snippets."
        variant="subtle"
        :links="ctaLinks"
        class="rounded-none sm:rounded-xl"
      />
    </UPageSection>
  </div>
</template>
