// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@nuxt/image',
    '@nuxt/scripts',
    '@pinia/nuxt'
  ],

  ssr: false,

  devtools: {
    enabled: true
  },

  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
    layoutTransition: { name: 'layout', mode: 'out-in' }
  },

  css: ['~/assets/css/main.css'],

  colorMode: {
    preference: 'dark'
  },

  // Server-side runtime config (secrets)
  runtimeConfig: {
    stripeSecretKey: '',
    stripeWebhookSecret: '',
    appwriteApiKey: '',
    // Public keys (exposed to client)
    public: {
      appwriteEndpoint: 'https://cloud.appwrite.io/v1',
      appwriteProject: '',
      stripeSoloQuarterlyPriceId: '',
      stripeSoloYearlyPriceId: '',
      stripeTeamQuarterlyPriceId: '',
      stripeTeamYearlyPriceId: '',
      stripeLifetimePriceId: '',
      appUrl: 'http://localhost:3000'
    }
  },

  routeRules: {
    '/': { prerender: true },
    '/plans': { prerender: true }
  },

  compatibilityDate: '2025-01-15',

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },

  image: {
    quality: 80
  }
})
