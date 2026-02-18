import { describe, it, expect, beforeEach } from 'vitest'
import { mockUser } from '~/utils/mock-data'

import adminMiddleware from '~/middleware/admin'

describe('admin middleware', () => {
  beforeEach(() => {
    const authStore = useAuthStore()
    authStore.clear()
    localStorage.clear()
  })

  it('redirects to /login when not authenticated', async () => {
    const authStore = useAuthStore()
    authStore.setInitialized()

    const result = await adminMiddleware(
      { path: '/admin' } as any,
      { path: '/' } as any
    )

    expect(result).toBeTruthy()
  })

  it('redirects to /vault when authenticated but not admin', async () => {
    const authStore = useAuthStore()
    authStore.setUser(mockUser)
    authStore.setAccountLabels(['user'])
    authStore.setInitialized()

    const result = await adminMiddleware(
      { path: '/admin' } as any,
      { path: '/' } as any
    )

    expect(result).toBeTruthy()
  })

  it('allows access when authenticated and admin', async () => {
    const authStore = useAuthStore()
    authStore.setUser(mockUser)
    authStore.setAccountLabels(['admin'])
    authStore.setInitialized()

    const result = await adminMiddleware(
      { path: '/admin' } as any,
      { path: '/' } as any
    )

    expect(result).toBeUndefined()
  })
})
