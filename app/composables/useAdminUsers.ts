import type { AdminUser } from '~/types'

// Mock data for development without Appwrite
const mockUsers: AdminUser[] = [
  {
    $id: 'user-001',
    name: 'David Schubert',
    email: 'david@example.com',
    emailVerification: true,
    status: true,
    labels: ['admin'],
    registration: '2024-06-15T10:30:00.000Z',
    subscriptionStatus: 'active',
    planType: 'lifetime'
  },
  {
    $id: 'user-002',
    name: 'Anna Müller',
    email: 'anna@example.com',
    emailVerification: true,
    status: true,
    labels: [],
    registration: '2024-08-22T14:15:00.000Z',
    subscriptionStatus: 'active',
    planType: 'solo'
  },
  {
    $id: 'user-003',
    name: 'Max Fischer',
    email: 'max@example.com',
    emailVerification: false,
    status: true,
    labels: [],
    registration: '2024-09-10T09:00:00.000Z',
    subscriptionStatus: 'free'
  },
  {
    $id: 'user-004',
    name: 'Lisa Weber',
    email: 'lisa@example.com',
    emailVerification: true,
    status: false,
    labels: [],
    registration: '2024-07-05T16:45:00.000Z',
    subscriptionStatus: 'canceled'
  },
  {
    $id: 'user-005',
    name: 'Tom Schmidt',
    email: 'tom@example.com',
    emailVerification: true,
    status: true,
    labels: [],
    registration: '2024-10-01T11:20:00.000Z',
    subscriptionStatus: 'active',
    planType: 'team'
  },
  {
    $id: 'user-006',
    name: 'Sarah Koch',
    email: 'sarah@example.com',
    emailVerification: true,
    status: true,
    labels: [],
    registration: '2024-11-18T08:30:00.000Z',
    subscriptionStatus: 'free'
  },
  {
    $id: 'user-007',
    name: 'Jan Becker',
    email: 'jan@example.com',
    emailVerification: false,
    status: true,
    labels: [],
    registration: '2025-01-05T13:00:00.000Z',
    subscriptionStatus: 'past_due',
    planType: 'solo'
  },
  {
    $id: 'user-008',
    name: 'Mia Hoffmann',
    email: 'mia@example.com',
    emailVerification: true,
    status: true,
    labels: [],
    registration: '2025-02-10T15:45:00.000Z',
    subscriptionStatus: 'free'
  }
]

export function useAdminUsers() {
  const toast = useToast()
  const authStore = useAuthStore()
  const MOCK_MODE = isMockMode()

  const users = ref<AdminUser[]>([])
  const totalUsers = ref(0)
  const loading = ref(false)
  const search = ref('')
  const page = ref(1)
  const pageSize = 25

  // Headers for server API calls
  function getAuthHeaders() {
    return {
      'x-user-id': authStore.user?.userId || ''
    }
  }

  async function loadUsers() {
    loading.value = true
    try {
      if (MOCK_MODE) {
        await new Promise(resolve => setTimeout(resolve, 300))
        const q = search.value.toLowerCase()
        const filtered = search.value.trim()
          ? mockUsers.filter(u =>
              u.name.toLowerCase().includes(q)
              || u.email.toLowerCase().includes(q)
            )
          : mockUsers
        users.value = filtered
        totalUsers.value = filtered.length
      } else {
        const offset = (page.value - 1) * pageSize
        const result = await $fetch('/api/admin/users', {
          query: {
            search: search.value,
            limit: pageSize,
            offset
          },
          headers: getAuthHeaders()
        })
        users.value = result.users as AdminUser[]
        totalUsers.value = result.total
      }
    } catch (error) {
      console.error('Failed to load users:', error)
      toast.add({ title: 'Failed to load users', color: 'error' })
    } finally {
      loading.value = false
    }
  }

  async function updateUser(
    id: string,
    data: { name?: string, email?: string, labels?: string[], status?: boolean }
  ): Promise<boolean> {
    try {
      if (MOCK_MODE) {
        await new Promise(resolve => setTimeout(resolve, 300))
        users.value = users.value.map(u =>
          u.$id === id ? { ...u, ...data } : u
        )
        toast.add({ title: 'User updated' })
        return true
      } else {
        const updated = await $fetch(`/api/admin/users/${id}`, {
          method: 'PATCH',
          body: data,
          headers: getAuthHeaders()
        })
        users.value = users.value.map(u =>
          u.$id === id ? { ...u, ...updated } : u
        )
        toast.add({ title: 'User updated' })
        return true
      }
    } catch (error) {
      console.error('Failed to update user:', error)
      toast.add({ title: 'Failed to update user', color: 'error' })
      return false
    }
  }

  async function deleteUser(id: string): Promise<boolean> {
    try {
      if (MOCK_MODE) {
        await new Promise(resolve => setTimeout(resolve, 300))
        users.value = users.value.filter(u => u.$id !== id)
        totalUsers.value = users.value.length
        toast.add({ title: 'User deleted' })
        return true
      } else {
        await $fetch(`/api/admin/users/${id}`, {
          method: 'DELETE',
          headers: getAuthHeaders()
        })
        users.value = users.value.filter(u => u.$id !== id)
        totalUsers.value -= 1
        toast.add({ title: 'User deleted' })
        return true
      }
    } catch (error) {
      console.error('Failed to delete user:', error)
      toast.add({ title: 'Failed to delete user', color: 'error' })
      return false
    }
  }

  async function toggleUserStatus(id: string, active: boolean): Promise<boolean> {
    return await updateUser(id, { status: active })
  }

  return {
    users,
    totalUsers,
    loading,
    search,
    page,
    pageSize,
    loadUsers,
    updateUser,
    deleteUser,
    toggleUserStatus
  }
}
