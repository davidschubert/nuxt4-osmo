<script setup lang="ts">
const { user, logout } = useAuth()
const authStore = useAuthStore()
const colorMode = useColorMode()

const isDark = computed({
  get: () => colorMode.preference === 'dark',
  set: (value: boolean) => {
    colorMode.preference = value ? 'dark' : 'light'
  }
})

const subscriptionLabel = computed(() => {
  switch (user.value?.subscriptionStatus) {
    case 'active':
      return 'Pro Member'
    case 'canceled':
      return 'Canceled'
    case 'past_due':
      return 'Past Due'
    default:
      return 'Free Plan'
  }
})

const menuItems = computed(() => [
  ...(authStore.isAdmin
    ? [[{
        label: 'Admin Panel',
        icon: 'i-lucide-shield',
        to: '/admin'
      }]]
    : []),
  [{
    label: 'Account',
    icon: 'i-lucide-user',
    to: '/account'
  }],
  [{
    label: 'Dark mode',
    icon: isDark.value ? 'i-lucide-moon' : 'i-lucide-sun',
    onSelect: () => {
      isDark.value = !isDark.value
    }
  }],
  [{
    label: 'Join Community',
    icon: 'i-simple-icons-discord',
    to: 'https://discord.com',
    target: '_blank'
  }],
  [{
    label: 'Logout',
    icon: 'i-lucide-log-out',
    onSelect: () => logout()
  }]
])
</script>

<template>
  <div class="flex items-center gap-2 px-2 py-1">
    <UAvatar
      size="sm"
      :text="authStore.initials"
      :src="user?.avatarUrl"
    />
    <div class="flex-1 min-w-0 group-data-[collapsed]/sidebar:hidden">
      <p class="text-sm font-medium truncate">
        {{ user?.displayName }}
      </p>
      <p class="text-xs text-muted truncate">
        {{ subscriptionLabel }}
      </p>
    </div>
    <UDropdownMenu :items="menuItems">
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
