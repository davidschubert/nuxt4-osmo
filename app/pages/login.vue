<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent, AuthFormField } from '@nuxt/ui'

definePageMeta({
  layout: 'default',
  middleware: 'guest'
})

useSeoMeta({
  title: 'Login - The Vault',
  description: 'Sign in to your Vault account to access your resources.'
})

const { login, loginWithOAuth, loading } = useAuth()

const fields: AuthFormField[] = [
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
    placeholder: 'Enter your password',
    required: true
  },
  {
    name: 'remember',
    label: 'Remember me',
    type: 'checkbox'
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
  email: z.email('Invalid email address'),
  password: z.string().min(8, 'Must be at least 8 characters')
})

type Schema = z.output<typeof schema>

async function onSubmit(payload: FormSubmitEvent<Schema>) {
  await login({
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
        title="Welcome back"
        icon="i-lucide-lock"
        @submit="onSubmit"
      >
        <template #description>
          Don't have an account? <NuxtLink
            to="/register"
            class="text-primary font-medium"
          >
            Sign up
          </NuxtLink>.
        </template>
        <template #password-hint>
          <NuxtLink
            to="#"
            class="text-primary font-medium"
            tabindex="-1"
          >
            Forgot password?
          </NuxtLink>
        </template>
        <template #footer>
          By signing in, you agree to our <NuxtLink
            to="#"
            class="text-primary font-medium"
          >
            Terms of Service
          </NuxtLink>.
        </template>
      </UAuthForm>
    </UPageCard>
  </div>
</template>
