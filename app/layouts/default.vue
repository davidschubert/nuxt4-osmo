<script setup lang="ts">
const { isAuthenticated } = useAuth()

const navLinks = [
  { label: 'Features', to: '/#features' },
  { label: 'Plans', to: '/plans' }
]

const footerLinks = [
  {
    label: 'Product',
    children: [
      { label: 'Features', to: '/#features', disabled: false },
      { label: 'Plans', to: '/plans', disabled: false },
      { label: 'Changelog', to: '#', disabled: true }
    ]
  },
  {
    label: 'Resources',
    children: [
      { label: 'Documentation', to: '#', disabled: true },
      { label: 'Community', to: '#', disabled: true },
      { label: 'Support', to: '#', disabled: true }
    ]
  },
  {
    label: 'Legal',
    children: [
      { label: 'Privacy Policy', to: '#', disabled: true },
      { label: 'Terms of Service', to: '#', disabled: true },
      { label: 'License', to: '#', disabled: true }
    ]
  }
]
</script>

<template>
  <div>
    <UHeader>
      <template #left>
        <NuxtLink
          to="/"
          class="flex items-center gap-2"
        >
          <UIcon
            name="i-lucide-sparkles"
            class="size-5 text-primary"
          />
          <span class="font-bold text-lg">The Vault</span>
        </NuxtLink>
      </template>

      <template #center>
        <UNavigationMenu :items="navLinks" />
      </template>

      <template #right>
        <UColorModeButton />
        <template v-if="!isAuthenticated">
          <UButton
            to="/login"
            variant="ghost"
            color="neutral"
          >
            Login
          </UButton>
          <UButton to="/plans">
            Join
          </UButton>
        </template>
        <UButton
          v-else
          to="/vault"
        >
          Launch
        </UButton>
      </template>
    </UHeader>

    <UMain>
      <slot />
    </UMain>

    <USeparator />

    <UFooter>
      <template #left>
        <div class="space-y-4">
          <NuxtLink
            to="/"
            class="flex items-center gap-2"
          >
            <UIcon
              name="i-lucide-sparkles"
              class="size-5 text-primary"
            />
            <span class="font-bold text-lg">The Vault</span>
          </NuxtLink>
          <p class="text-sm text-muted max-w-xs">
            A curated library of production-ready code snippets, UI components, and animations.
          </p>
          <p class="text-sm text-muted">
            &copy; {{ new Date().getFullYear() }} The Vault. All rights reserved.
          </p>
        </div>
      </template>

      <template #center>
        <div class="grid grid-cols-3 gap-8">
          <div
            v-for="group in footerLinks"
            :key="group.label"
            class="space-y-3"
          >
            <p class="text-sm font-semibold">
              {{ group.label }}
            </p>
            <ul class="space-y-2">
              <li
                v-for="link in group.children"
                :key="link.label"
              >
                <NuxtLink
                  v-if="!link.disabled"
                  :to="link.to"
                  class="text-sm text-muted hover:text-default transition-colors"
                >
                  {{ link.label }}
                </NuxtLink>
                <span
                  v-else
                  class="text-sm text-muted/50 cursor-default"
                  title="Coming soon"
                >
                  {{ link.label }}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </template>

      <template #right>
        <div class="flex gap-2">
          <UButton
            to="https://github.com"
            target="_blank"
            icon="i-simple-icons-github"
            aria-label="GitHub"
            color="neutral"
            variant="ghost"
          />
          <UButton
            to="https://discord.com"
            target="_blank"
            icon="i-simple-icons-discord"
            aria-label="Discord"
            color="neutral"
            variant="ghost"
          />
          <UButton
            to="https://x.com"
            target="_blank"
            icon="i-simple-icons-x"
            aria-label="X (Twitter)"
            color="neutral"
            variant="ghost"
          />
        </div>
      </template>
    </UFooter>
  </div>
</template>
