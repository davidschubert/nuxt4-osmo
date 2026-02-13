import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useVaultStore } from '~/stores/vault'
import { mockResources, mockCategories } from '~/utils/mock-data'

describe('useVaultStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    const store = useVaultStore()
    store.setResources(mockResources)
    store.setCategories(mockCategories)
  })

  describe('initial state', () => {
    it('starts with empty state before data is loaded', () => {
      setActivePinia(createPinia())
      const store = useVaultStore()
      expect(store.resources).toEqual([])
      expect(store.categories).toEqual([])
      expect(store.loading).toBe(false)
      expect(store.searchQuery).toBe('')
      expect(store.activeCategory).toBeNull()
    })
  })

  describe('categoriesWithCount', () => {
    it('counts resources per category correctly', () => {
      const store = useVaultStore()
      const withCount = store.categoriesWithCount

      // cat-buttons has res-1, res-2, res-3 = 3 resources
      const buttons = withCount.find(c => c.$id === 'cat-buttons')
      expect(buttons?.count).toBe(3)

      // cat-utilities has res-4, res-5 = 2 resources
      const utilities = withCount.find(c => c.$id === 'cat-utilities')
      expect(utilities?.count).toBe(2)

      // cat-cursor has res-6 = 1 resource
      const cursor = withCount.find(c => c.$id === 'cat-cursor')
      expect(cursor?.count).toBe(1)

      // cat-sliders has 0 resources
      const sliders = withCount.find(c => c.$id === 'cat-sliders')
      expect(sliders?.count).toBe(0)
    })

    it('returns all categories', () => {
      const store = useVaultStore()
      expect(store.categoriesWithCount.length).toBe(mockCategories.length)
    })
  })

  describe('filteredResources', () => {
    it('returns all resources when no filters active', () => {
      const store = useVaultStore()
      expect(store.filteredResources.length).toBe(mockResources.length)
    })

    it('filters by category slug', () => {
      const store = useVaultStore()
      store.setActiveCategory('buttons')
      const result = store.filteredResources
      expect(result.length).toBe(3)
      expect(result.every(r => r.category === 'cat-buttons')).toBe(true)
    })

    it('filters by search query matching title', () => {
      const store = useVaultStore()
      store.setSearchQuery('elastic')
      const result = store.filteredResources
      expect(result.length).toBe(1)
      expect(result[0].title).toBe('Elastic Pulse Button (Bouncy)')
    })

    it('filters by search query matching tags', () => {
      const store = useVaultStore()
      store.setSearchQuery('ScrollTrigger')
      const result = store.filteredResources
      expect(result.length).toBe(1)
      expect(result[0].slug).toBe('line-reveal-testimonials')
    })

    it('filters by search query matching description', () => {
      const store = useVaultStore()
      store.setSearchQuery('magnetically')
      const result = store.filteredResources
      expect(result.length).toBe(1)
      expect(result[0].slug).toBe('magnetic-hover-effect')
    })

    it('search is case-insensitive', () => {
      const store = useVaultStore()
      store.setSearchQuery('ELASTIC')
      expect(store.filteredResources.length).toBe(1)

      store.setSearchQuery('elastic')
      expect(store.filteredResources.length).toBe(1)
    })

    it('combines category and search filters', () => {
      const store = useVaultStore()
      store.setActiveCategory('buttons')
      store.setSearchQuery('bouncy')
      const result = store.filteredResources
      expect(result.length).toBe(1)
      expect(result[0].slug).toBe('elastic-pulse-button-bouncy')
    })

    it('returns empty array when no matches', () => {
      const store = useVaultStore()
      store.setSearchQuery('nonexistent-xyz-123')
      expect(store.filteredResources.length).toBe(0)
    })

    it('sorts by sortOrder ascending', () => {
      const store = useVaultStore()
      const result = store.filteredResources
      for (let i = 1; i < result.length; i++) {
        expect(result[i].sortOrder).toBeGreaterThanOrEqual(result[i - 1].sortOrder)
      }
    })

    it('ignores whitespace-only search query', () => {
      const store = useVaultStore()
      store.setSearchQuery('   ')
      expect(store.filteredResources.length).toBe(mockResources.length)
    })
  })

  describe('totalResourceCount', () => {
    it('returns total resource count', () => {
      const store = useVaultStore()
      expect(store.totalResourceCount).toBe(mockResources.length)
    })
  })

  describe('activeCategoryData', () => {
    it('returns undefined when no category is active', () => {
      const store = useVaultStore()
      expect(store.activeCategoryData).toBeUndefined()
    })

    it('returns category with count when active', () => {
      const store = useVaultStore()
      store.setActiveCategory('buttons')
      const data = store.activeCategoryData
      expect(data).toBeDefined()
      expect(data?.name).toBe('Buttons')
      expect(data?.count).toBe(3)
    })

    it('returns undefined for unknown category slug', () => {
      const store = useVaultStore()
      store.setActiveCategory('nonexistent')
      expect(store.activeCategoryData).toBeUndefined()
    })
  })

  describe('actions', () => {
    it('setLoading updates loading state', () => {
      const store = useVaultStore()
      store.setLoading(true)
      expect(store.loading).toBe(true)
      store.setLoading(false)
      expect(store.loading).toBe(false)
    })
  })
})
