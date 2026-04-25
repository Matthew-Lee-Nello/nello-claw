/**
 * Convert Markdown to Telegram HTML subset.
 * Telegram supports: <b> <i> <u> <s> <code> <pre> <a>
 * Everything else gets stripped or escaped.
 */
export function formatForTelegram(text: string): string {
  if (!text) return ''

  // 1. Extract code blocks first so their contents are not mangled
  const codeBlocks: string[] = []
  text = text.replace(/```([a-zA-Z]*)\n?([\s\S]*?)```/g, (_m, _lang, body) => {
    const idx = codeBlocks.length
    codeBlocks.push(`<pre>${escapeHtml(body.trimEnd())}</pre>`)
    return `\u0000CB${idx}\u0000`
  })

  // Inline code
  const inlineCodes: string[] = []
  text = text.replace(/`([^`\n]+)`/g, (_m, body) => {
    const idx = inlineCodes.length
    inlineCodes.push(`<code>${escapeHtml(body)}</code>`)
    return `\u0000IC${idx}\u0000`
  })

  // Escape remaining HTML
  text = escapeHtml(text)

  // Headings to bold
  text = text.replace(/^#{1,6}\s+(.+)$/gm, '<b>$1</b>')

  // Bold
  text = text.replace(/\*\*([^*\n]+)\*\*/g, '<b>$1</b>')
  text = text.replace(/__([^_\n]+)__/g, '<b>$1</b>')

  // Italic (after bold so ** not broken)
  text = text.replace(/(^|\s)\*([^*\n]+)\*(\s|$|[.,!?])/g, '$1<i>$2</i>$3')
  text = text.replace(/(^|\s)_([^_\n]+)_(\s|$|[.,!?])/g, '$1<i>$2</i>$3')

  // Strikethrough
  text = text.replace(/~~([^~\n]+)~~/g, '<s>$1</s>')

  // Links
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')

  // Checkboxes
  text = text.replace(/- \[ \]/g, '☐')
  text = text.replace(/- \[x\]/gi, '☑')

  // Strip horizontal rules
  text = text.replace(/^-{3,}$/gm, '')
  text = text.replace(/^\*{3,}$/gm, '')

  // Restore code
  text = text.replace(/\u0000CB(\d+)\u0000/g, (_m, i) => codeBlocks[parseInt(i, 10)])
  text = text.replace(/\u0000IC(\d+)\u0000/g, (_m, i) => inlineCodes[parseInt(i, 10)])

  return text.trim()
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/**
 * Split text into chunks at or below `limit` without breaking words.
 * Telegram's max message length is 4096.
 */
export function splitMessage(text: string, limit = 4096): string[] {
  if (text.length <= limit) return [text]

  const chunks: string[] = []
  let cursor = 0

  while (cursor < text.length) {
    const end = Math.min(cursor + limit, text.length)
    if (end === text.length) { chunks.push(text.slice(cursor)); break }

    let split = text.lastIndexOf('\n', end)
    if (split <= cursor) split = text.lastIndexOf(' ', end)
    if (split <= cursor) split = end

    chunks.push(text.slice(cursor, split))
    cursor = split
    while (text[cursor] === '\n' || text[cursor] === ' ') cursor++
  }

  return chunks
}
