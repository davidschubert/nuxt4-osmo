<script setup lang="ts">
const { commandPaletteGroups } = useSearch()
const router = useRouter()

function onSelect(item: { to?: string }) {
  if (item.to) {
    router.push(item.to)
  }
}
</script>

<template>
  <UDashboardSearch
    placeholder="Search for pages or resources"
    :groups="commandPaletteGroups"
    :fuse="{
      fuseOptions: {
        keys: ['label', 'description'],
        threshold: 0.3
      },
      resultLimit: 10
    }"
    @select="onSelect"
  />
</template>
