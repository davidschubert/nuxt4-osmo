<script setup lang="ts">
definePageMeta({
  layout: 'default'
})

useSeoMeta({
  title: 'Checkout Canceled - The Vault',
  description: 'Your checkout was canceled. No charges were made.'
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center px-4">
    <div class="max-w-md w-full text-center space-y-6">
      <div class="size-16 mx-auto rounded-full bg-muted flex items-center justify-center">
        <UIcon
          name="i-lucide-x"
          class="size-8 text-muted"
        />
      </div>
      <h1 class="text-2xl font-bold">
        Checkout canceled
      </h1>
      <p class="text-muted">
        No worries – no charges were made. You can try again anytime or continue using The Vault for free.
      </p>
      <div class="flex flex-col sm:flex-row items-center justify-center gap-3">
        <UButton
          to="/pricing"
          size="lg"
        >
          View plans
        </UButton>
        <UButton
          to="/vault"
          variant="outline"
          color="neutral"
          size="lg"
        >
          Back to The Vault
        </UButton>
      </div>
    </div>
  </div>
</template>
