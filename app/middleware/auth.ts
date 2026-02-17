// Redirect unauthenticated users to login page.
// Auth is client-only (Appwrite Web SDK uses browser cookies),
// so we skip this middleware on the server to avoid false redirects
// (especially after OAuth callbacks where the session exists only client-side).
export default defineNuxtRouteMiddleware(async () => {
  // Skip on server — the Appwrite Web SDK is client-only
  if (import.meta.server) return

  const { isAuthenticated, init, initialized } = useAuth()

  // Ensure auth state is initialized (SDK loaded via appwrite.client plugin)
  if (!initialized.value) {
    await init()
  }

  if (!isAuthenticated.value) {
    return navigateTo('/login')
  }
})
