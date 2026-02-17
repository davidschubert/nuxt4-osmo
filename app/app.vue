<script setup lang="ts">
import { APP } from '~/utils/constants'

// SDK is initialized by plugins/appwrite.client.ts (runs before middleware).
// Auth init is triggered by the auth middleware on protected routes.
// For unprotected routes (landing page), initialize auth lazily on mount.
const { init: initAuth } = useAuth()
onMounted(() => {
  initAuth()
})

useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' }
  ],
  htmlAttrs: {
    lang: 'en'
  }
})

useSeoMeta({
  title: APP.NAME,
  description: APP.DESCRIPTION,
  ogTitle: APP.NAME,
  ogDescription: APP.DESCRIPTION
})
</script>

<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
