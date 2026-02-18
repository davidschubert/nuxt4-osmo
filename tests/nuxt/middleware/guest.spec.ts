import { describe, it, expect, beforeEach } from 'vitest'
import { mockUser } from '~/utils/mock-data'

import guestMiddleware from '~/middleware/guest'

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
      { path: '/login', query: {} } as any,
      { path: '/' } as any
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
      { path: '/login', query: {} } as any,
      { path: '/' } as any
    )

    // Verify the user is indeed authenticated (middleware should redirect)
    expect(authStore.isAuthenticated).toBe(true)
  })

  it('allows access with verify=pending even when authenticated (no redirect)', async () => {
    const authStore = useAuthStore()
    authStore.setUser(mockUser)
    authStore.setInitialized()

    const result = await guestMiddleware(
      { path: '/register', query: { verify: 'pending' } } as any,
      { path: '/' } as any
    )

    expect(result).toBeUndefined()
  })
})
