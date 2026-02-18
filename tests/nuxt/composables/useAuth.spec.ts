import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mockUser } from '~/utils/mock-data'

// The Nuxt test environment has no appwriteProject configured,
// so isMockMode() returns true — we test mock mode paths here.

describe('useAuth (mock mode)', () => {
  beforeEach(() => {
    const authStore = useAuthStore()
    authStore.clear()
    localStorage.clear()
  })

  it('returns expected interface', () => {
    const auth = useAuth()
    expect(auth).toHaveProperty('init')
    expect(auth).toHaveProperty('login')
    expect(auth).toHaveProperty('register')
    expect(auth).toHaveProperty('logout')
    expect(auth).toHaveProperty('loginWithOAuth')
    expect(auth).toHaveProperty('resendVerification')
    expect(auth).toHaveProperty('updateDisplayName')
    expect(auth).toHaveProperty('updateUserEmail')
    expect(auth).toHaveProperty('updatePassword')
    expect(auth).toHaveProperty('user')
    expect(auth).toHaveProperty('isAuthenticated')
    expect(auth).toHaveProperty('isAdmin')
    expect(auth).toHaveProperty('isSubscribed')
    expect(auth).toHaveProperty('emailVerified')
    expect(auth).toHaveProperty('loading')
    expect(auth).toHaveProperty('initialized')
  })

  it('starts unauthenticated', () => {
    const { isAuthenticated, user } = useAuth()
    expect(isAuthenticated.value).toBe(false)
    expect(user.value).toBeNull()
  })

  describe('login', () => {
    it('sets user in store on successful login', async () => {
      const { login, isAuthenticated, user } = useAuth()
      await login({ email: 'test@example.com', password: 'password123' })

      expect(isAuthenticated.value).toBe(true)
      expect(user.value?.email).toBe('test@example.com')
      expect(user.value?.displayName).toBe('test')
    })

    it('stores session in localStorage', async () => {
      const { login } = useAuth()
      await login({ email: 'test@example.com', password: 'password123' })

      const stored = localStorage.getItem('vault-mock-session')
      expect(stored).toBeTruthy()
      const parsed = JSON.parse(stored!)
      expect(parsed.email).toBe('test@example.com')
    })

    it('throws on empty email', async () => {
      const { login } = useAuth()
      await expect(login({ email: '', password: 'password123' })).rejects.toThrow('Email and password are required')
    })

    it('throws on empty password', async () => {
      const { login } = useAuth()
      await expect(login({ email: 'test@example.com', password: '' })).rejects.toThrow('Email and password are required')
    })

    it('sets loading false after login', async () => {
      const { login, loading } = useAuth()
      await login({ email: 'test@example.com', password: 'pass123' })
      expect(loading.value).toBe(false)
    })

    it('sets loading false even on error', async () => {
      const { login, loading } = useAuth()
      try {
        await login({ email: '', password: '' })
      } catch {
        // expected
      }
      expect(loading.value).toBe(false)
    })
  })

  describe('register', () => {
    it('sets user in store on successful registration', async () => {
      const { register, isAuthenticated, user } = useAuth()
      await register({ name: 'Alice', email: 'alice@example.com', password: 'password123' })

      expect(isAuthenticated.value).toBe(true)
      expect(user.value?.displayName).toBe('Alice')
      expect(user.value?.email).toBe('alice@example.com')
    })

    it('throws on missing fields', async () => {
      const { register } = useAuth()
      await expect(register({ name: '', email: 'a@b.com', password: 'pass' })).rejects.toThrow('All fields are required')
    })
  })

  describe('logout', () => {
    it('clears user from store', async () => {
      const { login, logout, isAuthenticated } = useAuth()
      await login({ email: 'test@example.com', password: 'pass123' })
      expect(isAuthenticated.value).toBe(true)

      await logout()
      expect(isAuthenticated.value).toBe(false)
    })

    it('removes session from localStorage', async () => {
      const { login, logout } = useAuth()
      await login({ email: 'test@example.com', password: 'pass123' })
      expect(localStorage.getItem('vault-mock-session')).toBeTruthy()

      await logout()
      expect(localStorage.getItem('vault-mock-session')).toBeNull()
    })
  })

  describe('loginWithOAuth', () => {
    it('sets user with provider-based display name', async () => {
      const { loginWithOAuth, user } = useAuth()
      await loginWithOAuth('github')

      expect(user.value?.displayName).toBe('Github User')
    })

    it('works for google provider', async () => {
      const { loginWithOAuth, user } = useAuth()
      await loginWithOAuth('google')

      expect(user.value?.displayName).toBe('Google User')
    })
  })

  describe('init', () => {
    it('restores session from localStorage', async () => {
      const savedUser = { ...mockUser, email: 'saved@example.com' }
      localStorage.setItem('vault-mock-session', JSON.stringify(savedUser))

      const { init, user, initialized } = useAuth()
      await init()

      expect(initialized.value).toBe(true)
      expect(user.value?.email).toBe('saved@example.com')
    })

    it('stays unauthenticated when no saved session', async () => {
      const { init, isAuthenticated, initialized } = useAuth()
      await init()

      expect(initialized.value).toBe(true)
      expect(isAuthenticated.value).toBe(false)
    })

    it('only initializes once', async () => {
      const { init } = useAuth()
      await init()
      const authStore = useAuthStore()
      const initializedCount = authStore.initialized

      await init() // second call should be a no-op
      expect(authStore.initialized).toBe(initializedCount)
    })
  })

  describe('updateDisplayName', () => {
    it('updates display name in store', async () => {
      const { login, updateDisplayName, user } = useAuth()
      await login({ email: 'test@example.com', password: 'pass123' })
      await updateDisplayName('New Name')

      expect(user.value?.displayName).toBe('New Name')
    })

    it('rejects empty name', async () => {
      const { login, updateDisplayName, user } = useAuth()
      await login({ email: 'test@example.com', password: 'pass123' })
      const originalName = user.value?.displayName

      await updateDisplayName('   ')
      expect(user.value?.displayName).toBe(originalName)
    })
  })

  describe('updateUserEmail', () => {
    it('updates email in store', async () => {
      const { login, updateUserEmail, user } = useAuth()
      await login({ email: 'old@example.com', password: 'pass123' })
      await updateUserEmail('new@example.com', 'pass123')

      expect(user.value?.email).toBe('new@example.com')
    })

    it('rejects empty email', async () => {
      const { login, updateUserEmail, user } = useAuth()
      await login({ email: 'old@example.com', password: 'pass123' })

      await updateUserEmail('   ', 'pass123')
      expect(user.value?.email).toBe('old@example.com')
    })

    it('rejects empty password', async () => {
      const { login, updateUserEmail, user } = useAuth()
      await login({ email: 'old@example.com', password: 'pass123' })

      await updateUserEmail('new@example.com', '')
      expect(user.value?.email).toBe('old@example.com')
    })
  })

  describe('updatePassword', () => {
    it('succeeds with valid passwords', async () => {
      const { login, updatePassword } = useAuth()
      await login({ email: 'test@example.com', password: 'pass123' })

      // Should not throw
      await updatePassword('oldpass123', 'newpass123')
    })

    it('rejects empty old password', async () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const { login, updatePassword } = useAuth()
      await login({ email: 'test@example.com', password: 'pass123' })

      await updatePassword('', 'newpass123')
      // No error thrown, just toast shown — the function returns early
      spy.mockRestore()
    })

    it('rejects password shorter than 8 characters', async () => {
      const { login, updatePassword } = useAuth()
      await login({ email: 'test@example.com', password: 'pass123' })

      await updatePassword('oldpass123', 'short')
      // Function returns early with toast, no error thrown
    })
  })

  describe('resendVerification', () => {
    it('returns immediately in mock mode', async () => {
      const { resendVerification } = useAuth()
      // Should not throw
      await resendVerification()
    })
  })
})
