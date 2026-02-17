import type { AppNotification } from '~/types'
import { APPWRITE } from '~/utils/constants'

// Mock notifications for development
const mockNotifications: AppNotification[] = [
  {
    $id: 'notif-1',
    $createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    userId: '*',
    type: 'resource_added',
    title: 'New resource added',
    message: '"Elastic Pulse Button" has been added to the vault',
    actorName: 'Admin',
    linkTo: '/vault/elastic-pulse-button',
    read: false
  },
  {
    $id: 'notif-2',
    $createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    userId: '*',
    type: 'resource_updated',
    title: 'Resource updated',
    message: '"Scroll Reveal Animation" has been updated with new code',
    actorName: 'Admin',
    linkTo: '/vault/scroll-reveal-animation',
    read: false
  },
  {
    $id: 'notif-3',
    $createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    userId: '*',
    type: 'user_registered',
    title: 'New user registered',
    message: 'Anna Müller joined The Vault',
    actorName: 'Anna Müller',
    read: true
  },
  {
    $id: 'notif-4',
    $createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    userId: '*',
    type: 'resource_added',
    title: 'New resource added',
    message: '"Magnetic Cursor Effect" has been added to the vault',
    actorName: 'Admin',
    linkTo: '/vault/magnetic-cursor-effect',
    read: true
  },
  {
    $id: 'notif-5',
    $createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    userId: '*',
    type: 'system',
    title: 'Welcome to The Vault!',
    message: 'Start exploring our curated library of UI components and animations',
    linkTo: '/vault',
    read: true
  },
  {
    $id: 'notif-6',
    $createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    userId: '*',
    type: 'profile_updated',
    title: 'Profile updated',
    message: 'Your display name has been changed successfully',
    read: true
  },
  {
    $id: 'notif-7',
    $createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    userId: '*',
    type: 'resource_added',
    title: 'New resources added',
    message: '3 new button animations have been added to the vault',
    actorName: 'Admin',
    linkTo: '/vault?category=buttons',
    read: true
  },
  {
    $id: 'notif-8',
    $createdAt: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
    userId: '*',
    type: 'user_registered',
    title: 'New user registered',
    message: 'Tom Schmidt joined The Vault',
    actorName: 'Tom Schmidt',
    read: true
  }
]

// Shared state (singleton across all consumers)
const notifications = ref<AppNotification[]>([])
const loading = ref(false)
const isOpen = ref(false)

export function useNotifications() {
  const authStore = useAuthStore()
  const MOCK_MODE = isMockMode()

  const unreadCount = computed(() =>
    notifications.value.filter(n => !n.read).length
  )

  async function loadNotifications() {
    loading.value = true
    try {
      if (MOCK_MODE) {
        await new Promise(resolve => setTimeout(resolve, 200))
        notifications.value = [...mockNotifications]
      } else {
        const { databases, Query } = useAppwrite()
        const userId = authStore.user?.userId
        if (!userId) return
        const result = await databases.listDocuments({
          databaseId: APPWRITE.DATABASE_ID,
          collectionId: APPWRITE.COLLECTIONS.NOTIFICATIONS,
          queries: [
            Query.equal('userId', [userId, '*']),
            Query.orderDesc('$createdAt'),
            Query.limit(50)
          ]
        })
        notifications.value = result.documents as unknown as AppNotification[]
      }
    } catch (error) {
      console.error('Failed to load notifications:', error)
    } finally {
      loading.value = false
    }
  }

  async function markAsRead(id: string) {
    const notif = notifications.value.find(n => n.$id === id)
    if (!notif || notif.read) return

    notif.read = true

    if (!MOCK_MODE) {
      try {
        const { databases } = useAppwrite()
        await databases.updateDocument({
          databaseId: APPWRITE.DATABASE_ID,
          collectionId: APPWRITE.COLLECTIONS.NOTIFICATIONS,
          documentId: id,
          data: { read: true }
        })
      } catch (error) {
        console.error('Failed to mark notification as read:', error)
      }
    }
  }

  async function markAllAsRead() {
    const unread = notifications.value.filter(n => !n.read)
    unread.forEach((n) => {
      n.read = true
    })

    if (!MOCK_MODE) {
      const { databases } = useAppwrite()
      await Promise.allSettled(
        unread.map(n =>
          databases.updateDocument({
            databaseId: APPWRITE.DATABASE_ID,
            collectionId: APPWRITE.COLLECTIONS.NOTIFICATIONS,
            documentId: n.$id,
            data: { read: true }
          })
        )
      )
    }
  }

  async function createNotification(
    data: Omit<AppNotification, '$id' | '$createdAt' | 'read'>
  ) {
    if (MOCK_MODE) {
      const newNotif: AppNotification = {
        ...data,
        $id: `notif-${Date.now()}`,
        $createdAt: new Date().toISOString(),
        read: false
      }
      notifications.value.unshift(newNotif)
    } else {
      try {
        const { databases, ID } = useAppwrite()
        await databases.createDocument({
          databaseId: APPWRITE.DATABASE_ID,
          collectionId: APPWRITE.COLLECTIONS.NOTIFICATIONS,
          documentId: ID.unique(),
          data: {
            ...data,
            read: false
          }
        })
      } catch (error) {
        console.error('Failed to create notification:', error)
      }
    }
  }

  function open() {
    isOpen.value = true
  }

  function close() {
    isOpen.value = false
  }

  return {
    notifications,
    unreadCount,
    loading,
    isOpen,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    createNotification,
    open,
    close
  }
}
