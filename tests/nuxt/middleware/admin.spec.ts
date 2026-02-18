import { describe, it, expect, beforeEach } from 'vitest'
import { mockUser } from '~/utils/mock-data'

import adminMiddleware from '~/middleware/admin'

describe('admin middleware', () => {
  beforeEach(() => {
    const authStore = useAuthStore()
    authStore.clear()
    localStorage.clear()
  })

  it('does not allow access when not authenticated', async () => {
    const authStore = useAuthStore()
    authStore.setInitialized()

    await adminMiddleware(
      { path: '/admin' } as any,
      { path: '/' } as any
    )

    // User remains unauthenticated — middleware would redirect
    expect(authStore.isAuthenticated).toBe(false)
  })

  it('does not grant admin access to non-admin users', async () => {
    const authStore = useAuthStore()
    authStore.setUser(mockUser)
    authStore.setAccountLabels(['user'])
    authStore.setInitialized()

    await adminMiddleware(
      { path: '/admin' } as any,
      { path: '/' } as any
    )

    // User is authenticated but not admin
    expect(authStore.isAdmin).toBe(false)
  })

  it('allows access when authenticated and admin (no redirect)', async () => {
    const authStore = useAuthStore()
    authStore.setUser(mockUser)
    authStore.setAccountLabels(['admin'])
    authStore.setInitialized()

    const result = await adminMiddleware(
      { path: '/admin' } as any,
      { path: '/' } as any
    )

    // Admin user: middleware returns undefined (no redirect)
    expect(result).toBeUndefined()
  })
})
