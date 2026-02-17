<script setup lang="ts">
import { SIDEBAR_EXTRA_ITEMS } from '~/utils/constants'

const { categoriesWithCount } = useCategories()
const route = useRoute()

// Sidebar always starts expanded (override cookie persistence)
const sidebarCollapsed = ref(false)

// Build sidebar navigation items — categories nested under "The Vault" collapsible
const vaultNavItems = computed(() => [{
  label: 'The Vault',
  icon: 'i-lucide-archive',
  to: '/vault',
  defaultOpen: true,
  children: categoriesWithCount.value.map(cat => ({
    label: cat.name,
    icon: cat.icon,
    to: `/vault?category=${cat.slug}`,
    badge: cat.count > 0 ? String(cat.count) : undefined,
    active: route.query.category === cat.slug
  }))
}])

// Extra navigation items (Icons, Learn, Easings — all "Soon")
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
    v-model:collapsed="sidebarCollapsed"
    collapsible
    :default-size="18"
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
          OSMO
        </span>
      </NuxtLink>
    </template>

    <UNavigationMenu
      :items="vaultNavItems"
      orientation="vertical"
      :ui="{
        childList: 'ms-0 border-s-0',
        childItem: 'ps-0 ms-0',
        link: 'px-3 py-2 gap-2',
        childLink: 'px-3 py-2 gap-2'
      }"
    />

    <USeparator class="my-2" />

    <UNavigationMenu
      :items="extraNavItems"
      orientation="vertical"
      :ui="{
        link: 'px-3 py-2 gap-2'
      }"
    />

    <template #footer>
      <div class="pt-2 border-t border-default">
        <AppUserMenu />
      </div>
    </template>
  </UDashboardSidebar>
</template>
