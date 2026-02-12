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

const { register, loginWithOAuth, loading } = useAuth()

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
  },
  {
    label: 'Apple',
    icon: 'i-simple-icons-apple',
    onClick: () => loginWithOAuth('apple')
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
    <UPageCard class="w-full max-w-md">
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
