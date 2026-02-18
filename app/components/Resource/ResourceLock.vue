<script setup lang="ts">
defineProps<{
  resourceTitle?: string
}>()

const { isAuthenticated } = useAuth()

function handleUpgrade() {
  if (!isAuthenticated.value) {
    navigateTo('/plans/subscription')
  } else {
    navigateTo('/plans/subscription')
  }
}
</script>

<template>
  <div class="relative rounded-xl overflow-hidden border border-default/50">
    <!-- Blurred content placeholder -->
    <div class="bg-muted/50 backdrop-blur-md p-8 min-h-[300px] flex flex-col items-center justify-center text-center space-y-4">
      <div class="size-16 rounded-full bg-primary/10 flex items-center justify-center">
        <UIcon
          name="i-lucide-lock"
          class="size-8 text-primary"
        />
      </div>
      <div class="space-y-2">
        <h3 class="text-lg font-semibold">
          Premium Resource
        </h3>
        <p class="text-sm text-muted max-w-sm">
          This resource is available to Pro members. Upgrade your plan to access the full code, preview, and documentation.
        </p>
      </div>
      <div class="flex flex-col items-center gap-2">
        <UButton
          label="Upgrade to Pro"
          trailing-icon="i-lucide-arrow-right"
          size="lg"
          @click="handleUpgrade"
        />
        <UButton
          to="/plans"
          variant="link"
          color="neutral"
          size="sm"
          label="View plans"
        />
      </div>
    </div>
  </div>
</template>
