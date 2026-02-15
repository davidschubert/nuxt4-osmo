import { describe, it, expect, beforeEach } from 'vitest'
import { mockResources, mockCategories } from '~/utils/mock-data'

describe('useSearch', () => {
  beforeEach(() => {
    const vaultStore = useVaultStore()
    vaultStore.setResources(mockResources)
    vaultStore.setCategories(mockCategories)
    vaultStore.setSearchQuery('')
  })

  it('searchQuery reflects store state', () => {
    const { searchQuery } = useSearch()
    expect(searchQuery.value).toBe('')

    searchQuery.value = 'button'
    const vaultStore = useVaultStore()
    expect(vaultStore.searchQuery).toBe('button')
  })

  it('isSearching is true when query has content', () => {
    // Pre-set the store with a query before creating the composable
    const vaultStore = useVaultStore()
    vaultStore.setSearchQuery('test')

    const { isSearching } = useSearch()
    expect(isSearching.value).toBe(true)
  })

  it('isSearching is false for whitespace-only query', () => {
    const { searchQuery, isSearching } = useSearch()
    searchQuery.value = '   '
    expect(isSearching.value).toBe(false)
  })

  it('clearSearch resets query', () => {
    const { searchQuery, clearSearch } = useSearch()
    searchQuery.value = 'something'
    clearSearch()
    expect(searchQuery.value).toBe('')
  })

  it('searchGroups returns 3 groups', () => {
    const { searchGroups } = useSearch()
    expect(searchGroups.value).toHaveLength(3)
    expect(searchGroups.value.map(g => g.id)).toEqual(['resources', 'categories', 'pages'])
  })

  it('searchGroups resource items have correct paths', () => {
    const { searchGroups } = useSearch()
    const resourceGroup = searchGroups.value.find(g => g.id === 'resources')!
    const firstItem = resourceGroup.items[0]
    expect(firstItem.to).toBe(`/vault/${mockResources[0].slug}`)
    expect(firstItem.title).toBe(mockResources[0].title)
    expect(firstItem.id).toBe(mockResources[0].$id)
  })

  it('searchGroups category items have correct query paths', () => {
    const { searchGroups } = useSearch()
    const categoryGroup = searchGroups.value.find(g => g.id === 'categories')!
    const firstCat = categoryGroup.items[0]
    expect(firstCat.to).toBe(`/vault?category=${mockCategories[0].slug}`)
    expect(firstCat.title).toBe(mockCategories[0].name)
  })

  it('searchGroups pages group has vault, plans, account', () => {
    const { searchGroups } = useSearch()
    const pagesGroup = searchGroups.value.find(g => g.id === 'pages')!
    const pagePaths = pagesGroup.items.map(p => p.to)
    expect(pagePaths).toContain('/vault')
    expect(pagePaths).toContain('/plans')
    expect(pagePaths).toContain('/account')
  })

  it('commandPaletteGroups transforms title to label', () => {
    const { commandPaletteGroups } = useSearch()
    const firstGroup = commandPaletteGroups.value[0]
    expect(firstGroup.label).toBe('Resources')
    expect(firstGroup.items[0].label).toBe(mockResources[0].title)
    // Should not have 'title' property
    expect('title' in firstGroup.items[0]).toBe(false)
  })
})
