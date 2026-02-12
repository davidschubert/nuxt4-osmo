<script setup lang="ts">
import type { Resource } from '~/types'

defineProps<{
  resources: Resource[]
  loading?: boolean
}>()
</script>

<template>
  <div>
    <!-- Loading skeleton -->
    <div
      v-if="loading"
      class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
    >
      <div
        v-for="i in 10"
        :key="i"
        class="space-y-2"
      >
        <USkeleton class="aspect-[4/3] w-full rounded-xl" />
        <USkeleton class="h-4 w-3/4 rounded" />
      </div>
    </div>

    <!-- Empty state -->
    <div
      v-else-if="resources.length === 0"
      class="flex flex-col items-center justify-center py-20 text-center"
    >
      <UIcon
        name="i-lucide-search-x"
        class="size-12 text-muted mb-4"
      />
      <h3 class="text-lg font-semibold mb-1">
        No resources found
      </h3>
      <p class="text-sm text-muted max-w-sm">
        Try adjusting your search or filter to find what you're looking for.
      </p>
    </div>

    <!-- Resource grid -->
    <div
      v-else
      class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
    >
      <VaultCard
        v-for="resource in resources"
        :key="resource.$id"
        :resource="resource"
      />
    </div>
  </div>
</template>
