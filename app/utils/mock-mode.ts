/**
 * Detect whether the app is running in mock mode.
 * Mock mode is active when no Appwrite project ID is configured.
 *
 * IMPORTANT: Must be called inside a Nuxt context (composable, setup, middleware)
 * because it uses useRuntimeConfig().
 */
export function isMockMode(): boolean {
  const project = useRuntimeConfig().public.appwriteProject as string
  return !project || project === '' || project === 'placeholder'
}
