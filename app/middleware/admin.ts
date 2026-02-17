// Redirect non-admin users to vault.
// Auth is client-only (Appwrite Web SDK), so skip on server.
export default defineNuxtRouteMiddleware(async () => {
  // Skip on server — the Appwrite Web SDK is client-only
  if (import.meta.server) return

  const { isAuthenticated, isAdmin, init, initialized } = useAuth()

  // Ensure auth state is initialized (SDK loaded via appwrite.client plugin)
  if (!initialized.value) {
    await init()
  }

  if (!isAuthenticated.value) {
    return navigateTo('/login')
  }

  if (!isAdmin.value) {
    return navigateTo('/vault')
  }
})
