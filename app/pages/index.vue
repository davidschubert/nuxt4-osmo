<script setup lang="ts">
import type { ButtonProps, PageFeatureProps } from '@nuxt/ui'

definePageMeta({
  layout: 'default'
})

useSeoMeta({
  title: 'The Vault - Code Snippets, UI Components & Animations',
  description: 'A curated library of production-ready code snippets, UI components, animations, and design assets. Browse, preview, and copy code in seconds.',
  ogTitle: 'The Vault - Code Snippets, UI Components & Animations',
  ogDescription: 'A curated library of production-ready code snippets, UI components, animations, and design assets.'
})

const heroLinks: ButtonProps[] = [
  {
    label: 'Get Started for Free',
    to: '/register',
    trailingIcon: 'i-lucide-arrow-right',
    size: 'xl'
  },
  {
    label: 'View Pricing',
    to: '/pricing',
    size: 'xl',
    color: 'neutral',
    variant: 'outline'
  }
]

const features: PageFeatureProps[] = [
  {
    icon: 'i-lucide-code-2',
    title: 'Copy-paste code',
    description: 'Ready-to-use HTML, CSS, and JavaScript snippets. Copy the code, paste it in your project, and customize.'
  },
  {
    icon: 'i-lucide-eye',
    title: 'Live previews',
    description: 'See every component and animation in action before you use it. No guessing required.'
  },
  {
    icon: 'i-lucide-layers',
    title: 'Organized by category',
    description: 'Buttons, animations, navigation, sliders, and more. Find what you need in seconds.'
  },
  {
    icon: 'i-lucide-search',
    title: 'Powerful search',
    description: 'Search across all resources by title, description, or tags. Keyboard shortcuts included.'
  },
  {
    icon: 'i-lucide-palette',
    title: 'Dark & light mode',
    description: 'All components work beautifully in both dark and light mode out of the box.'
  },
  {
    icon: 'i-lucide-zap',
    title: 'Regular updates',
    description: 'New resources added regularly. Premium members get early access to the latest additions.'
  }
]

const ctaLinks: ButtonProps[] = [
  {
    label: 'Get Started for Free',
    to: '/register',
    trailingIcon: 'i-lucide-arrow-right',
    color: 'neutral'
  },
  {
    label: 'View Pricing',
    to: '/pricing',
    color: 'neutral',
    variant: 'outline'
  }
]

const stats = [
  { value: '150+', label: 'Resources' },
  { value: '10', label: 'Categories' },
  { value: 'Ctrl+C', label: 'Copy & paste' },
  { value: '24/7', label: 'Access' }
]
</script>

<template>
  <div>
    <!-- Hero -->
    <UPageHero
      headline="Your design & code toolkit"
      title="Production-ready components, animations & code snippets"
      description="A curated library of code snippets, UI components, scroll animations, and design assets. Browse, preview, and copy code in seconds."
      :links="heroLinks"
      :ui="{
        root: 'py-24 sm:py-32 md:py-40',
        title: 'max-w-3xl',
        description: 'max-w-2xl'
      }"
    />

    <!-- Stats bar -->
    <UPageSection
      :ui="{
        root: 'py-8 sm:py-12',
        container: ''
      }"
    >
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
        <div
          v-for="stat in stats"
          :key="stat.label"
        >
          <p class="text-3xl sm:text-4xl font-bold text-primary">
            {{ stat.value }}
          </p>
          <p class="text-sm text-muted mt-1">
            {{ stat.label }}
          </p>
        </div>
      </div>
    </UPageSection>

    <USeparator />

    <!-- Features -->
    <UPageSection
      id="features"
      headline="Features"
      title="Everything you need to build faster"
      description="Browse a growing library of production-ready code snippets, UI components, animations, and design assets."
      :features="features"
    />

    <USeparator />

    <!-- How it works -->
    <UPageSection
      headline="How it works"
      title="From browse to build in seconds"
      description="The Vault is designed to get you from idea to implementation as fast as possible."
    >
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-8">
        <div class="text-center space-y-3">
          <div class="inline-flex items-center justify-center size-12 rounded-full bg-primary/10 text-primary">
            <UIcon
              name="i-lucide-search"
              class="size-6"
            />
          </div>
          <h3 class="text-lg font-semibold">
            1. Browse & search
          </h3>
          <p class="text-sm text-muted">
            Explore categories or use the search to find the perfect component or animation.
          </p>
        </div>
        <div class="text-center space-y-3">
          <div class="inline-flex items-center justify-center size-12 rounded-full bg-primary/10 text-primary">
            <UIcon
              name="i-lucide-eye"
              class="size-6"
            />
          </div>
          <h3 class="text-lg font-semibold">
            2. Preview live
          </h3>
          <p class="text-sm text-muted">
            See every resource in action with live previews. No guesswork needed.
          </p>
        </div>
        <div class="text-center space-y-3">
          <div class="inline-flex items-center justify-center size-12 rounded-full bg-primary/10 text-primary">
            <UIcon
              name="i-lucide-copy"
              class="size-6"
            />
          </div>
          <h3 class="text-lg font-semibold">
            3. Copy & customize
          </h3>
          <p class="text-sm text-muted">
            Copy the HTML, CSS, and JavaScript. Paste into your project and customize.
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
        title="Ready to supercharge your workflow?"
        description="Join developers and designers using The Vault to build faster. Start for free, upgrade when you need more."
        variant="subtle"
        :links="ctaLinks"
        class="rounded-none sm:rounded-xl"
      />
    </UPageSection>
  </div>
</template>
