// Redirect authenticated users away from auth pages (login, register)
export default defineNuxtRouteMiddleware(async (to) => {
  // Allow verify-pending state on register page even if authenticated
  if (to.query.verify === 'pending') {
    return
  }

  const { isAuthenticated, init, initialized } = useAuth()

  // Ensure auth state is initialized
  if (!initialized.value) {
    await init()
  }

  if (isAuthenticated.value) {
    return navigateTo('/vault')
  }
})
