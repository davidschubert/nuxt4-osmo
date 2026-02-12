/**
 * Simple markdown to HTML renderer for implementation notes.
 * Handles headings, paragraphs, inline code, bold, and newlines.
 * Will be replaced with a proper renderer (e.g. markdown-it) if needed.
 */
export function renderMarkdown(markdown: string): string {
  return markdown
    // Headings
    .replace(/^### (.+)$/gm, '<h4 class="text-base font-semibold mt-4 mb-2">$1</h4>')
    .replace(/^## (.+)$/gm, '<h3 class="text-lg font-semibold mt-6 mb-2">$1</h3>')
    .replace(/^# (.+)$/gm, '<h2 class="text-xl font-bold mt-6 mb-3">$1</h2>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-muted text-xs font-mono">$1</code>')
    // Bold
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    // Paragraphs (lines that aren't headings)
    .replace(/^(?!<[h])((?!<).+)$/gm, '<p class="text-sm text-muted leading-relaxed mb-2">$1</p>')
    // Clean up empty paragraphs
    .replace(/<p class="[^"]*"><\/p>/g, '')
}
