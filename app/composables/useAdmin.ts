import type { Resource, ResourceCode, Category } from '~/types'
import { APPWRITE } from '~/utils/constants'

export function useAdmin() {
  const vaultStore = useVaultStore()
  const toast = useToast()
  const MOCK_MODE = isMockMode()

  // ─── Resources ──────────────────────────────

  async function createResource(
    data: Omit<Resource, '$id' | '$createdAt' | '$updatedAt' | 'thumbnailUrl'>
  ): Promise<Resource | null> {
    try {
      if (MOCK_MODE) {
        await new Promise(resolve => setTimeout(resolve, 300))
        const newResource: Resource = {
          ...data,
          $id: `res-${Date.now()}`,
          $createdAt: new Date().toISOString(),
          $updatedAt: new Date().toISOString()
        }
        vaultStore.setResources([...vaultStore.resources, newResource])
        toast.add({ title: 'Resource created', description: data.title })
        return newResource
      } else {
        const { databases, ID, Permission, Role } = useAppwrite()
        const doc = await databases.createDocument({
          databaseId: APPWRITE.DATABASE_ID,
          collectionId: APPWRITE.COLLECTIONS.RESOURCES,
          documentId: ID.unique(),
          data,
          permissions: [Permission.read(Role.any())]
        })
        const resource = doc as unknown as Resource
        vaultStore.setResources([...vaultStore.resources, resource])
        toast.add({ title: 'Resource created', description: data.title })
        return resource
      }
    } catch (error) {
      console.error('Failed to create resource:', error)
      toast.add({ title: 'Failed to create resource', color: 'error' })
      return null
    }
  }

  async function updateResource(
    id: string,
    data: Partial<Omit<Resource, '$id' | '$createdAt' | '$updatedAt'>>
  ): Promise<Resource | null> {
    try {
      if (MOCK_MODE) {
        await new Promise(resolve => setTimeout(resolve, 300))
        const updated = vaultStore.resources.map(r =>
          r.$id === id ? { ...r, ...data, $updatedAt: new Date().toISOString() } : r
        )
        vaultStore.setResources(updated)
        toast.add({ title: 'Resource updated' })
        return updated.find(r => r.$id === id) ?? null
      } else {
        const { databases } = useAppwrite()
        const doc = await databases.updateDocument({
          databaseId: APPWRITE.DATABASE_ID,
          collectionId: APPWRITE.COLLECTIONS.RESOURCES,
          documentId: id,
          data
        })
        const resource = doc as unknown as Resource
        const updated = vaultStore.resources.map(r => r.$id === id ? resource : r)
        vaultStore.setResources(updated)
        toast.add({ title: 'Resource updated' })
        return resource
      }
    } catch (error) {
      console.error('Failed to update resource:', error)
      toast.add({ title: 'Failed to update resource', color: 'error' })
      return null
    }
  }

  async function deleteResource(id: string): Promise<boolean> {
    try {
      if (MOCK_MODE) {
        await new Promise(resolve => setTimeout(resolve, 300))
        vaultStore.setResources(vaultStore.resources.filter(r => r.$id !== id))
        toast.add({ title: 'Resource deleted' })
        return true
      } else {
        const { databases } = useAppwrite()
        await databases.deleteDocument({
          databaseId: APPWRITE.DATABASE_ID,
          collectionId: APPWRITE.COLLECTIONS.RESOURCES,
          documentId: id
        })
        vaultStore.setResources(vaultStore.resources.filter(r => r.$id !== id))
        toast.add({ title: 'Resource deleted' })
        return true
      }
    } catch (error) {
      console.error('Failed to delete resource:', error)
      toast.add({ title: 'Failed to delete resource', color: 'error' })
      return false
    }
  }

  // ─── Resource Code ──────────────────────────

  async function createResourceCode(
    data: Omit<ResourceCode, '$id' | '$createdAt' | '$updatedAt'>
  ): Promise<ResourceCode | null> {
    try {
      if (MOCK_MODE) {
        await new Promise(resolve => setTimeout(resolve, 200))
        const newCode: ResourceCode = {
          ...data,
          $id: `code-${Date.now()}`,
          $createdAt: new Date().toISOString(),
          $updatedAt: new Date().toISOString()
        }
        toast.add({ title: 'Resource code saved' })
        return newCode
      } else {
        const { databases, ID } = useAppwrite()
        const doc = await databases.createDocument({
          databaseId: APPWRITE.DATABASE_ID,
          collectionId: APPWRITE.COLLECTIONS.RESOURCE_CODE,
          documentId: ID.unique(),
          data
        })
        toast.add({ title: 'Resource code saved' })
        return doc as unknown as ResourceCode
      }
    } catch (error) {
      console.error('Failed to create resource code:', error)
      toast.add({ title: 'Failed to save resource code', color: 'error' })
      return null
    }
  }

  async function updateResourceCode(
    id: string,
    data: Partial<Omit<ResourceCode, '$id' | '$createdAt' | '$updatedAt'>>
  ): Promise<ResourceCode | null> {
    try {
      if (MOCK_MODE) {
        await new Promise(resolve => setTimeout(resolve, 200))
        toast.add({ title: 'Resource code updated' })
        return { $id: id, $createdAt: '', $updatedAt: new Date().toISOString(), resourceId: '', htmlCode: '', cssCode: '', jsCode: '', ...data } as ResourceCode
      } else {
        const { databases } = useAppwrite()
        const doc = await databases.updateDocument({
          databaseId: APPWRITE.DATABASE_ID,
          collectionId: APPWRITE.COLLECTIONS.RESOURCE_CODE,
          documentId: id,
          data
        })
        toast.add({ title: 'Resource code updated' })
        return doc as unknown as ResourceCode
      }
    } catch (error) {
      console.error('Failed to update resource code:', error)
      toast.add({ title: 'Failed to update resource code', color: 'error' })
      return null
    }
  }

  // ─── Categories ─────────────────────────────

  async function createCategory(
    data: Omit<Category, '$id'>
  ): Promise<Category | null> {
    try {
      if (MOCK_MODE) {
        await new Promise(resolve => setTimeout(resolve, 300))
        const newCat: Category = {
          ...data,
          $id: `cat-${Date.now()}`
        }
        vaultStore.setCategories([...vaultStore.categories, newCat])
        toast.add({ title: 'Category created', description: data.name })
        return newCat
      } else {
        const { databases, ID } = useAppwrite()
        const doc = await databases.createDocument({
          databaseId: APPWRITE.DATABASE_ID,
          collectionId: APPWRITE.COLLECTIONS.CATEGORIES,
          documentId: ID.unique(),
          data
        })
        const category = doc as unknown as Category
        vaultStore.setCategories([...vaultStore.categories, category])
        toast.add({ title: 'Category created', description: data.name })
        return category
      }
    } catch (error) {
      console.error('Failed to create category:', error)
      toast.add({ title: 'Failed to create category', color: 'error' })
      return null
    }
  }

  async function updateCategory(
    id: string,
    data: Partial<Omit<Category, '$id'>>
  ): Promise<Category | null> {
    try {
      if (MOCK_MODE) {
        await new Promise(resolve => setTimeout(resolve, 300))
        const updated = vaultStore.categories.map(c =>
          c.$id === id ? { ...c, ...data } : c
        )
        vaultStore.setCategories(updated)
        toast.add({ title: 'Category updated' })
        return updated.find(c => c.$id === id) ?? null
      } else {
        const { databases } = useAppwrite()
        const doc = await databases.updateDocument({
          databaseId: APPWRITE.DATABASE_ID,
          collectionId: APPWRITE.COLLECTIONS.CATEGORIES,
          documentId: id,
          data
        })
        const category = doc as unknown as Category
        const updated = vaultStore.categories.map(c => c.$id === id ? category : c)
        vaultStore.setCategories(updated)
        toast.add({ title: 'Category updated' })
        return category
      }
    } catch (error) {
      console.error('Failed to update category:', error)
      toast.add({ title: 'Failed to update category', color: 'error' })
      return null
    }
  }

  async function deleteCategory(id: string): Promise<boolean> {
    try {
      if (MOCK_MODE) {
        await new Promise(resolve => setTimeout(resolve, 300))
        vaultStore.setCategories(vaultStore.categories.filter(c => c.$id !== id))
        toast.add({ title: 'Category deleted' })
        return true
      } else {
        const { databases } = useAppwrite()
        await databases.deleteDocument({
          databaseId: APPWRITE.DATABASE_ID,
          collectionId: APPWRITE.COLLECTIONS.CATEGORIES,
          documentId: id
        })
        vaultStore.setCategories(vaultStore.categories.filter(c => c.$id !== id))
        toast.add({ title: 'Category deleted' })
        return true
      }
    } catch (error) {
      console.error('Failed to delete category:', error)
      toast.add({ title: 'Failed to delete category', color: 'error' })
      return false
    }
  }

  // ─── Thumbnail Upload ───────────────────────

  async function uploadThumbnail(file: File): Promise<string | null> {
    try {
      if (MOCK_MODE) {
        await new Promise(resolve => setTimeout(resolve, 500))
        toast.add({ title: 'Thumbnail uploaded (mock)' })
        return `mock-file-${Date.now()}`
      } else {
        const { storage, ID } = useAppwrite()
        const result = await storage.createFile({
          bucketId: APPWRITE.BUCKETS.THUMBNAILS,
          fileId: ID.unique(),
          file
        })
        toast.add({ title: 'Thumbnail uploaded' })
        return result.$id
      }
    } catch (error) {
      console.error('Failed to upload thumbnail:', error)
      toast.add({ title: 'Upload failed', color: 'error' })
      return null
    }
  }

  // ─── Stats ──────────────────────────────────

  const stats = computed(() => ({
    resourceCount: vaultStore.resources.length,
    categoryCount: vaultStore.categories.length,
    freeResourceCount: vaultStore.resources.filter(r => r.isFree).length,
    premiumResourceCount: vaultStore.resources.filter(r => !r.isFree).length
  }))

  return {
    createResource,
    updateResource,
    deleteResource,
    createResourceCode,
    updateResourceCode,
    createCategory,
    updateCategory,
    deleteCategory,
    uploadThumbnail,
    stats
  }
}
