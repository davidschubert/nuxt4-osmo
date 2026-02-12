import { mockCategories } from '~/utils/mock-data'
import type { Category } from '~/types'
import { APPWRITE } from '~/utils/constants'

// Auto-detect mock mode
const MOCK_MODE = !import.meta.env.NUXT_PUBLIC_APPWRITE_PROJECT
  || import.meta.env.NUXT_PUBLIC_APPWRITE_PROJECT === ''
  || import.meta.env.NUXT_PUBLIC_APPWRITE_PROJECT === 'placeholder'

export function useCategories() {
  const vaultStore = useVaultStore()

  /**
   * Load all categories from Appwrite or mock data
   */
  async function loadCategories() {
    if (vaultStore.categories.length > 0) return

    vaultStore.setLoading(true)
    try {
      if (MOCK_MODE) {
        await new Promise(resolve => setTimeout(resolve, 200))
        vaultStore.setCategories(mockCategories as unknown as Category[])
      } else {
        const { database, Query } = useAppwrite()
        const result = await database.listDocuments(
          APPWRITE.DATABASE_ID,
          APPWRITE.COLLECTIONS.CATEGORIES,
          [Query.orderAsc('sortOrder'), Query.limit(100)]
        )
        vaultStore.setCategories(result.documents as unknown as Category[])
      }
    } catch (error) {
      console.error('Failed to load categories:', error)
    } finally {
      vaultStore.setLoading(false)
    }
  }

  /**
   * Get a single category by slug
   */
  function getCategoryBySlug(slug: string) {
    return vaultStore.categoriesWithCount.find(c => c.slug === slug)
  }

  return {
    loadCategories,
    getCategoryBySlug,
    categories: computed(() => vaultStore.categories),
    categoriesWithCount: computed(() => vaultStore.categoriesWithCount)
  }
}
