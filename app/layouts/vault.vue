<script setup lang="ts">
import { SIDEBAR_EXTRA_ITEMS } from '~/utils/constants'
import { mockCategories, mockResources } from '~/utils/mock-data'
import type { CategoryWithCount } from '~/types'

// Compute category counts from resources
const categoriesWithCount = computed<CategoryWithCount[]>(() => {
  return mockCategories.map(cat => ({
    ...cat,
    count: mockResources.filter(r => r.category === cat.$id).length
  }))
})

// Build sidebar navigation items from categories
const categoryNavItems = computed(() => {
  return categoriesWithCount.value.map(cat => ({
    label: cat.name,
    icon: cat.icon,
    to: `/vault?category=${cat.slug}`,
    badge: String(cat.count)
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
  <UDashboardGroup>
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
        <div class="flex items-center gap-2 px-2 py-1">
          <UAvatar
            size="sm"
            text="DS"
          />
          <div class="flex-1 min-w-0 group-data-[collapsed]/sidebar:hidden">
            <p class="text-sm font-medium truncate">
              David Schubert
            </p>
          </div>
          <UDropdownMenu
            :items="[
              [{ label: 'Account', icon: 'i-lucide-user' }],
              [{ label: 'Dark mode', icon: 'i-lucide-moon' }],
              [{ label: 'Logout', icon: 'i-lucide-log-out' }]
            ]"
          >
            <UButton
              icon="i-lucide-ellipsis-vertical"
              variant="ghost"
              color="neutral"
              size="xs"
              class="group-data-[collapsed]/sidebar:hidden"
            />
          </UDropdownMenu>
        </div>
      </template>
    </UDashboardSidebar>

    <UDashboardPanel>
      <UDashboardNavbar>
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UDashboardSearchButton />
          <UButton
            icon="i-lucide-bookmark"
            variant="ghost"
            color="neutral"
            aria-label="Bookmarks"
          />
        </template>
      </UDashboardNavbar>

      <slot />
    </UDashboardPanel>
  </UDashboardGroup>
</template>
