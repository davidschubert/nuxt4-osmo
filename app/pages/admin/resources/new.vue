<script setup lang="ts">
import type { Resource, ResourceCode } from '~/types'

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

useSeoMeta({
  title: 'New Resource'
})

const { categories } = useCategories()
const { createResource, createResourceCode } = useAdmin()

const loading = ref(false)

async function handleSubmit(data: {
  resource: Partial<Resource>
  code: Partial<ResourceCode>
}) {
  loading.value = true
  try {
    const resource = await createResource(data.resource as Omit<Resource, '$id' | '$createdAt' | '$updatedAt' | 'thumbnailUrl'>)
    if (resource && (data.code.htmlCode || data.code.cssCode || data.code.jsCode)) {
      await createResourceCode({
        resourceId: resource.$id,
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
    <h1 class="text-2xl font-bold mb-6">
      New Resource
    </h1>
    <AdminResourceForm
      :categories="categories"
      :loading="loading"
      @submit="handleSubmit"
    />
  </div>
</template>
