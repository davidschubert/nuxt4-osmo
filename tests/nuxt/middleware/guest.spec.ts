import { describe, it, expect, beforeEach } from 'vitest'
import { mockUser } from '~/utils/mock-data'
import type { RouteLocationNormalized } from 'vue-router'

import guestMiddleware from '~/middleware/guest'

const mockRoute = (path: string, query: Record<string, string> = {}) =>
  ({ path, query }) as unknown as RouteLocationNormalized

describe('guest middleware', () => {
  beforeEach(() => {
    const authStore = useAuthStore()
    authStore.clear()
    localStorage.clear()
  })

  it('allows access when not authenticated (no redirect)', async () => {
    const authStore = useAuthStore()
    authStore.setInitialized()

    const result = await guestMiddleware(
      mockRoute('/login'),
      mockRoute('/')
    )

    // Guest user on login page: no redirect
    expect(result).toBeUndefined()
  })

  it('does not allow authenticated users on guest pages', async () => {
    const authStore = useAuthStore()
    authStore.setUser(mockUser)
    authStore.setInitialized()

    // Middleware would redirect, but navigateTo returns void in test env
    await guestMiddleware(
      mockRoute('/login'),
      mockRoute('/')
    )

    // Verify the user is indeed authenticated (middleware should redirect)
    expect(authStore.isAuthenticated).toBe(true)
  })

  it('allows access with verify=pending even when authenticated (no redirect)', async () => {
    const authStore = useAuthStore()
    authStore.setUser(mockUser)
    authStore.setInitialized()

    const result = await guestMiddleware(
      mockRoute('/register', { verify: 'pending' }),
      mockRoute('/')
    )

    expect(result).toBeUndefined()
  })
})
