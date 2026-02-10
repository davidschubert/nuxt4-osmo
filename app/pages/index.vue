<script setup lang="ts">
definePageMeta({
  layout: 'default'
})

useSeoMeta({
  title: 'The Vault - Code Snippets, UI Components & Animations',
  description: 'A curated library of code snippets, UI components, animations, and design assets. Browse, preview, and copy code in seconds.'
})
</script>

<template>
  <div>
    <UPageHero
      title="Welcome to The Vault"
      description="A curated library of code snippets, UI components, animations, and design assets. Browse, preview, and copy code in seconds."
      :links="[{
        label: 'Get Started',
        to: '/register',
        trailingIcon: 'i-lucide-arrow-right',
        size: 'xl'
      }, {
        label: 'View Pricing',
        to: '/pricing',
        size: 'xl',
        color: 'neutral',
        variant: 'outline'
      }]"
    />

    <UPageSection
      id="features"
      title="Everything you need to build faster"
      description="Browse a growing library of production-ready code snippets, UI components, animations, and design assets."
      :features="[{
        icon: 'i-lucide-code-2',
        title: 'Copy-paste code',
        description: 'Ready-to-use HTML, CSS, and JavaScript snippets. Copy the code, paste it in your project, and customize.'
      }, {
        icon: 'i-lucide-eye',
        title: 'Live previews',
        description: 'See every component and animation in action before you use it. No guessing required.'
      }, {
        icon: 'i-lucide-layers',
        title: 'Organized by category',
        description: 'Buttons, animations, navigation, sliders, and more. Find what you need in seconds.'
      }, {
        icon: 'i-lucide-search',
        title: 'Powerful search',
        description: 'Search across all resources by title, description, or tags. Keyboard shortcuts included.'
      }, {
        icon: 'i-lucide-palette',
        title: 'Dark & light mode',
        description: 'All components work beautifully in both dark and light mode out of the box.'
      }, {
        icon: 'i-lucide-zap',
        title: 'Regular updates',
        description: 'New resources added regularly. Premium members get early access to the latest additions.'
      }]"
    />

    <UPageSection>
      <UPageCTA
        title="Ready to supercharge your workflow?"
        description="Join thousands of developers and designers using The Vault to build faster."
        variant="subtle"
        :links="[{
          label: 'Get Started for Free',
          to: '/register',
          trailingIcon: 'i-lucide-arrow-right',
          color: 'neutral'
        }, {
          label: 'View Pricing',
          to: '/pricing',
          color: 'neutral',
          variant: 'outline'
        }]"
      />
    </UPageSection>
  </div>
</template>
