<script setup lang="ts">
import type { Resource } from '~/types'

const props = defineProps<{
  resource: Resource
}>()

const toast = useToast()

// Build code steps dynamically based on what code exists
const codeSteps = computed(() => {
  const steps: { label: string, language: string, code: string, step: number }[] = []
  let step = 0

  // External scripts first (setup)
  if (props.resource.externalScripts && props.resource.externalScripts.length > 0) {
    const scriptTags = props.resource.externalScripts
      .map(src => `<script src="${src}"><` + '/script>')
      .join('\n')
    steps.push({
      label: 'Setup: External Scripts',
      language: 'HTML',
      code: scriptTags,
      step: 0
    })
  }

  if (props.resource.htmlCode) {
    step++
    steps.push({
      label: `Step ${step}: Add HTML`,
      language: 'HTML',
      code: props.resource.htmlCode,
      step
    })
  }

  if (props.resource.cssCode) {
    step++
    steps.push({
      label: `Step ${step}: Add CSS`,
      language: 'CSS',
      code: props.resource.cssCode,
      step
    })
  }

  if (props.resource.jsCode) {
    step++
    steps.push({
      label: `Step ${step}: Add Javascript`,
      language: 'Javascript',
      code: props.resource.jsCode,
      step
    })
  }

  return steps
})

async function copyCode(code: string) {
  try {
    await navigator.clipboard.writeText(code)
    toast.add({ title: 'Copied!', description: 'Code copied to clipboard.' })
  } catch {
    toast.add({ title: 'Copy failed', description: 'Could not copy to clipboard.', color: 'error' })
  }
}
</script>

<template>
  <div class="space-y-6">
    <div
      v-for="codeStep in codeSteps"
      :key="codeStep.label"
      class="space-y-2"
    >
      <h3 class="text-base font-semibold">
        {{ codeStep.label }}
      </h3>

      <div class="relative rounded-lg overflow-hidden border border-default/50 bg-[#1e1e1e]">
        <!-- Header bar -->
        <div class="flex items-center justify-between px-4 py-2 border-b border-white/10">
          <span class="text-xs text-white/50 font-mono">
            {{ codeStep.language }}
          </span>
          <UButton
            icon="i-lucide-copy"
            label="Copy"
            variant="ghost"
            color="neutral"
            size="xs"
            class="text-white/60 hover:text-white"
            @click="copyCode(codeStep.code)"
          />
        </div>

        <!-- Code content -->
        <pre class="p-4 overflow-x-auto text-sm leading-relaxed"><code class="text-white/90 font-mono text-xs">{{ codeStep.code }}</code></pre>
      </div>
    </div>
  </div>
</template>
