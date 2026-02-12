<script setup lang="ts">
// Load categories and resources for admin pages
const { loadCategories } = useCategories()
const { loadResources } = useResources()

onMounted(async () => {
  await Promise.all([
    loadCategories(),
    loadResources()
  ])
})
</script>

<template>
  <UDashboardGroup unit="px">
    <AdminSidebar />

    <UDashboardPanel>
      <UDashboardNavbar>
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UBadge
            color="warning"
            variant="subtle"
          >
            Admin
          </UBadge>
        </template>
      </UDashboardNavbar>

      <slot />
    </UDashboardPanel>
  </UDashboardGroup>
</template>
