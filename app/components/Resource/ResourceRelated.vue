<script setup lang="ts">
import type { Resource } from '~/types'

defineProps<{
  resources: Resource[]
}>()
</script>

<template>
  <div
    v-if="resources.length > 0"
    class="space-y-4"
  >
    <h2 class="text-xl font-bold">
      Related resources
    </h2>
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <VaultCard
        v-for="resource in resources"
        :key="resource.$id"
        :resource="resource"
      />
    </div>
  </div>
</template>
