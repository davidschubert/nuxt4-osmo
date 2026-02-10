// Redirect authenticated users away from auth pages (login, register)
export default defineNuxtRouteMiddleware(async () => {
  const { isAuthenticated, init, initialized } = useAuth()

  // Ensure auth state is initialized
  if (!initialized.value) {
    await init()
  }

  if (isAuthenticated.value) {
    return navigateTo('/vault')
  }
})
