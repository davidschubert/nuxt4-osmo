<script setup lang="ts">
// Load categories and resources when vault layout mounts
const { loadCategories } = useCategories()
const { loadResources } = useResources()

onMounted(async () => {
  await Promise.all([
    loadCategories(),
    loadResources()
  ])
})

// Keyboard shortcuts
defineShortcuts({
  'g-h': {
    handler: () => navigateTo('/vault')
  },
  'g-p': {
    handler: () => navigateTo('/pricing')
  },
  'g-a': {
    handler: () => navigateTo('/account')
  }
})
</script>

<template>
  <UDashboardGroup unit="px">
    <VaultSidebar />

    <AppSearch />

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
