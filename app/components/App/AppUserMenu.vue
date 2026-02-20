<script setup lang="ts">
const { user, logout } = useAuth()
const authStore = useAuthStore()
const colorMode = useColorMode()

const subscriptionLabel = computed(() => {
  if (user.value?.planType === 'lifetime') return 'Lifetime Member'
  if (user.value?.planType === 'team') return 'Team Plan'
  switch (user.value?.subscriptionStatus) {
    case 'active':
      return 'Solo Plan'
    case 'canceled':
      return 'Canceled'
    default:
      return 'Free Plan'
  }
})

const memberDays = computed(() => {
  if (!user.value?.subscribedAt) return null
  const diff = Date.now() - new Date(user.value.subscribedAt).getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
})

const menuItems = computed(() => [
  // Header: Icon + Member type + days
  [{
    label: subscriptionLabel.value,
    description: memberDays.value !== null ? `${memberDays.value} days` : undefined,
    icon: 'i-lucide-circle-user-round',
    type: 'label' as const
  }],
  // Navigation
  [
    {
      label: 'Settings',
      icon: 'i-lucide-cog',
      to: '/account'
    },
    ...(!authStore.isSubscribed
      ? [{
          label: 'Upgrade',
          icon: 'i-lucide-sparkles',
          to: '/plans'
        }]
      : [])
  ],
  // Appearance toggle with switch
  [{
    label: colorMode.preference === 'dark' ? 'Dark Mode' : 'Light Mode',
    icon: colorMode.preference === 'dark' ? 'i-lucide-moon' : 'i-lucide-sun',
    slot: 'appearance',
    onSelect: (e: Event) => {
      e.preventDefault()
      colorMode.preference = colorMode.preference === 'dark' ? 'light' : 'dark'
    }
  }],
  // Admin (conditional)
  ...(authStore.isAdmin
    ? [[{
        label: 'Admin Panel',
        icon: 'i-lucide-shield',
        to: '/admin'
      }]]
    : []),
  // External links
  [{
    label: 'Join Community',
    icon: 'i-simple-icons-discord',
    to: 'https://discord.com',
    target: '_blank'
  }],
  // Logout
  [{
    label: 'Log out',
    icon: 'i-lucide-log-out',
    color: 'error' as const,
    onSelect: () => logout()
  }]
])
</script>

<template>
  <UDropdownMenu
    :items="menuItems"
    :content="{ side: 'top', align: 'start' }"
    :ui="{ content: 'w-56' }"
  >
    <button
      class="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-left hover:bg-elevated/50 transition-colors cursor-pointer"
    >
      <UAvatar
        size="sm"
        :text="authStore.initials"
        :src="user?.avatarUrl"
      />
      <div class="flex-1 min-w-0 group-data-[collapsed]/sidebar:hidden">
        <p class="text-sm font-medium truncate">
          {{ user?.displayName }}
        </p>
      </div>
      <UIcon
        name="i-lucide-ellipsis-vertical"
        class="size-4 text-muted shrink-0 group-data-[collapsed]/sidebar:hidden"
      />
    </button>

    <template #appearance-trailing>
      <USwitch
        :model-value="colorMode.preference === 'dark'"
        size="sm"
        @update:model-value="(val: boolean) => {
          colorMode.preference = val ? 'dark' : 'light'
        }"
        @click.stop
      />
    </template>
  </UDropdownMenu>
</template>
