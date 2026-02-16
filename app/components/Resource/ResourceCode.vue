<script setup lang="ts">
import DOMPurify from 'isomorphic-dompurify'
import type { ResourceCode } from '~/types'

const props = defineProps<{
  code: ResourceCode
  externalScripts?: string[]
}>()

const toast = useToast()
const { highlightCode, isReady } = useHighlighter()

// Build code steps dynamically based on what code exists
const codeSteps = computed(() => {
  const steps: { label: string, language: string, code: string, step: number }[] = []
  let step = 0

  // External scripts first (setup)
  if (props.externalScripts && props.externalScripts.length > 0) {
    const scriptTags = props.externalScripts
      .map(src => `<script src="${src}"><` + '/script>')
      .join('\n')
    steps.push({
      label: 'Setup: External Scripts',
      language: 'HTML',
      code: scriptTags,
      step: 0
    })
  }

  if (props.code.htmlCode) {
    step++
    steps.push({
      label: `Step ${step}: Add HTML`,
      language: 'HTML',
      code: props.code.htmlCode,
      step
    })
  }

  if (props.code.cssCode) {
    step++
    steps.push({
      label: `Step ${step}: Add CSS`,
      language: 'CSS',
      code: props.code.cssCode,
      step
    })
  }

  if (props.code.jsCode) {
    step++
    steps.push({
      label: `Step ${step}: Add Javascript`,
      language: 'Javascript',
      code: props.code.jsCode,
      step
    })
  }

  return steps
})

// Highlighted HTML for each code step
const highlightedBlocks = ref<Map<string, string>>(new Map())

watch(
  [codeSteps, isReady],
  async () => {
    if (!isReady.value) return
    const newMap = new Map<string, string>()
    for (const step of codeSteps.value) {
      try {
        const html = await highlightCode(step.code, step.language)
        // Sanitize highlighted HTML — allow only syntax highlighting tags
        const sanitized = DOMPurify.sanitize(html, {
          ALLOWED_TAGS: ['pre', 'code', 'span', 'br', 'div'],
          ALLOWED_ATTR: ['class', 'style']
        })
        newMap.set(step.label, sanitized)
      } catch {
        // Fallback: no highlighting
      }
    }
    highlightedBlocks.value = newMap
  },
  { immediate: true }
)

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

        <!-- Code content: highlighted or fallback -->
        <div
          v-if="highlightedBlocks.get(codeStep.label)"
          class="p-4 overflow-x-auto text-sm leading-relaxed [&_pre]:!bg-transparent [&_pre]:!m-0 [&_pre]:!p-0 [&_code]:text-xs [&_code]:font-mono"
          v-html="highlightedBlocks.get(codeStep.label)"
        />
        <pre
          v-else
          class="p-4 overflow-x-auto text-sm leading-relaxed"
        ><code class="text-white/90 font-mono text-xs">{{ codeStep.code }}</code></pre>
      </div>
    </div>
  </div>
</template>
