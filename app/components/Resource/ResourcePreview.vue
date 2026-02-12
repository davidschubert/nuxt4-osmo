<script setup lang="ts">
import type { Resource } from '~/types'

const props = defineProps<{
  resource: Resource
}>()

const closingScript = '<' + '/script>'

// Generate preview HTML combining all code
const previewHtml = computed(() => {
  const scripts = (props.resource.externalScripts || [])
    .map(src => `<script src="${src}">${closingScript}`)
    .join('\n')

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: #f5f0eb;
      font-family: system-ui, -apple-system, sans-serif;
    }
    ${props.resource.cssCode}
  </style>
</head>
<body>
  ${props.resource.htmlCode}
  ${scripts}
  <script>${props.resource.jsCode}${closingScript}
</body>
</html>`
})
</script>

<template>
  <div class="relative rounded-xl overflow-hidden border border-default/50 bg-muted">
    <iframe
      :srcdoc="previewHtml"
      class="w-full aspect-[16/9] border-0"
      sandbox="allow-scripts"
      loading="lazy"
      title="Resource preview"
    />
  </div>
</template>
