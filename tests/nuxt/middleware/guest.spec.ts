import { describe, it, expect, beforeEach } from 'vitest'
import { mockUser } from '~/utils/mock-data'

import guestMiddleware from '~/middleware/guest'

describe('guest middleware', () => {
  beforeEach(() => {
    const authStore = useAuthStore()
    authStore.clear()
    localStorage.clear()
  })

  it('allows access when not authenticated', async () => {
    const authStore = useAuthStore()
    authStore.setInitialized()

    const result = await guestMiddleware(
      { path: '/login', query: {} } as any,
      { path: '/' } as any
    )

    expect(result).toBeUndefined()
  })

  it('redirects to /vault when authenticated', async () => {
    const authStore = useAuthStore()
    authStore.setUser(mockUser)
    authStore.setInitialized()

    const result = await guestMiddleware(
      { path: '/login', query: {} } as any,
      { path: '/' } as any
    )

    expect(result).toBeTruthy()
  })

  it('allows access with verify=pending even when authenticated', async () => {
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
