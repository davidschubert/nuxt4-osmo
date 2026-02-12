<script setup lang="ts">
import type { Resource, ResourceCode, Category } from '~/types'
import type { FormSubmitEvent } from '#ui/types'

const props = defineProps<{
  resource?: Resource
  resourceCode?: ResourceCode | null
  categories: Category[]
  loading?: boolean
}>()

const emit = defineEmits<{
  submit: [data: { resource: Partial<Resource>, code: Partial<ResourceCode> }]
}>()

const isEditing = computed(() => !!props.resource)

// Form state
const state = reactive({
  title: props.resource?.title ?? '',
  slug: props.resource?.slug ?? '',
  description: props.resource?.description ?? '',
  category: props.resource?.category ?? '',
  tags: props.resource?.tags?.join(', ') ?? '',
  isFree: props.resource?.isFree ?? true,
  isNew: props.resource?.isNew ?? false,
  sortOrder: props.resource?.sortOrder ?? 0,
  externalScripts: props.resource?.externalScripts?.join('\n') ?? '',
  previewUrl: props.resource?.previewUrl ?? '',
  originalSourceUrl: props.resource?.originalSourceUrl ?? '',
  authorName: props.resource?.authorName ?? '',
  authorAvatarUrl: props.resource?.authorAvatarUrl ?? '',
  // Code fields
  htmlCode: props.resourceCode?.htmlCode ?? '',
  cssCode: props.resourceCode?.cssCode ?? '',
  jsCode: props.resourceCode?.jsCode ?? '',
  implementationNotes: props.resourceCode?.implementationNotes ?? ''
})

// Auto-generate slug from title (only for new resources)
watch(() => state.title, (title) => {
  if (!isEditing.value) {
    state.slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  }
})

// Category options for select
const categoryOptions = computed(() =>
  props.categories.map(c => ({ label: c.name, value: c.$id }))
)

// Validation
function validate(formState: typeof state) {
  const errors: { name: string, message: string }[] = []
  if (!formState.title) errors.push({ name: 'title', message: 'Title is required' })
  if (!formState.slug) errors.push({ name: 'slug', message: 'Slug is required' })
  if (!formState.category) errors.push({ name: 'category', message: 'Category is required' })
  return errors
}

function onSubmit(event: FormSubmitEvent<typeof state>) {
  const tags = String(event.data.tags)
    .split(',')
    .map(t => t.trim())
    .filter(Boolean)
  const externalScripts = String(event.data.externalScripts)
    .split('\n')
    .map(s => s.trim())
    .filter(Boolean)

  emit('submit', {
    resource: {
      title: event.data.title,
      slug: event.data.slug,
      description: event.data.description,
      category: event.data.category,
      tags,
      isFree: event.data.isFree,
      isNew: event.data.isNew,
      sortOrder: Number(event.data.sortOrder),
      externalScripts: externalScripts.length ? externalScripts : undefined,
      previewUrl: event.data.previewUrl || undefined,
      originalSourceUrl: event.data.originalSourceUrl || undefined,
      authorName: event.data.authorName || undefined,
      authorAvatarUrl: event.data.authorAvatarUrl || undefined,
      thumbnailFileId: props.resource?.thumbnailFileId ?? ''
    },
    code: {
      htmlCode: event.data.htmlCode,
      cssCode: event.data.cssCode,
      jsCode: event.data.jsCode,
      implementationNotes: event.data.implementationNotes || undefined
    }
  })
}
</script>

