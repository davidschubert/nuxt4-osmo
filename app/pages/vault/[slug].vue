<script setup lang="ts">
import type { ResourceCode } from '~/types'

definePageMeta({
  layout: 'vault',
  middleware: 'auth'
})

const route = useRoute()
const { getResourceBySlug, getRelatedResources, getResourceCode, loading } = useResources()
const { isSubscribed } = useAuth()
const { categoriesWithCount } = useCategories()

const slug = computed(() => route.params.slug as string)

const resource = computed(() => getResourceBySlug(slug.value))

const category = computed(() => {
  if (!resource.value) return undefined
  return categoriesWithCount.value.find(c => c.$id === resource.value!.category)
})

const relatedResources = computed(() => {
  if (!resource.value) return []
  return getRelatedResources(resource.value)
})

const isLocked = computed(() => {
  if (!resource.value) return false
  return !resource.value.isFree && !isSubscribed.value
})

// Load code separately from the resource-code collection
const resourceCode = ref<ResourceCode | null>(null)
const codeLoading = ref(false)

watch(resource, async (res) => {
  if (!res) {
    resourceCode.value = null
    return
  }
  codeLoading.value = true
  resourceCode.value = await getResourceCode(res.$id)
  codeLoading.value = false
}, { immediate: true })

// Breadcrumb
const breadcrumbItems = computed(() => {
  const items = [
    { label: 'The Vault', to: '/vault' }
  ]
  if (category.value) {
    items.push({
      label: category.value.name,
      to: `/vault?category=${category.value.slug}`
    })
  }
  if (resource.value) {
    items.push({
      label: resource.value.title,
      to: `/vault/${resource.value.slug}`
    })
  }
  return items
})

// SEO
const pageTitle = computed(() => resource.value ? `${resource.value.title} - The Vault` : 'Resource - The Vault')
const pageDescription = computed(() => resource.value?.description ?? '')

useSeoMeta({
  title: pageTitle,
  description: pageDescription
})
</script>

<template>
  <div class="p-4 sm:p-6">
    <!-- Loading state -->
    <div
      v-if="loading"
      class="space-y-6"
    >
      <USkeleton class="h-6 w-64" />
      <USkeleton class="h-10 w-96" />
      <USkeleton class="aspect-[16/9] w-full rounded-xl" />
    </div>

    <!-- Not found -->
    <div
      v-else-if="!resource"
      class="flex flex-col items-center justify-center py-20 text-center"
    >
      <UIcon
        name="i-lucide-file-question"
        class="size-12 text-muted mb-4"
      />
      <h2 class="text-xl font-semibold mb-2">
        Resource not found
      </h2>
      <p class="text-sm text-muted mb-4">
        The resource you're looking for doesn't exist or has been removed.
      </p>
      <UButton
        to="/vault"
        label="Back to Vault"
        variant="outline"
        color="neutral"
      />
    </div>

    <!-- Resource content -->
    <div v-else>
      <!-- Breadcrumb -->
      <UBreadcrumb
        :items="breadcrumbItems"
        class="mb-4"
      />

      <!-- Main layout: content + sidebar -->
      <div class="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8">
        <!-- Left: main content -->
        <div class="space-y-8 min-w-0">
          <!-- Title + actions -->
          <div class="flex items-start justify-between gap-4">
            <h1 class="text-2xl sm:text-3xl font-bold">
              {{ resource.title }}
            </h1>
            <div class="flex items-center gap-1 shrink-0">
              <UBadge
                v-if="resource.isNew"
                color="primary"
                variant="solid"
                size="sm"
              >
                New
              </UBadge>
              <UBadge
                v-if="!resource.isFree"
                color="warning"
                variant="subtle"
                size="sm"
              >
                Pro
              </UBadge>
              <UButton
                icon="i-lucide-bookmark"
                variant="ghost"
                color="neutral"
                size="sm"
                aria-label="Bookmark"
              />
            </div>
          </div>

          <!-- Code loading state -->
          <div
            v-if="codeLoading"
            class="space-y-4"
          >
            <USkeleton class="aspect-[16/9] w-full rounded-xl" />
            <USkeleton class="h-6 w-48" />
            <USkeleton class="h-40 w-full rounded-lg" />
          </div>

          <!-- Premium lock or content -->
          <template v-else-if="isLocked">
            <!-- Show blurred lock overlay (no code shown) -->
            <ResourceLock :resource-title="resource.title" />
          </template>

          <template v-else-if="resourceCode">
            <!-- Preview -->
            <ResourcePreview
              :code="resourceCode"
              :external-scripts="resource.externalScripts"
            />

            <!-- Documentation section -->
            <div class="space-y-4">
              <h2 class="text-xl font-bold">
                Documentation
              </h2>

              <USeparator />

              <!-- Code steps -->
              <ResourceCode
                :code="resourceCode"
                :external-scripts="resource.externalScripts"
              />
            </div>

            <!-- Implementation notes -->
            <div
              v-if="resourceCode.implementationNotes"
              class="space-y-4"
            >
              <h2 class="text-xl font-bold">
                Implementation
              </h2>
              <div class="prose prose-sm prose-invert max-w-none">
                <div v-html="renderMarkdown(resourceCode.implementationNotes)" />
              </div>
            </div>
          </template>

          <!-- Related resources -->
          <USeparator v-if="relatedResources.length > 0" />
          <ResourceRelated :resources="relatedResources" />
        </div>

        <!-- Right: metadata sidebar -->
        <aside class="hidden lg:block">
          <div class="sticky top-20">
            <ResourceMeta :resource="resource" />
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>
