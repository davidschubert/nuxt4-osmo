<script setup lang="ts">
definePageMeta({
  layout: 'vault',
  middleware: 'auth'
})

useSeoMeta({
  title: 'The Vault - Browse Resources'
})

const route = useRoute()
const { user } = useAuth()
const { filteredResources, totalResourceCount, loading } = useResources()
const { searchQuery } = useSearch()
const vaultStore = useVaultStore()
const { refreshStatus } = useSubscription()

// Handle post-checkout redirect: refresh subscription status
onMounted(async () => {
  if (route.query.checkout === 'success') {
    await refreshStatus()
    navigateTo('/vault', { replace: true })
  }
})

// Sync category from URL query params
watch(() => route.query.category, (category) => {
  vaultStore.setActiveCategory(category as string || null)
}, { immediate: true })

const greeting = computed(() => {
  if (!user.value) return 'Hello'
  const firstName = user.value.displayName.split(' ')[0]
  return `Hello ${firstName}`
})

// Active category data for breadcrumb
const activeCategory = computed(() => vaultStore.activeCategoryData)

// Breadcrumb items
const breadcrumbItems = computed(() => {
  const items = [{ label: 'The Vault', to: '/vault' }]
  if (activeCategory.value) {
    items.push({ label: activeCategory.value.name, to: `/vault?category=${activeCategory.value.slug}` })
  }
  return items
})

// Clear category filter
function clearCategory() {
  navigateTo('/vault')
}
</script>

<template>
  <div>
    <!-- Category view: breadcrumb + title -->
    <div v-if="activeCategory">
      <UBreadcrumb
        :items="breadcrumbItems"
        class="mb-4"
      />
      <div class="flex items-baseline gap-2 mb-6">
        <h1 class="text-3xl md:text-4xl font-serif">
          {{ activeCategory.name }}
        </h1>
        <sup class="text-sm text-muted font-normal">{{ activeCategory.count }}</sup>
      </div>
    </div>

    <!-- Main view: greeting + search -->
    <div
      v-else
      class="text-center mb-8"
    >
      <p class="text-sm text-muted mb-2">
        {{ greeting }} <span class="inline-block">👋</span>
      </p>
      <h1 class="text-4xl md:text-5xl font-serif mb-6">
        Welcome to<br>the Vault
      </h1>

      <!-- Search bar -->
      <div class="max-w-md mx-auto mb-2">
        <UInput
          v-model="searchQuery"
          :placeholder="`Search ${totalResourceCount} resources`"
          icon="i-lucide-search"
          size="lg"
          :ui="{
            root: 'w-full'
          }"
        >
          <template
            v-if="searchQuery"
            #trailing
          >
            <UButton
              icon="i-lucide-x"
              variant="ghost"
              color="neutral"
              size="xs"
              @click="searchQuery = ''"
            />
          </template>
        </UInput>
      </div>
      <p class="text-xs text-muted italic">
        Type and find!
      </p>
    </div>

    <!-- Active filters bar -->
    <div
      v-if="activeCategory || searchQuery"
      class="flex items-center gap-2 mb-4"
    >
      <UBadge
        v-if="activeCategory"
        color="primary"
        variant="subtle"
        class="gap-1"
      >
        {{ activeCategory.name }}
        <UButton
          icon="i-lucide-x"
          variant="link"
          color="primary"
          size="2xs"
          class="ml-1"
          @click="clearCategory"
        />
      </UBadge>
      <UBadge
        v-if="searchQuery"
        color="neutral"
        variant="subtle"
        class="gap-1"
      >
        "{{ searchQuery }}"
        <UButton
          icon="i-lucide-x"
          variant="link"
          color="neutral"
          size="2xs"
          class="ml-1"
          @click="searchQuery = ''"
        />
      </UBadge>
      <span class="text-xs text-muted">
        {{ filteredResources.length }} {{ filteredResources.length === 1 ? 'result' : 'results' }}
      </span>
    </div>

    <!-- Resource grid -->
    <VaultGrid
      :resources="filteredResources"
      :loading="loading"
    />
  </div>
</template>
