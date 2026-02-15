import type { SearchGroup } from '~/types'

export function useSearch() {
  const vaultStore = useVaultStore()

  const searchQuery = computed({
    get: () => vaultStore.searchQuery,
    set: (value: string) => vaultStore.setSearchQuery(value)
  })

  const isSearching = computed(() => searchQuery.value.trim().length > 0)

  function clearSearch() {
    vaultStore.setSearchQuery('')
  }

  /**
   * Build search groups for the command palette (UDashboardSearch)
   * Groups resources by category for structured search results
   */
  const searchGroups = computed<SearchGroup[]>(() => {
    const resources = vaultStore.resources
    const categories = vaultStore.categories

    // Resource group – search by title, description, tags
    const resourceItems = resources.map(r => ({
      id: r.$id,
      title: r.title,
      description: r.description,
      to: `/vault/${r.slug}`,
      icon: categories.find(c => c.$id === r.category)?.icon || 'i-lucide-file',
      category: categories.find(c => c.$id === r.category)?.name
    }))

    // Category group – navigate to filtered view
    const categoryItems = categories.map(c => ({
      id: c.$id,
      title: c.name,
      description: `Browse ${c.name} resources`,
      to: `/vault?category=${c.slug}`,
      icon: c.icon
    }))

    // Page group – static navigation links
    const pageItems = [
      { id: 'page-vault', title: 'The Vault', to: '/vault', icon: 'i-lucide-layout-grid' },
      { id: 'page-plans', title: 'Plans', to: '/plans', icon: 'i-lucide-credit-card' },
      { id: 'page-account', title: 'Account Settings', to: '/account', icon: 'i-lucide-user' }
    ]

    return [
      { id: 'resources', label: 'Resources', items: resourceItems },
      { id: 'categories', label: 'Categories', items: categoryItems },
      { id: 'pages', label: 'Pages', items: pageItems }
    ]
  })

  /**
   * Transform search groups into CommandPalette-compatible groups
   */
  const commandPaletteGroups = computed(() => {
    return searchGroups.value.map(group => ({
      id: group.id,
      label: group.label,
      items: group.items.map(item => ({
        id: item.id,
        label: item.title,
        description: item.description,
        icon: item.icon,
        to: item.to
      }))
    }))
  })

  return {
    searchQuery,
    isSearching,
    clearSearch,
    searchGroups,
    commandPaletteGroups
  }
}
