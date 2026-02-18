import { describe, it, expect, beforeEach } from 'vitest'
import { mockUser } from '~/utils/mock-data'

// Import the middleware — defineNuxtRouteMiddleware returns the handler function
import authMiddleware from '~/middleware/auth'

describe('auth middleware', () => {
  beforeEach(() => {
    const authStore = useAuthStore()
    authStore.clear()
    localStorage.clear()
  })

  it('redirects to /login when not authenticated', async () => {
    // Initialize auth so it doesn't try to call init()
    const authStore = useAuthStore()
    authStore.setInitialized()

    const result = await authMiddleware(
      { path: '/vault' } as any,
      { path: '/' } as any
    )

    // navigateTo returns a route object or string
    expect(result).toBeTruthy()
  })

  it('allows access when authenticated', async () => {
    const authStore = useAuthStore()
    authStore.setUser(mockUser)
    authStore.setInitialized()

    const result = await authMiddleware(
      { path: '/vault' } as any,
      { path: '/' } as any
    )

    // No redirect = undefined return
    expect(result).toBeUndefined()
  })
})
