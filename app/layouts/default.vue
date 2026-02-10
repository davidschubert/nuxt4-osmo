<script setup lang="ts">
const links = [
  { label: 'Features', to: '/#features' },
  { label: 'Pricing', to: '/pricing' }
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
        <UNavigationMenu :items="links" />
      </template>

      <template #right>
        <UColorModeButton />
        <UButton
          to="/login"
          variant="ghost"
          color="neutral"
        >
          Login
        </UButton>
        <UButton to="/register">
          Get Started
        </UButton>
      </template>
    </UHeader>

    <UMain>
      <slot />
    </UMain>

    <USeparator />

    <UFooter>
      <template #left>
        <p class="text-sm text-muted">
          &copy; {{ new Date().getFullYear() }} The Vault. All rights reserved.
        </p>
      </template>

      <template #right>
        <UButton
          to="https://github.com"
          target="_blank"
          icon="i-simple-icons-github"
          aria-label="GitHub"
          color="neutral"
          variant="ghost"
        />
      </template>
    </UFooter>
  </div>
</template>
