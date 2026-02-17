<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import type { AdminUser } from '~/types'

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

useSeoMeta({
  title: 'Manage Users'
})

const {
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
} = useAdminUsers()

// Load users on mount
onMounted(() => loadUsers())

// Reload when search changes (debounced)
let searchTimeout: ReturnType<typeof setTimeout>
watch(search, () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    page.value = 1
    loadUsers()
  }, 300)
})

// Reload when page changes
watch(page, () => loadUsers())

// Row selection
const rowSelection = ref<Record<string, boolean>>({})
const table = useTemplateRef('table')

const selectedCount = computed(() => {
  return Object.values(rowSelection.value).filter(Boolean).length
})

// Format date helper
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('de-DE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Subscription badge color
function getPlanColor(status?: string): 'success' | 'warning' | 'error' | 'neutral' {
  switch (status) {
    case 'active': return 'success'
    case 'past_due': return 'warning'
    case 'canceled': return 'error'
    default: return 'neutral'
  }
}

function getPlanLabel(user: AdminUser): string {
  if (user.planType === 'lifetime') return 'Lifetime'
  if (user.planType === 'team') return 'Team'
  switch (user.subscriptionStatus) {
    case 'active': return 'Pro'
    case 'canceled': return 'Canceled'
    case 'past_due': return 'Past Due'
    default: return 'Free'
  }
}

// Table columns
const columns: TableColumn<AdminUser>[] = [
  {
    id: 'select',
    header: ({ table: t }) => h(resolveComponent('UCheckbox'), {
      'modelValue': t.getIsSomePageRowsSelected()
        ? 'indeterminate'
        : t.getIsAllPageRowsSelected(),
      'onUpdate:modelValue': (value: boolean | 'indeterminate') =>
        t.toggleAllPageRowsSelected(!!value),
      'ariaLabel': 'Select all'
    }),
    cell: ({ row }) => h(resolveComponent('UCheckbox'), {
      'modelValue': row.getIsSelected(),
      'onUpdate:modelValue': (value: boolean | 'indeterminate') =>
        row.toggleSelected(!!value),
      'ariaLabel': 'Select row'
    })
  },
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => {
      const initials = row.original.name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
      return h('div', { class: 'flex items-center gap-2' }, [
        h(resolveComponent('UAvatar'), {
          size: 'xs',
          text: initials
        }),
        h('div', {}, [
          h('p', { class: 'text-sm font-medium' }, row.original.name),
          h('p', { class: 'text-xs text-muted' }, row.original.$id.slice(0, 8))
        ])
      ])
    }
  },
  {
    accessorKey: 'email',
    header: 'Email'
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => h(resolveComponent('UBadge'), {
      color: row.original.status ? 'success' : 'error',
      variant: 'subtle',
      size: 'xs'
    }, () => row.original.status ? 'Active' : 'Blocked')
  },
  {
    id: 'plan',
    header: 'Plan',
    cell: ({ row }) => h(resolveComponent('UBadge'), {
      color: getPlanColor(row.original.subscriptionStatus),
      variant: 'subtle',
      size: 'xs'
    }, () => getPlanLabel(row.original))
  },
  {
    accessorKey: 'registration',
    header: 'Registered',
    cell: ({ row }) => h('span', { class: 'text-sm text-muted' }, formatDate(row.original.registration))
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => {
      const items = [
        [{
          label: 'Edit',
          icon: 'i-lucide-pencil',
          onSelect: () => openEditModal(row.original)
        },
        {
          label: row.original.status ? 'Deactivate' : 'Activate',
          icon: row.original.status ? 'i-lucide-user-x' : 'i-lucide-user-check',
          onSelect: () => handleToggleStatus(row.original)
        }],
        [{
          label: 'Delete',
          icon: 'i-lucide-trash-2',
          color: 'error' as const,
          onSelect: () => confirmDelete(row.original)
        }]
      ]
      return h(resolveComponent('UDropdownMenu'), {
        items,
        content: { align: 'end' }
      }, () => h(resolveComponent('UButton'), {
        icon: 'i-lucide-ellipsis-vertical',
        variant: 'ghost',
        color: 'neutral',
        size: 'xs'
      }))
    }
  }
]

// ─── Edit Modal ───────────────────────────────

const editModalOpen = ref(false)
const editingUser = ref<AdminUser | null>(null)
const editForm = ref({ name: '', email: '', isAdmin: false })
const editLoading = ref(false)

function openEditModal(user: AdminUser) {
  editingUser.value = user
  editForm.value = {
    name: user.name,
    email: user.email,
    isAdmin: user.labels.includes('admin')
  }
  editModalOpen.value = true
}

async function handleEdit() {
  if (!editingUser.value) return
  editLoading.value = true

  const data: { name?: string, email?: string, labels?: string[] } = {}

  if (editForm.value.name !== editingUser.value.name) {
    data.name = editForm.value.name
  }
  if (editForm.value.email !== editingUser.value.email) {
    data.email = editForm.value.email
  }

  const currentIsAdmin = editingUser.value.labels.includes('admin')
  if (editForm.value.isAdmin !== currentIsAdmin) {
    data.labels = editForm.value.isAdmin
      ? [...editingUser.value.labels.filter(l => l !== 'admin'), 'admin']
      : editingUser.value.labels.filter(l => l !== 'admin')
  }

  if (Object.keys(data).length > 0) {
    await updateUser(editingUser.value.$id, data)
  }

  editLoading.value = false
  editModalOpen.value = false
  editingUser.value = null
}

