import { mockResources, mockResourceCodes } from '~/utils/mock-data'
import type { Resource, ResourceCode } from '~/types'
import { APPWRITE } from '~/utils/constants'

export function useResources() {
  const vaultStore = useVaultStore()
  const MOCK_MODE = isMockMode()

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
        const { databases, Query } = useAppwrite()
        const result = await databases.listDocuments({
          databaseId: APPWRITE.DATABASE_ID,
          collectionId: APPWRITE.COLLECTIONS.RESOURCES,
          queries: [Query.orderAsc('sortOrder'), Query.limit(100)]
        })
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
      const toast = useToast()
      toast.add({ title: 'Loading failed', description: 'Could not load resources. Please try again.', color: 'error' })
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
   * Get the code for a resource (from separate resource-code collection)
   */
  async function getResourceCode(resourceId: string): Promise<ResourceCode | null> {
    try {
      if (MOCK_MODE) {
        await new Promise(resolve => setTimeout(resolve, 100))
        return mockResourceCodes.find(c => c.resourceId === resourceId) ?? null
      } else {
        const { databases, Query } = useAppwrite()
        const result = await databases.listDocuments({
          databaseId: APPWRITE.DATABASE_ID,
          collectionId: APPWRITE.COLLECTIONS.RESOURCE_CODE,
          queries: [Query.equal('resourceId', resourceId), Query.limit(1)]
        })
        if (result.documents.length === 0) return null
        return result.documents[0] as unknown as ResourceCode
      }
    } catch (error) {
      console.error('Failed to load resource code:', error)
      const toast = useToast()
      toast.add({ title: 'Loading failed', description: 'Could not load resource code.', color: 'error' })
      return null
    }
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
    return storage.getFilePreview({
      bucketId: APPWRITE.BUCKETS.THUMBNAILS,
      fileId,
      width,
      height
    })
  }

  return {
    loadResources,
    getResourceBySlug,
    getResourceCode,
    getRelatedResources,
    getFilePreviewUrl,
    resources: computed(() => vaultStore.resources),
    filteredResources: computed(() => vaultStore.filteredResources),
    totalResourceCount: computed(() => vaultStore.totalResourceCount),
    loading: computed(() => vaultStore.loading)
  }
}
