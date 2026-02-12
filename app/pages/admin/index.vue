<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

useSeoMeta({
  title: 'Admin Dashboard'
})

const { stats } = useAdmin()
const { categoriesWithCount } = useCategories()
</script>

<template>
  <div class="p-4 sm:p-6 space-y-6">
    <h1 class="text-2xl font-bold">
      Dashboard
    </h1>

    <!-- Stats cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <UCard>
        <div class="flex items-center gap-3">
          <UIcon
            name="i-lucide-file-code"
            class="size-8 text-primary"
          />
          <div>
            <p class="text-2xl font-bold">
              {{ stats.resourceCount }}
            </p>
            <p class="text-sm text-muted">
              Total Resources
            </p>
          </div>
        </div>
      </UCard>

      <UCard>
        <div class="flex items-center gap-3">
          <UIcon
            name="i-lucide-folder"
            class="size-8 text-primary"
          />
          <div>
            <p class="text-2xl font-bold">
              {{ stats.categoryCount }}
            </p>
            <p class="text-sm text-muted">
              Categories
            </p>
          </div>
        </div>
      </UCard>

      <UCard>
        <div class="flex items-center gap-3">
          <UIcon
            name="i-lucide-unlock"
            class="size-8 text-green-500"
          />
          <div>
            <p class="text-2xl font-bold">
              {{ stats.freeResourceCount }}
            </p>
            <p class="text-sm text-muted">
              Free Resources
            </p>
          </div>
        </div>
      </UCard>

      <UCard>
        <div class="flex items-center gap-3">
          <UIcon
            name="i-lucide-lock"
            class="size-8 text-yellow-500"
          />
          <div>
            <p class="text-2xl font-bold">
              {{ stats.premiumResourceCount }}
            </p>
            <p class="text-sm text-muted">
              Premium Resources
            </p>
          </div>
        </div>
      </UCard>
    </div>

    <!-- Categories breakdown -->
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h2 class="font-semibold">
            Resources by Category
          </h2>
          <UButton
            to="/admin/categories"
            variant="ghost"
            color="neutral"
            size="xs"
            label="Manage"
            trailing-icon="i-lucide-arrow-right"
          />
        </div>
      </template>

      <div class="space-y-3">
        <div
          v-for="cat in categoriesWithCount"
          :key="cat.$id"
          class="flex items-center justify-between"
        >
          <div class="flex items-center gap-2">
            <UIcon
              :name="cat.icon"
              class="size-4 text-muted"
            />
            <span class="text-sm">{{ cat.name }}</span>
          </div>
          <UBadge
            :label="String(cat.count)"
            color="neutral"
            variant="subtle"
            size="xs"
          />
        </div>
      </div>
    </UCard>

    <!-- Quick actions -->
    <UCard>
      <template #header>
        <h2 class="font-semibold">
          Quick Actions
        </h2>
      </template>

      <div class="flex flex-wrap gap-2">
        <UButton
          to="/admin/resources/new"
          icon="i-lucide-plus"
          label="New Resource"
        />
        <UButton
          to="/admin/categories"
          icon="i-lucide-folder-plus"
          label="Manage Categories"
          variant="outline"
          color="neutral"
        />
        <UButton
          to="/vault"
          icon="i-lucide-eye"
          label="View Vault"
          variant="outline"
          color="neutral"
        />
      </div>
    </UCard>
  </div>
</template>
