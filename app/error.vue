<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{
  error: NuxtError
}>()

const is404 = computed(() => props.error.statusCode === 404)

const title = computed(() => is404.value ? 'Page not found' : 'Something went wrong')
const description = computed(() => is404.value
  ? 'The page you are looking for does not exist or has been moved.'
  : props.error.statusMessage || 'An unexpected error occurred. Please try again later.'
)
const icon = computed(() => is404.value ? 'i-lucide-file-question' : 'i-lucide-alert-triangle')

function handleBack() {
  clearError({ redirect: '/' })
}

function handleVault() {
  clearError({ redirect: '/vault' })
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center px-4 bg-default">
    <div class="max-w-md w-full text-center space-y-6">
      <!-- Icon -->
      <div class="size-20 mx-auto rounded-full bg-muted flex items-center justify-center">
        <UIcon
          :name="icon"
          class="size-10 text-muted"
        />
      </div>

      <!-- Status Code -->
      <p class="text-6xl font-bold text-muted">
        {{ error.statusCode }}
      </p>

      <!-- Title & Description -->
      <div class="space-y-2">
        <h1 class="text-2xl font-bold">
          {{ title }}
        </h1>
        <p class="text-sm text-muted">
          {{ description }}
        </p>
      </div>

      <!-- Actions -->
      <div class="flex flex-col sm:flex-row items-center justify-center gap-3">
        <UButton
          size="lg"
          @click="handleBack"
        >
          Back to Home
        </UButton>
        <UButton
          variant="outline"
          color="neutral"
          size="lg"
          @click="handleVault"
        >
          Go to Vault
        </UButton>
      </div>
    </div>
  </div>
</template>
