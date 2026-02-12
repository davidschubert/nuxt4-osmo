<script setup lang="ts">
import type { Resource } from '~/types'

const props = defineProps<{
  resource: Resource
}>()

const { categoriesWithCount } = useCategories()

const category = computed(() => {
  return categoriesWithCount.value.find(c => c.$id === props.resource.category)
})

const lastUpdated = computed(() => {
  return new Date(props.resource.$updatedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})
</script>

<template>
  <div class="space-y-6">
    <!-- Resource details -->
    <div class="space-y-3">
      <h3 class="text-sm font-semibold">
        Resource details
      </h3>

      <div class="space-y-2 text-sm">
        <div class="flex items-center justify-between">
          <span class="text-muted">Last updated</span>
          <span>{{ lastUpdated }}</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-muted">Category</span>
          <NuxtLink
            v-if="category"
            :to="`/vault?category=${category.slug}`"
            class="text-primary hover:underline"
          >
            {{ category.name }}
          </NuxtLink>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-muted">Need help?</span>
          <UButton
            label="Join Slack"
            icon="i-simple-icons-slack"
            variant="link"
            color="primary"
            size="xs"
            to="#"
          />
        </div>
      </div>
    </div>

    <USeparator />

    <!-- Tags -->
    <div
      v-if="resource.tags.length > 0"
      class="space-y-3"
    >
      <div class="flex flex-wrap gap-1.5">
        <UBadge
          v-for="tag in resource.tags"
          :key="tag"
          color="neutral"
          variant="subtle"
          size="sm"
        >
          {{ tag }}
        </UBadge>
      </div>
    </div>

    <USeparator />

    <!-- Original source -->
    <div v-if="resource.originalSourceUrl">
      <UButton
        :to="resource.originalSourceUrl"
        target="_blank"
        label="Original source"
        icon="i-lucide-external-link"
        variant="outline"
        color="neutral"
        block
      />
    </div>

    <!-- Author -->
    <div
      v-if="resource.authorName"
      class="flex items-center gap-2"
    >
      <UAvatar
        size="sm"
        :text="resource.authorName.charAt(0)"
        :src="resource.authorAvatarUrl"
      />
      <span class="text-sm">{{ resource.authorName }}</span>
    </div>
  </div>
</template>
