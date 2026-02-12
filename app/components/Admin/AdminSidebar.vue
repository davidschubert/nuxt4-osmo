<script setup lang="ts">
const route = useRoute()

const navItems = computed(() => [
  {
    label: 'Dashboard',
    icon: 'i-lucide-layout-dashboard',
    to: '/admin',
    active: route.path === '/admin'
  },
  {
    label: 'Resources',
    icon: 'i-lucide-file-code',
    to: '/admin/resources',
    active: route.path.startsWith('/admin/resources')
  },
  {
    label: 'Categories',
    icon: 'i-lucide-folder',
    to: '/admin/categories',
    active: route.path === '/admin/categories'
  }
])

const bottomItems = computed(() => [
  {
    label: 'Back to Vault',
    icon: 'i-lucide-arrow-left',
    to: '/vault'
  }
])
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
        to="/admin"
        class="flex items-center gap-2 px-2"
      >
        <UIcon
          name="i-lucide-shield"
          class="size-5 text-primary"
        />
        <span class="font-bold text-sm truncate group-data-[collapsed]/sidebar:hidden">
          Admin Panel
        </span>
      </NuxtLink>
    </template>

    <UNavigationMenu
      :items="navItems"
      orientation="vertical"
    />

    <USeparator class="my-2" />

    <UNavigationMenu
      :items="bottomItems"
      orientation="vertical"
    />

    <template #footer>
      <AppUserMenu />
    </template>
  </UDashboardSidebar>
</template>
