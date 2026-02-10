<script setup lang="ts">
definePageMeta({
  layout: 'vault',
  middleware: 'auth'
})

useSeoMeta({
  title: 'The Vault - Browse Resources'
})

const { user } = useAuth()

const greeting = computed(() => {
  if (!user.value) return 'Hello'
  const firstName = user.value.displayName.split(' ')[0]
  return `Hello ${firstName}`
})
</script>

<template>
  <div class="p-6">
    <div class="text-center mb-8">
      <p class="text-sm text-muted mb-2">
        {{ greeting }}
      </p>
      <h1 class="text-4xl md:text-5xl font-bold mb-6">
        Welcome to<br>the Vault
      </h1>
    </div>

    <p class="text-center text-muted">
      Vault grid will be built in Phase 4.
    </p>
  </div>
</template>
