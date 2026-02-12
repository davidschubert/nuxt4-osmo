<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import type { Category, CategoryWithCount } from '~/types'

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

useSeoMeta({
  title: 'Manage Categories'
})

const { categoriesWithCount } = useCategories()
const { createCategory, updateCategory, deleteCategory } = useAdmin()

// Table columns
const columns: TableColumn<CategoryWithCount>[] = [
  {
    accessorKey: 'name',
    header: 'Name'
  },
  {
    accessorKey: 'slug',
    header: 'Slug'
  },
  {
    accessorKey: 'icon',
    header: 'Icon',
    cell: ({ row }) => h(resolveComponent('UIcon'), {
      name: row.original.icon,
      class: 'size-5'
    })
  },
  {
    accessorKey: 'count',
    header: 'Resources'
  },
  {
    accessorKey: 'sortOrder',
    header: 'Order'
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => h('div', { class: 'flex gap-1' }, [
      h(resolveComponent('UButton'), {
        icon: 'i-lucide-pencil',
        variant: 'ghost',
        color: 'neutral',
        size: 'xs',
        onClick: () => openEditModal(row.original)
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
]

// Edit/Create modal
const modalOpen = ref(false)
const editingCategory = ref<Category | null>(null)
const formState = reactive({
  name: '',
  slug: '',
  icon: '',
  sortOrder: 0
})

function openCreateModal() {
  editingCategory.value = null
  Object.assign(formState, { name: '', slug: '', icon: '', sortOrder: 0 })
  modalOpen.value = true
}

function openEditModal(category: Category) {
  editingCategory.value = category
  Object.assign(formState, {
    name: category.name,
    slug: category.slug,
    icon: category.icon,
    sortOrder: category.sortOrder
  })
  modalOpen.value = true
}

// Auto-generate slug from name (only for new categories)
watch(() => formState.name, (name) => {
  if (!editingCategory.value) {
    formState.slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  }
})

const saving = ref(false)

async function handleSave() {
  saving.value = true
  try {
    if (editingCategory.value) {
      await updateCategory(editingCategory.value.$id, { ...formState })
    } else {
      await createCategory({ ...formState } as Omit<Category, '$id'>)
    }
    modalOpen.value = false
  } finally {
    saving.value = false
  }
}

// Delete confirmation
const deleteModalOpen = ref(false)
const categoryToDelete = ref<Category | null>(null)

function confirmDelete(category: Category) {
  categoryToDelete.value = category
  deleteModalOpen.value = true
}

async function handleDelete() {
  if (!categoryToDelete.value) return
  await deleteCategory(categoryToDelete.value.$id)
  deleteModalOpen.value = false
  categoryToDelete.value = null
}
</script>

<template>
  <div class="p-4 sm:p-6 space-y-4">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">
        Categories
      </h1>
      <UButton
        icon="i-lucide-plus"
        label="New Category"
        @click="openCreateModal"
      />
    </div>

    <UTable
      :data="categoriesWithCount"
      :columns="columns"
    />

    <!-- Edit/Create Modal -->
    <UModal v-model:open="modalOpen">
      <template #content>
        <div class="p-6 space-y-4">
          <h3 class="text-lg font-semibold">
            {{ editingCategory ? 'Edit Category' : 'New Category' }}
          </h3>
          <UForm
            :state="formState"
            class="space-y-4"
            @submit="handleSave"
          >
            <UFormField
              label="Name"
              name="name"
            >
              <UInput v-model="formState.name" />
            </UFormField>
            <UFormField
              label="Slug"
              name="slug"
            >
              <UInput v-model="formState.slug" />
            </UFormField>
            <UFormField
              label="Icon"
              name="icon"
              hint="e.g. i-lucide-sparkles"
            >
              <div class="flex items-center gap-2">
                <UInput
                  v-model="formState.icon"
                  class="flex-1"
                />
                <UIcon
                  v-if="formState.icon"
                  :name="formState.icon"
                  class="size-5 text-muted"
                />
              </div>
            </UFormField>
            <UFormField
              label="Sort Order"
              name="sortOrder"
            >
              <UInput
                v-model="formState.sortOrder"
                type="number"
              />
            </UFormField>
            <div class="flex justify-end gap-2">
              <UButton
                variant="outline"
                color="neutral"
                label="Cancel"
                @click="modalOpen = false"
              />
              <UButton
                type="submit"
                :loading="saving"
                :label="editingCategory ? 'Update' : 'Create'"
              />
            </div>
          </UForm>
        </div>
      </template>
    </UModal>

    <!-- Delete confirmation modal -->
    <UModal v-model:open="deleteModalOpen">
      <template #content>
        <div class="p-6 space-y-4">
          <h3 class="text-lg font-semibold">
            Delete Category
          </h3>
          <p class="text-sm text-muted">
            Delete "{{ categoryToDelete?.name }}"? Resources in this category will become uncategorized.
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
