<script setup lang="ts">
// Load categories and resources for admin pages
const { loadCategories } = useCategories()
const { loadResources } = useResources()

// Notifications
const notif = useNotifications()

onMounted(async () => {
  await Promise.all([
    loadCategories(),
    loadResources(),
    notif.loadNotifications()
  ])
})
</script>

<template>
  <div>
    <UDashboardGroup unit="px">
      <AdminSidebar />

      <UDashboardPanel>
        <template #header>
          <UDashboardNavbar>
            <template #leading>
              <UDashboardSidebarCollapse />
            </template>

            <template #right>
              <div class="relative">
                <UButton
                  icon="i-lucide-bell"
                  variant="ghost"
                  color="neutral"
                  aria-label="Notifications"
                  @click="notif.open()"
                />
                <span
                  v-if="notif.unreadCount.value > 0"
                  class="absolute -top-1 -right-1 size-4 rounded-full bg-primary text-[10px] font-bold text-white flex items-center justify-center pointer-events-none"
                >
                  {{ notif.unreadCount.value > 9 ? '9+' : notif.unreadCount.value }}
                </span>
              </div>
              <UBadge
                color="warning"
                variant="subtle"
              >
                Admin
              </UBadge>
            </template>
          </UDashboardNavbar>
        </template>

        <template #body>
          <slot />
        </template>
      </UDashboardPanel>
    </UDashboardGroup>

    <AppNotifications />
  </div>
</template>
