/**
 * Validate critical runtime configuration on server startup.
 * Logs warnings for missing env vars but does not crash the server,
 * allowing local development without all variables configured.
 */
export default defineNitroPlugin(() => {
  const config = useRuntimeConfig()

  const required: Record<string, string> = {
    NUXT_PUBLIC_APPWRITE_PROJECT: config.public.appwriteProject as string,
    STRIPE_SECRET_KEY: config.stripeSecretKey as string,
    STRIPE_WEBHOOK_SECRET: config.stripeWebhookSecret as string,
    APPWRITE_API_KEY: config.appwriteApiKey as string
  }

  const missing = Object.entries(required)
    .filter(([, v]) => !v)
    .map(([k]) => k)

  if (missing.length > 0) {
    console.warn(`[config] ⚠ Missing environment variables: ${missing.join(', ')}`)
    console.warn('[config] Some features may not work correctly.')
  }
})
