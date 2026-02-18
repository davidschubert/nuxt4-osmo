/**
 * Simple markdown to HTML renderer for implementation notes.
 * DOMPurify is loaded lazily to avoid SSR breakage (it requires `document`).
 */

// Lazy-loaded DOMPurify instance (client-only)
let _DOMPurify: { sanitize: (dirty: string, config?: Record<string, unknown>) => string } | null = null

/**
 * Initialize DOMPurify. Call this on the client before using renderMarkdown().
 * Safe to call multiple times (no-op after first load).
 */
export async function initDOMPurify() {
  if (_DOMPurify) return
  if (!import.meta.client) return
  const mod = await import('isomorphic-dompurify')
  _DOMPurify = mod.default
}

/**
 * Escape HTML entities to prevent XSS in user-supplied text
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

/**
 * Simple markdown to HTML renderer for implementation notes.
 * Handles headings, paragraphs, inline code, bold, and newlines.
 * All output is sanitized with DOMPurify when available (client-side).
 * On SSR, returns escaped HTML without DOMPurify (safe because escapeHtml is applied first).
 */
export function renderMarkdown(markdown: string): string {
  // Split into lines for per-line processing
  const lines = markdown.split('\n')
  const processedLines = lines.map((line) => {
    // Check if this line is a heading
    const h4 = line.match(/^### (.+)$/)
    if (h4) {
      return `<h4 class="text-base font-semibold mt-4 mb-2">${escapeHtml(h4[1] ?? '')}</h4>`
    }

    const h3 = line.match(/^## (.+)$/)
    if (h3) {
      return `<h3 class="text-lg font-semibold mt-6 mb-2">${escapeHtml(h3[1] ?? '')}</h3>`
    }

    const h2 = line.match(/^# (.+)$/)
    if (h2) {
      return `<h2 class="text-xl font-bold mt-6 mb-3">${escapeHtml(h2[1] ?? '')}</h2>`
    }

    // Empty lines
    if (!line.trim()) return ''

    // Regular text: escape first, then apply inline formatting
    let escaped = escapeHtml(line)

    // Inline code (backticks) — content is already escaped
    escaped = escaped.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-muted text-xs font-mono">$1</code>')

    // Bold
    escaped = escaped.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')

    // Wrap in paragraph
    return `<p class="text-sm text-muted leading-relaxed mb-2">${escaped}</p>`
  })

  const html = processedLines.filter(Boolean).join('\n')

  // Final DOMPurify pass for defense-in-depth (client-only)
  if (_DOMPurify) {
    return _DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['h2', 'h3', 'h4', 'p', 'code', 'strong', 'br'],
      ALLOWED_ATTR: ['class']
    })
  }

  // SSR fallback — content is already escaped via escapeHtml()
  return html
}
