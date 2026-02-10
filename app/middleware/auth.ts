// Redirect unauthenticated users to login page
export default defineNuxtRouteMiddleware(async () => {
  const { isAuthenticated, init, initialized } = useAuth()

  // Ensure auth state is initialized
  if (!initialized.value) {
    await init()
  }

  if (!isAuthenticated.value) {
    return navigateTo('/login')
  }
})
