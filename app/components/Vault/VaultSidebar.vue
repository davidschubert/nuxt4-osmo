<script setup lang="ts">
import { SIDEBAR_EXTRA_ITEMS } from '~/utils/constants'

const { categoriesWithCount } = useCategories()
const route = useRoute()

// Build sidebar navigation items from categories
const categoryNavItems = computed(() => {
  return categoriesWithCount.value.map(cat => ({
    label: cat.name,
    icon: cat.icon,
    to: `/vault?category=${cat.slug}`,
    badge: cat.count > 0 ? String(cat.count) : undefined,
    active: route.query.category === cat.slug
  }))
})

// Extra navigation items (Icons, Learn, Easings)
const extraNavItems = computed(() => {
  return SIDEBAR_EXTRA_ITEMS.map(item => ({
    label: item.name,
    icon: item.icon,
    to: item.disabled ? undefined : item.to,
    badge: item.badge,
    disabled: item.disabled
  }))
})
</script>

<template>
  <UDashboardSidebar
    collapsible
    resizable
    :min-size="200"
    :default-size="260"
    :max-size="320"
  >
    <template #header>
      <NuxtLink
        to="/vault"
        class="flex items-center gap-2 px-2"
      >
        <UIcon
          name="i-lucide-sparkles"
          class="size-5 text-primary"
        />
        <span class="font-bold text-sm truncate group-data-[collapsed]/sidebar:hidden">
          The Vault
        </span>
      </NuxtLink>
    </template>

    <UNavigationMenu
      :items="categoryNavItems"
      orientation="vertical"
    />

    <USeparator class="my-2" />

    <UNavigationMenu
      :items="extraNavItems"
      orientation="vertical"
    />

    <template #footer>
      <AppUserMenu />
    </template>
  </UDashboardSidebar>
</template>
