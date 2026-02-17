import type { AppNotification } from '~/types'
import { APPWRITE } from '~/utils/constants'

// Shared state (singleton across all consumers)
const notifications = ref<AppNotification[]>([])
const loading = ref(false)
const isOpen = ref(false)

export function useNotifications() {
  const authStore = useAuthStore()

  const unreadCount = computed(() =>
    notifications.value.filter(n => !n.read).length
  )

  async function loadNotifications() {
    loading.value = true
    try {
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

  async function markAllAsRead() {
    const unread = notifications.value.filter(n => !n.read)
    unread.forEach((n) => {
      n.read = true
    })

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

  async function createNotification(
    data: Omit<AppNotification, '$id' | '$createdAt' | 'read'>
  ) {
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
