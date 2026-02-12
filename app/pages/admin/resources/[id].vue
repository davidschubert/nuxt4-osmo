<script setup lang="ts">
import type { Resource, ResourceCode } from '~/types'

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const route = useRoute()
const resourceId = computed(() => route.params.id as string)

const { resources } = useResources()
const { getResourceCode } = useResources()
const { categories } = useCategories()
const { updateResource, updateResourceCode, createResourceCode } = useAdmin()

const resource = computed(() =>
  resources.value.find(r => r.$id === resourceId.value)
)

const resourceCode = ref<ResourceCode | null>(null)
const codeLoading = ref(false)

// Load resource code when resource is available
watch(resource, async (res) => {
  if (!res) return
  codeLoading.value = true
  resourceCode.value = await getResourceCode(res.$id)
  codeLoading.value = false
}, { immediate: true })

useSeoMeta({
  title: computed(() => resource.value ? `Edit: ${resource.value.title}` : 'Edit Resource')
})

const loading = ref(false)

async function handleSubmit(data: {
  resource: Partial<Resource>
  code: Partial<ResourceCode>
}) {
  if (!resource.value) return
  loading.value = true
  try {
    await updateResource(resource.value.$id, data.resource)
    if (resourceCode.value) {
      await updateResourceCode(resourceCode.value.$id, data.code)
    } else if (data.code.htmlCode || data.code.cssCode || data.code.jsCode) {
      await createResourceCode({
        resourceId: resource.value.$id,
        htmlCode: data.code.htmlCode ?? '',
        cssCode: data.code.cssCode ?? '',
        jsCode: data.code.jsCode ?? '',
        implementationNotes: data.code.implementationNotes
      } as Omit<ResourceCode, '$id' | '$createdAt' | '$updatedAt'>)
    }
    await navigateTo('/admin/resources')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="p-4 sm:p-6">
    <div
      v-if="!resource"
      class="text-center py-20"
    >
      <p class="text-muted">
        Resource not found.
      </p>
      <UButton
        to="/admin/resources"
        variant="outline"
        color="neutral"
        label="Back to Resources"
        class="mt-4"
      />
    </div>
    <template v-else>
      <h1 class="text-2xl font-bold mb-6">
        Edit: {{ resource.title }}
      </h1>
      <AdminResourceForm
        :resource="resource"
        :resource-code="resourceCode"
        :categories="categories"
        :loading="loading || codeLoading"
        @submit="handleSubmit"
      />
    </template>
  </div>
</template>
