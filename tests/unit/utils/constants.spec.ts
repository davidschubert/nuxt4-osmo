import { describe, it, expect } from 'vitest'
import { APPWRITE, CATEGORIES, APP, SIDEBAR_EXTRA_ITEMS } from '~/utils/constants'

describe('constants', () => {
  describe('APPWRITE', () => {
    it('has a database ID', () => {
      expect(APPWRITE.DATABASE_ID).toBe('vault-db')
    })

    it('has all required collection IDs', () => {
      expect(APPWRITE.COLLECTIONS.RESOURCES).toBe('resources')
      expect(APPWRITE.COLLECTIONS.RESOURCE_CODE).toBe('resource-code')
      expect(APPWRITE.COLLECTIONS.CATEGORIES).toBe('categories')
      expect(APPWRITE.COLLECTIONS.USER_PROFILES).toBe('user-profiles')
    })

    it('has all required bucket IDs', () => {
      expect(APPWRITE.BUCKETS.THUMBNAILS).toBe('thumbnails')
      expect(APPWRITE.BUCKETS.ASSETS).toBe('assets')
    })
  })

  describe('CATEGORIES', () => {
    it('has 10 categories', () => {
      expect(CATEGORIES).toHaveLength(10)
    })

    it('each category has slug, name, and icon', () => {
      for (const cat of CATEGORIES) {
        expect(cat.slug).toBeTruthy()
        expect(cat.name).toBeTruthy()
        expect(cat.icon).toMatch(/^i-lucide-/)
      }
    })

    it('includes expected categories', () => {
      const slugs = CATEGORIES.map(c => c.slug)
      expect(slugs).toContain('buttons')
      expect(slugs).toContain('scroll-animations')
      expect(slugs).toContain('navigation')
    })
  })

  describe('APP', () => {
    it('has correct app name', () => {
      expect(APP.NAME).toBe('OSMO')
    })

    it('has description and URL', () => {
      expect(APP.DESCRIPTION).toBeTruthy()
      expect(APP.URL).toBeTruthy()
    })
  })

  describe('SIDEBAR_EXTRA_ITEMS', () => {
    it('has extra navigation items', () => {
      expect(SIDEBAR_EXTRA_ITEMS.length).toBeGreaterThan(0)
    })

    it('each item has slug, name, icon, and to', () => {
      for (const item of SIDEBAR_EXTRA_ITEMS) {
        expect(item.slug).toBeTruthy()
        expect(item.name).toBeTruthy()
        expect(item.icon).toMatch(/^i-lucide-/)
        expect(item.to).toBeTruthy()
      }
    })
  })
})
