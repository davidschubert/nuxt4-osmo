import { mockResources } from '~/utils/mock-data'
import type { Resource } from '~/types'

// Mock mode: will be replaced with Appwrite calls in Phase 7
const MOCK_MODE = true

export function useResources() {
  const vaultStore = useVaultStore()

  /**
   * Load all resources
   */
  async function loadResources() {
    if (vaultStore.resources.length > 0) return

    vaultStore.setLoading(true)
    try {
      if (MOCK_MODE) {
        await new Promise(resolve => setTimeout(resolve, 300))
        vaultStore.setResources(mockResources)
      } else {
        // Real Appwrite
        // const { database, Query } = useAppwrite()
        // const result = await database.listDocuments({
        //   databaseId: APPWRITE.DATABASE_ID,
        //   collectionId: APPWRITE.COLLECTIONS.RESOURCES,
        //   queries: [Query.orderAsc('sortOrder'), Query.limit(100)]
        // })
        // vaultStore.setResources(result.documents)
      }
    } catch (error) {
      console.error('Failed to load resources:', error)
    } finally {
      vaultStore.setLoading(false)
    }
  }

  /**
   * Get a single resource by slug
   */
  function getResourceBySlug(slug: string): Resource | undefined {
    return vaultStore.resources.find(r => r.slug === slug)
  }

  /**
   * Get related resources (same category, excluding current)
   */
  function getRelatedResources(resource: Resource, limit = 4): Resource[] {
    return vaultStore.resources
      .filter(r => r.category === resource.category && r.$id !== resource.$id)
      .slice(0, limit)
  }

  return {
    loadResources,
    getResourceBySlug,
    getRelatedResources,
    resources: computed(() => vaultStore.resources),
    filteredResources: computed(() => vaultStore.filteredResources),
    totalResourceCount: computed(() => vaultStore.totalResourceCount),
    loading: computed(() => vaultStore.loading)
  }
}
