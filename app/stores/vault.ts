import { defineStore } from 'pinia'
import type { Resource, Category, CategoryWithCount } from '~/types'

interface VaultState {
  resources: Resource[]
  categories: Category[]
  loading: boolean
  searchQuery: string
  activeCategory: string | null
}

export const useVaultStore = defineStore('vault', {
  state: (): VaultState => ({
    resources: [],
    categories: [],
    loading: false,
    searchQuery: '',
    activeCategory: null
  }),

  getters: {
    categoriesWithCount: (state): CategoryWithCount[] => {
      return state.categories.map(cat => ({
        ...cat,
        count: state.resources.filter(r => r.category === cat.$id).length
      }))
    },

    filteredResources: (state): Resource[] => {
      let result = [...state.resources]

      // Filter by category
      if (state.activeCategory) {
        const cat = state.categories.find(c => c.slug === state.activeCategory)
        if (cat) {
          result = result.filter(r => r.category === cat.$id)
        }
      }

      // Filter by search query
      if (state.searchQuery.trim()) {
        const q = state.searchQuery.toLowerCase().trim()
        result = result.filter(r =>
          r.title.toLowerCase().includes(q)
          || r.description.toLowerCase().includes(q)
          || r.tags.some(t => t.toLowerCase().includes(q))
        )
      }

      // Sort by sortOrder
      return result.sort((a, b) => a.sortOrder - b.sortOrder)
    },

    totalResourceCount: (state): number => state.resources.length,

    activeCategoryData(): CategoryWithCount | undefined {
      if (!this.activeCategory) return undefined
      return this.categoriesWithCount.find(c => c.slug === this.activeCategory)
    }
  },

  actions: {
    setResources(resources: Resource[]) {
      this.resources = resources
    },

    setCategories(categories: Category[]) {
      this.categories = categories
    },

    setLoading(loading: boolean) {
      this.loading = loading
    },

    setSearchQuery(query: string) {
      this.searchQuery = query
    },

    setActiveCategory(slug: string | null) {
      this.activeCategory = slug
    }
  }
})
