import { mockCategories } from '~/utils/mock-data'
import type { Category } from '~/types'
import { APPWRITE } from '~/utils/constants'

export function useCategories() {
  const vaultStore = useVaultStore()
  const MOCK_MODE = isMockMode()

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
        const { databases, Query } = useAppwrite()
        const result = await databases.listDocuments({
          databaseId: APPWRITE.DATABASE_ID,
          collectionId: APPWRITE.COLLECTIONS.CATEGORIES,
          queries: [Query.orderAsc('sortOrder'), Query.limit(100)]
        })
        vaultStore.setCategories(result.documents as unknown as Category[])
      }
    } catch (error) {
      console.error('Failed to load categories:', error)
      const toast = useToast()
      toast.add({ title: 'Loading failed', description: 'Could not load categories.', color: 'error' })
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
