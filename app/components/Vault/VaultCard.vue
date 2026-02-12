<script setup lang="ts">
import type { Resource } from '~/types'

const props = defineProps<{
  resource: Resource
}>()

// Generate a deterministic color based on category
const thumbnailColors: Record<string, string> = {
  'cat-buttons': 'bg-rose-900/40',
  'cat-utilities': 'bg-stone-800',
  'cat-scroll': 'bg-teal-900/40',
  'cat-sliders': 'bg-amber-900/40',
  'cat-video': 'bg-slate-800',
  'cat-cursor': 'bg-violet-900/40',
  'cat-text': 'bg-cyan-900/40',
  'cat-gimmicks': 'bg-emerald-900/40',
  'cat-navigation': 'bg-indigo-900/40',
  'cat-dropdowns': 'bg-orange-900/40'
}

const bgColor = computed(() => thumbnailColors[props.resource.category] ?? 'bg-muted')

const { isSubscribed } = useAuth()

const isLocked = computed(() => !props.resource.isFree && !isSubscribed.value)
</script>

<template>
  <NuxtLink
    :to="`/vault/${resource.slug}`"
    class="group block"
  >
    <div class="rounded-xl overflow-hidden border border-default/50 transition-all duration-200 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
      <!-- Thumbnail area -->
      <div
        class="relative aspect-[4/3] flex items-center justify-center overflow-hidden"
        :class="bgColor"
      >
        <!-- Preview content placeholder -->
        <p class="text-xs text-white/50 font-mono px-4 text-center line-clamp-3">
          {{ resource.title }}
        </p>

        <!-- New badge -->
        <UBadge
          v-if="resource.isNew"
          color="primary"
          variant="solid"
          size="xs"
          class="absolute top-2 left-2"
        >
          New
        </UBadge>

        <!-- Lock overlay for premium -->
        <div
          v-if="isLocked"
          class="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center"
        >
          <UIcon
            name="i-lucide-lock"
            class="size-6 text-white/70"
          />
        </div>

        <!-- Hover overlay -->
        <div class="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      <!-- Card footer / title -->
      <div class="px-3 py-2.5">
        <p class="text-sm font-medium truncate">
          {{ resource.title }}
        </p>
      </div>
    </div>
  </NuxtLink>
</template>
