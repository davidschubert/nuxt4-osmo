<script setup lang="ts">
import { APP } from '~/utils/constants'

// Initialize auth state on app startup (client-only)
const { init: initAuth } = useAuth()
onMounted(async () => {
  // Load the Appwrite SDK lazily (browser-only, SSR-safe)
  await initAppwriteSdk()

  // Ping Appwrite to verify connection (required for initial setup)
  try {
    const { client } = useAppwrite()
    await client.ping()
    console.log('Appwrite connection verified')
  } catch {
    console.warn('Appwrite ping failed – running in mock mode')
  }
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
