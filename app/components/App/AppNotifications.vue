<script setup lang="ts">
import type { AppNotification } from '~/types'

const {
  notifications,
  unreadCount,
  loading,
  isOpen,
  markAsRead,
  markAllAsRead,
  close
} = useNotifications()

function formatTimeAgo(iso: string): string {
  const now = Date.now()
  const then = new Date(iso).getTime()
  const diff = now - then

  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return new Date(iso).toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })
}

function getNotifIcon(type: AppNotification['type']): string {
  switch (type) {
    case 'resource_added': return 'i-lucide-plus-circle'
    case 'resource_updated': return 'i-lucide-refresh-cw'
    case 'user_registered': return 'i-lucide-user-plus'
    case 'profile_updated': return 'i-lucide-user-check'
    case 'system': return 'i-lucide-info'
    default: return 'i-lucide-bell'
  }
}

function handleClick(notif: AppNotification) {
  markAsRead(notif.$id)
  if (notif.linkTo) {
    navigateTo(notif.linkTo)
    close()
  }
}
</script>

<template>
  <USlideover
    v-model:open="isOpen"
    side="right"
    title="Notifications"
  >
    <!-- We don't use default slot trigger — it's controlled externally via isOpen -->
    <template #header>
      <div class="flex items-center justify-between w-full">
        <h3 class="text-base font-semibold">
          Notifications
        </h3>
        <div class="flex items-center gap-2">
          <UButton
            v-if="unreadCount > 0"
            variant="ghost"
            color="neutral"
            size="xs"
            label="Mark all read"
            @click="markAllAsRead"
          />
        </div>
      </div>
    </template>

    <template #body>
      <!-- Loading -->
      <div
        v-if="loading"
        class="flex justify-center py-12"
      >
        <UIcon
          name="i-lucide-loader-2"
          class="size-6 animate-spin text-muted"
        />
      </div>

      <!-- Empty state -->
      <div
        v-else-if="notifications.length === 0"
        class="flex flex-col items-center justify-center py-12 text-center"
      >
        <UIcon
          name="i-lucide-bell-off"
          class="size-10 text-muted mb-3"
        />
        <p class="text-sm text-muted">
          No notifications yet
        </p>
      </div>

      <!-- Notification list -->
      <div
        v-else
        class="divide-y divide-default"
      >
        <button
          v-for="notif in notifications"
          :key="notif.$id"
          class="flex items-start gap-3 p-4 w-full text-left hover:bg-muted/50 transition-colors"
          :class="{ 'opacity-60': notif.read }"
          @click="handleClick(notif)"
        >
          <!-- Icon or Avatar -->
          <div class="shrink-0 mt-0.5">
            <UAvatar
              v-if="notif.actorName"
              size="sm"
              :text="notif.actorName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)"
              :src="notif.avatarUrl"
            />
            <div
              v-else
              class="size-8 rounded-full bg-muted flex items-center justify-center"
            >
              <UIcon
                :name="getNotifIcon(notif.type)"
                class="size-4 text-muted"
              />
            </div>
          </div>

          <!-- Content -->
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium leading-tight">
              {{ notif.title }}
            </p>
            <p class="text-xs text-muted mt-0.5 line-clamp-2">
              {{ notif.message }}
            </p>
            <p class="text-xs text-muted mt-1">
              {{ formatTimeAgo(notif.$createdAt) }}
            </p>
          </div>

          <!-- Unread indicator -->
          <div
            v-if="!notif.read"
            class="size-2 rounded-full bg-primary shrink-0 mt-2"
          />
        </button>
      </div>
    </template>
  </USlideover>
</template>