// ─── Status Toggle ────────────────────────────

async function handleToggleStatus(user: AdminUser) {
  await toggleUserStatus(user.$id, !user.status)
}

// ─── Delete Modal ─────────────────────────────

const deleteModalOpen = ref(false)
const userToDelete = ref<AdminUser | null>(null)

function confirmDelete(user: AdminUser) {
  userToDelete.value = user
  deleteModalOpen.value = true
}

async function handleDelete() {
  if (!userToDelete.value) return
  await deleteUser(userToDelete.value.$id)
  deleteModalOpen.value = false
  userToDelete.value = null
  rowSelection.value = {}
}

// ─── Bulk Delete ──────────────────────────────

const bulkDeleteModalOpen = ref(false)

async function handleBulkDelete() {
  const selectedIds = Object.entries(rowSelection.value)
    .filter(([, selected]) => selected)
    .map(([index]) => users.value[parseInt(index)]?.$id)
    .filter(Boolean) as string[]

  for (const id of selectedIds) {
    await deleteUser(id)
  }

  rowSelection.value = {}
  bulkDeleteModalOpen.value = false
}
</script>

<template>
  <div class="p-4 sm:p-6 space-y-4">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold">
          Users
        </h1>
        <p class="text-sm text-muted">
          {{ totalUsers }} registered users
        </p>
      </div>
    </div>

    <!-- Toolbar -->
    <div class="flex items-center gap-3">
      <UInput
        v-model="search"
        placeholder="Search users..."
        icon="i-lucide-search"
        class="max-w-sm"
      />

      <UButton
        v-if="selectedCount > 0"
        color="error"
        variant="outline"
        size="sm"
        :label="`Delete ${selectedCount} selected`"
        icon="i-lucide-trash-2"
        @click="bulkDeleteModalOpen = true"
      />
    </div>

    <!-- Table -->
    <UTable
      ref="table"
      v-model:row-selection="rowSelection"
      :data="users"
      :columns="columns"
      :loading="loading"
      class="w-full"
      @select="(_e: Event, row: { toggleSelected: (v: boolean) => void, getIsSelected: () => boolean }) => row.toggleSelected(!row.getIsSelected())"
    />

    <!-- Pagination -->
    <div
      v-if="totalUsers > pageSize"
      class="flex justify-center"
    >
      <UPagination
        v-model:page="page"
        :items-per-page="pageSize"
        :total="totalUsers"
      />
    </div>

    <!-- Edit Modal -->
    <UModal v-model:open="editModalOpen">
      <template #content>
        <div class="p-6 space-y-4">
          <h3 class="text-lg font-semibold">
            Edit User
          </h3>

          <div class="space-y-3">
            <div>
              <label class="text-sm font-medium text-muted">Name</label>
              <UInput
                v-model="editForm.name"
                class="mt-1"
              />
            </div>

            <div>
              <label class="text-sm font-medium text-muted">Email</label>
              <UInput
                v-model="editForm.email"
                type="email"
                class="mt-1"
              />
            </div>

            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium">
                  Admin Access
                </p>
                <p class="text-xs text-muted">
                  Grant admin panel access
                </p>
              </div>
              <USwitch v-model="editForm.isAdmin" />
            </div>
          </div>

          <div class="flex justify-end gap-2">
            <UButton
              variant="outline"
              color="neutral"
              label="Cancel"
              @click="editModalOpen = false"
            />
            <UButton
              label="Save"
              :loading="editLoading"
              @click="handleEdit"
            />
          </div>
        </div>
      </template>
    </UModal>

    <!-- Delete Confirmation Modal -->
    <UModal v-model:open="deleteModalOpen">
      <template #content>
        <div class="p-6 space-y-4">
          <h3 class="text-lg font-semibold">
            Delete User
          </h3>
          <p class="text-sm text-muted">
            Are you sure you want to delete "{{ userToDelete?.name }}"?
            This will permanently remove the user and all their data.
          </p>
          <div class="flex justify-end gap-2">
            <UButton
              variant="outline"
              color="neutral"
              label="Cancel"
              @click="deleteModalOpen = false"
            />
            <UButton
              color="error"
              label="Delete"
              @click="handleDelete"
            />
          </div>
        </div>
      </template>
    </UModal>

    <!-- Bulk Delete Confirmation Modal -->
    <UModal v-model:open="bulkDeleteModalOpen">
      <template #content>
        <div class="p-6 space-y-4">
          <h3 class="text-lg font-semibold">
            Delete {{ selectedCount }} Users
          </h3>
          <p class="text-sm text-muted">
            Are you sure you want to delete {{ selectedCount }} selected users?
            This action cannot be undone.
          </p>
          <div class="flex justify-end gap-2">
            <UButton
              variant="outline"
              color="neutral"
              label="Cancel"
              @click="bulkDeleteModalOpen = false"
            />
            <UButton
              color="error"
              label="Delete All"
              @click="handleBulkDelete"
            />
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>
