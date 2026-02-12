import { mockResources } from '~/utils/mock-data'
import type { Resource } from '~/types'
import { APPWRITE } from '~/utils/constants'

// Auto-detect mock mode
const MOCK_MODE = !import.meta.env.NUXT_PUBLIC_APPWRITE_PROJECT
  || import.meta.env.NUXT_PUBLIC_APPWRITE_PROJECT === ''
  || import.meta.env.NUXT_PUBLIC_APPWRITE_PROJECT === 'placeholder'

export function useResources() {
  const vaultStore = useVaultStore()

  /**
   * Load all resources from Appwrite or mock data
   */
  async function loadResources() {
    if (vaultStore.resources.length > 0) return

    vaultStore.setLoading(true)
    try {
      if (MOCK_MODE) {
        await new Promise(resolve => setTimeout(resolve, 300))
        vaultStore.setResources(mockResources)
      } else {
        const { database, Query } = useAppwrite()
        const result = await database.listDocuments(
          APPWRITE.DATABASE_ID,
          APPWRITE.COLLECTIONS.RESOURCES,
          [Query.orderAsc('sortOrder'), Query.limit(100)]
        )
        // Map documents and resolve thumbnail URLs
        const resources = (result.documents as unknown as Resource[]).map(doc => ({
          ...doc,
          thumbnailUrl: doc.thumbnailFileId
            ? getFilePreviewUrl(doc.thumbnailFileId)
            : undefined
        }))
        vaultStore.setResources(resources)
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

  /**
   * Generate Appwrite storage preview URL for a thumbnail
   */
  function getFilePreviewUrl(fileId: string, width = 400, height = 300): string {
    if (MOCK_MODE || !fileId) return ''
    const { storage } = useAppwrite()
    return storage.getFilePreview(
      APPWRITE.BUCKETS.THUMBNAILS,
      fileId,
      width,
      height
    )
  }

  return {
    loadResources,
    getResourceBySlug,
    getRelatedResources,
    getFilePreviewUrl,
    resources: computed(() => vaultStore.resources),
    filteredResources: computed(() => vaultStore.filteredResources),
    totalResourceCount: computed(() => vaultStore.totalResourceCount),
    loading: computed(() => vaultStore.loading)
  }
}
