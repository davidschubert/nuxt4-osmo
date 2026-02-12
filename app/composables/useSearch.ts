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

  return {
    searchQuery,
    isSearching,
    clearSearch
  }
}
