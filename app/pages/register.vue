<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent, AuthFormField } from '@nuxt/ui'

definePageMeta({
  layout: 'default',
  middleware: 'guest'
})

useSeoMeta({
  title: 'Register - The Vault',
  description: 'Create your free Vault account and start exploring resources.'
})

const route = useRoute()
const { register, loginWithOAuth, resendVerification, loading } = useAuth()

const isVerifyPending = computed(() => route.query.verify === 'pending')
const resending = ref(false)

async function handleResend() {
  resending.value = true
  try {
    await resendVerification()
  } finally {
    resending.value = false
  }
}

const fields: AuthFormField[] = [
  {
    name: 'name',
    type: 'text',
    label: 'Full name',
    placeholder: 'Enter your name',
    required: true
  },
  {
    name: 'email',
    type: 'email',
    label: 'Email',
    placeholder: 'Enter your email',
    required: true
  },
  {
    name: 'password',
    label: 'Password',
    type: 'password',
    placeholder: 'Create a password',
    required: true
  }
]

const providers = [
  {
    label: 'GitHub',
    icon: 'i-simple-icons-github',
    onClick: () => loginWithOAuth('github')
  },
  {
    label: 'Google',
    icon: 'i-simple-icons-google',
    onClick: () => loginWithOAuth('google')
  }
]

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.email('Invalid email address'),
  password: z.string().min(8, 'Must be at least 8 characters')
})

type Schema = z.output<typeof schema>

async function onSubmit(payload: FormSubmitEvent<Schema>) {
  await register({
    name: payload.data.name,
    email: payload.data.email,
    password: payload.data.password
  })
}
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] px-4 py-12">
    <!-- Verify pending state -->
    <UPageCard
      v-if="isVerifyPending"
      class="w-full max-w-md text-center"
    >
      <div class="space-y-4">
        <UIcon
          name="i-lucide-mail-check"
          class="size-12 text-primary mx-auto"
        />
        <h2 class="text-xl font-bold">
          Check your email
        </h2>
        <p class="text-sm text-muted">
          We sent a verification link to your email address. Please click the link to verify your account and unlock all features.
        </p>
        <div class="flex flex-col gap-2 pt-2">
          <UButton
            label="Resend verification email"
            variant="outline"
            color="neutral"
            :loading="resending"
            @click="handleResend"
          />
          <UButton
            to="/vault"
            label="Continue to Vault"
            color="primary"
          />
        </div>
        <p class="text-xs text-muted">
          You can use the Vault right away — verify your email to unlock premium resources.
        </p>
      </div>
    </UPageCard>

    <!-- Registration form -->
    <UPageCard
      v-else
      class="w-full max-w-md"
    >
      <UAuthForm
        :schema="schema"
        :fields="fields"
        :providers="providers"
        :loading="loading"
        title="Create your account"
        description="Start exploring The Vault for free."
        icon="i-lucide-user-plus"
        :submit="{ label: 'Create account' }"
        @submit="onSubmit"
      >
        <template #description>
          Already have an account? <NuxtLink
            to="/login"
            class="text-primary font-medium"
          >
            Sign in
          </NuxtLink>.
        </template>
        <template #footer>
          By creating an account, you agree to our <NuxtLink
            to="#"
            class="text-primary font-medium"
          >
            Terms of Service
          </NuxtLink> and <NuxtLink
            to="#"
            class="text-primary font-medium"
          >
            Privacy Policy
          </NuxtLink>.
        </template>
      </UAuthForm>
    </UPageCard>
  </div>
</template>
