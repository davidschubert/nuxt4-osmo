import { createHighlighter, type Highlighter } from 'shiki'

let highlighterInstance: Highlighter | null = null
let highlighterPromise: Promise<Highlighter> | null = null

const LANG_MAP: Record<string, string> = {
  HTML: 'html',
  CSS: 'css',
  Javascript: 'javascript'
}

async function getHighlighter(): Promise<Highlighter> {
  if (highlighterInstance) return highlighterInstance
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ['vitesse-dark'],
      langs: ['html', 'css', 'javascript']
    })
  }
  highlighterInstance = await highlighterPromise
  return highlighterInstance
}

export function useHighlighter() {
  const isReady = ref(false)

  // Preload highlighter on mount
  if (import.meta.client) {
    onMounted(async () => {
      await getHighlighter()
      isReady.value = true
    })
  }

  async function highlightCode(code: string, language: string): Promise<string> {
    const hl = await getHighlighter()
    const lang = LANG_MAP[language] || 'text'
    return hl.codeToHtml(code, { lang, theme: 'vitesse-dark' })
  }

  return { highlightCode, isReady }
}
