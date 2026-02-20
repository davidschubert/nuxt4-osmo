<script setup lang="ts">
const emit = defineEmits<{
  complete: []
}>()

const cardNumber = ref('4242 4242 4242 4242')
const expiry = ref('12/26')
const cvc = ref('123')
const name = ref('Test User')
const processing = ref(false)

async function handlePay() {
  processing.value = true
  // Simulate Stripe processing delay
  await new Promise(resolve => setTimeout(resolve, 1500))
  emit('complete')
}
</script>

<template>
  <div class="rounded-xl border border-default bg-elevated overflow-hidden">
    <!-- Test mode banner -->
    <div class="bg-orange-500/10 border-b border-orange-500/20 px-4 py-2 flex items-center gap-2">
      <UIcon
        name="i-lucide-flask-conical"
        class="size-4 text-orange-500"
      />
      <span class="text-xs font-medium text-orange-500">Mock Mode — No real payment will be processed</span>
    </div>

    <div class="p-6 space-y-5">
      <!-- Email (read-only) -->
      <div class="space-y-1.5">
        <label class="text-xs font-medium text-muted">Email</label>
        <div class="text-sm text-default bg-muted/30 rounded-lg px-3 py-2.5 border border-default/50">
          test@example.com
        </div>
      </div>

      <!-- Card information -->
      <div class="space-y-1.5">
        <label class="text-xs font-medium text-muted">Card information</label>
        <div class="rounded-lg border border-default/50 overflow-hidden">
          <UInput
            v-model="cardNumber"
            placeholder="1234 1234 1234 1234"
            variant="none"
            :ui="{ root: 'border-b border-default/50', base: 'px-3 py-2.5' }"
            readonly
          />
          <div class="flex border-default/50">
            <UInput
              v-model="expiry"
              placeholder="MM / YY"
              variant="none"
              :ui="{ root: 'flex-1 border-r border-default/50', base: 'px-3 py-2.5' }"
              readonly
            />
            <UInput
              v-model="cvc"
              placeholder="CVC"
              variant="none"
              :ui="{ root: 'flex-1', base: 'px-3 py-2.5' }"
              readonly
            />
          </div>
        </div>
      </div>

      <!-- Cardholder name -->
      <div class="space-y-1.5">
        <label class="text-xs font-medium text-muted">Cardholder name</label>
        <UInput
          v-model="name"
          placeholder="Full name on card"
          variant="none"
          :ui="{ root: 'rounded-lg border border-default/50', base: 'px-3 py-2.5' }"
          readonly
        />
      </div>

      <!-- Country -->
      <div class="space-y-1.5">
        <label class="text-xs font-medium text-muted">Country or region</label>
        <div class="text-sm text-default bg-muted/30 rounded-lg px-3 py-2.5 border border-default/50 flex items-center justify-between">
          <span>Germany</span>
          <UIcon
            name="i-lucide-chevron-down"
            class="size-4 text-muted"
          />
        </div>
      </div>

      <!-- Pay button -->
      <UButton
        block
        size="lg"
        :loading="processing"
        :label="processing ? 'Processing...' : 'Pay'"
        @click="handlePay"
      />

      <!-- Footer -->
      <div class="flex items-center justify-center gap-1.5 text-xs text-muted pt-1">
        <UIcon
          name="i-lucide-lock"
          class="size-3"
        />
        <span>Simulated checkout — mock mode</span>
      </div>
    </div>
  </div>
</template>
