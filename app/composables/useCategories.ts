import { mockCategories } from '~/utils/mock-data'

// Mock mode: will be replaced with Appwrite calls in Phase 7
const MOCK_MODE = true

export function useCategories() {
  const vaultStore = useVaultStore()

  /**
   * Load all categories
   */
  async function loadCategories() {
    if (vaultStore.categories.length > 0) return

    vaultStore.setLoading(true)
    try {
      if (MOCK_MODE) {
        await new Promise(resolve => setTimeout(resolve, 200))
        vaultStore.setCategories(mockCategories as unknown as typeof vaultStore.categories)
      } else {
        // Real Appwrite
        // const { database, Query } = useAppwrite()
        // const result = await database.listDocuments({
        //   databaseId: APPWRITE.DATABASE_ID,
        //   collectionId: APPWRITE.COLLECTIONS.CATEGORIES,
        //   queries: [Query.orderAsc('sortOrder'), Query.limit(100)]
        // })
        // vaultStore.setCategories(result.documents)
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
