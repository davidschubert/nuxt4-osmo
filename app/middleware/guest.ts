// Redirect authenticated users away from auth pages (login, register).
// Auth is client-only (Appwrite Web SDK), so skip on server.
export default defineNuxtRouteMiddleware(async (to) => {
  // Skip on server — the Appwrite Web SDK is client-only
  if (import.meta.server) return

  // Allow verify-pending state on register page even if authenticated
  if (to.query.verify === 'pending') {
    return
  }

  const { isAuthenticated, init, initialized } = useAuth()

  // Ensure auth state is initialized (SDK loaded via appwrite.client plugin)
  if (!initialized.value) {
    await init()
  }

  if (isAuthenticated.value) {
    return navigateTo('/vault')
  }
})
