// Redirect non-admin users to vault
export default defineNuxtRouteMiddleware(async () => {
  const { isAuthenticated, isAdmin, init, initialized } = useAuth()

  // Ensure auth state is initialized
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