<template>
  <UForm
    :validate="validate"
    :state="state"
    class="space-y-6"
    @submit="onSubmit"
  >
    <!-- Resource Metadata -->
    <UCard>
      <template #header>
        <h2 class="font-semibold">
          Resource Details
        </h2>
      </template>

      <div class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UFormField
            label="Title"
            name="title"
            required
          >
            <UInput
              v-model="state.title"
              placeholder="Elastic Pulse Button"
            />
          </UFormField>
          <UFormField
            label="Slug"
            name="slug"
            required
          >
            <UInput
              v-model="state.slug"
              placeholder="elastic-pulse-button"
            />
          </UFormField>
        </div>

        <UFormField
          label="Description"
          name="description"
        >
          <UTextarea
            v-model="state.description"
            :rows="3"
            placeholder="A brief description of this resource..."
          />
        </UFormField>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <UFormField
            label="Category"
            name="category"
            required
          >
            <USelect
              v-model="state.category"
              :items="categoryOptions"
              placeholder="Select category..."
            />
          </UFormField>
          <UFormField
            label="Sort Order"
            name="sortOrder"
          >
            <UInput
              v-model="state.sortOrder"
              type="number"
            />
          </UFormField>
          <div class="flex items-end gap-6 pb-1">
            <UFormField name="isFree">
              <USwitch
                v-model="state.isFree"
                label="Free"
              />
            </UFormField>
            <UFormField name="isNew">
              <USwitch
                v-model="state.isNew"
                label="New"
              />
            </UFormField>
          </div>
        </div>

        <UFormField
          label="Tags"
          name="tags"
          hint="Comma separated"
        >
          <UInput
            v-model="state.tags"
            placeholder="Button, Hover, Animation"
          />
        </UFormField>
      </div>
    </UCard>

    <!-- Code Section -->
    <UCard>
      <template #header>
        <h2 class="font-semibold">
          Code
        </h2>
      </template>

      <div class="space-y-4">
        <UFormField
          label="HTML"
          name="htmlCode"
        >
          <UTextarea
            v-model="state.htmlCode"
            :rows="8"
            class="font-mono text-sm"
            placeholder="<div class='container'>...</div>"
          />
        </UFormField>
        <UFormField
          label="CSS"
          name="cssCode"
        >
          <UTextarea
            v-model="state.cssCode"
            :rows="8"
            class="font-mono text-sm"
            placeholder=".container { ... }"
          />
        </UFormField>
        <UFormField
          label="JavaScript"
          name="jsCode"
        >
          <UTextarea
            v-model="state.jsCode"
            :rows="8"
            class="font-mono text-sm"
            placeholder="document.querySelector('.container')..."
          />
        </UFormField>
        <UFormField
          label="Implementation Notes (Markdown)"
          name="implementationNotes"
        >
          <UTextarea
            v-model="state.implementationNotes"
            :rows="6"
            placeholder="## Usage\nDescribe how to use this resource..."
          />
        </UFormField>
      </div>
    </UCard>

    <!-- Optional Fields -->
    <UCard>
      <template #header>
        <h2 class="font-semibold">
          Optional
        </h2>
      </template>

      <div class="space-y-4">
        <UFormField
          label="External Scripts"
          name="externalScripts"
          hint="One URL per line"
        >
          <UTextarea
            v-model="state.externalScripts"
            :rows="3"
            placeholder="https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js"
          />
        </UFormField>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UFormField
            label="Author Name"
            name="authorName"
          >
            <UInput
              v-model="state.authorName"
              placeholder="John Doe"
            />
          </UFormField>
          <UFormField
            label="Original Source URL"
            name="originalSourceUrl"
          >
            <UInput
              v-model="state.originalSourceUrl"
              placeholder="https://codepen.io/..."
            />
          </UFormField>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UFormField
            label="Preview URL"
            name="previewUrl"
          >
            <UInput
              v-model="state.previewUrl"
              placeholder="https://preview.example.com/..."
            />
          </UFormField>
          <UFormField
            label="Author Avatar URL"
            name="authorAvatarUrl"
          >
            <UInput
              v-model="state.authorAvatarUrl"
              placeholder="https://avatars.githubusercontent.com/..."
            />
          </UFormField>
        </div>
      </div>
    </UCard>

    <!-- Submit -->
    <div class="flex items-center gap-2">
      <UButton
        type="submit"
        :loading="loading"
      >
        {{ isEditing ? 'Update Resource' : 'Create Resource' }}
      </UButton>
      <UButton
        to="/admin/resources"
        variant="outline"
        color="neutral"
        label="Cancel"
      />
    </div>
  </UForm>
</template>
