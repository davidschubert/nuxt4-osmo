/**
 * Client-only plugin to initialize the Appwrite SDK before middleware runs.
 *
 * This ensures the SDK is available when the `auth` middleware calls `useAuth().init()`,
 * which is critical for OAuth redirects (the browser does a full page reload after
 * returning from the OAuth provider, so the SDK must be ready before route guards execute).
 */
export default defineNuxtPlugin(async () => {
  await initAppwriteSdk()
})
