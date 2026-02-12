<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import type { Resource } from '~/types'

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

useSeoMeta({
  title: 'Manage Resources'
})

const { resources } = useResources()
const { categoriesWithCount } = useCategories()
const { deleteResource } = useAdmin()

// Search filter
const search = ref('')

const filteredResources = computed(() => {
  if (!search.value.trim()) return resources.value
  const q = search.value.toLowerCase()
  return resources.value.filter(r =>
    r.title.toLowerCase().includes(q)
    || r.slug.toLowerCase().includes(q)
  )
})

// Table columns
const columns: TableColumn<Resource>[] = [
  {
    accessorKey: 'title',
    header: 'Title'
  },
  {
    accessorKey: 'slug',
    header: 'Slug'
  },
  {
    accessorKey: 'category',
    header: 'Category',
    cell: ({ row }) => {
      const cat = categoriesWithCount.value.find(
        c => c.$id === row.original.category
      )
      return cat?.name ?? row.original.category
    }
  },
  {
    accessorKey: 'isFree',
    header: 'Access',
    cell: ({ row }) => {
      return h(resolveComponent('UBadge'), {
        color: row.original.isFree ? 'success' : 'warning',
        variant: 'subtle'
      }, () => row.original.isFree ? 'Free' : 'Pro')
    }
  },
  {
    accessorKey: 'isNew',
    header: 'New',
    cell: ({ row }) => {
      return row.original.isNew
        ? h(resolveComponent('UBadge'), { color: 'primary', variant: 'solid', size: 'xs' }, () => 'New')
        : ''
    }
  },
  {
    accessorKey: 'sortOrder',
    header: 'Order'
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => {
      return h('div', { class: 'flex items-center gap-1' }, [
        h(resolveComponent('UButton'), {
          icon: 'i-lucide-pencil',
          variant: 'ghost',
          color: 'neutral',
          size: 'xs',
          to: `/admin/resources/${row.original.$id}`
        }),
        h(resolveComponent('UButton'), {
          icon: 'i-lucide-trash-2',
          variant: 'ghost',
          color: 'error',
          size: 'xs',
          onClick: () => confirmDelete(row.original)
        })
      ])
    }
  }
]

// Delete confirmation
const deleteModalOpen = ref(false)
const resourceToDelete = ref<Resource | null>(null)

function confirmDelete(resource: Resource) {
  resourceToDelete.value = resource
  deleteModalOpen.value = true
}

async function handleDelete() {
  if (!resourceToDelete.value) return
  await deleteResource(resourceToDelete.value.$id)
  deleteModalOpen.value = false
  resourceToDelete.value = null
}
</script>

<template>
  <div class="p-4 sm:p-6 space-y-4">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">
        Resources
      </h1>
      <UButton
        to="/admin/resources/new"
        icon="i-lucide-plus"
        label="New Resource"
      />
    </div>

    <UInput
      v-model="search"
      placeholder="Search resources..."
      icon="i-lucide-search"
      class="max-w-sm"
    />

    <UTable
      :data="filteredResources"
      :columns="columns"
    />

    <!-- Delete confirmation modal -->
    <UModal v-model:open="deleteModalOpen">
      <template #content>
        <div class="p-6 space-y-4">
          <h3 class="text-lg font-semibold">
            Delete Resource
          </h3>
          <p class="text-sm text-muted">
            Are you sure you want to delete "{{ resourceToDelete?.title }}"?
            This action cannot be undone.
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
  </div>
</template>
