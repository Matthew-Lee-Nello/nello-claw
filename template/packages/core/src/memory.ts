import { saveMemory, searchMemories, getRecentMemories, touchMemory, type Memory } from './db.js'
import { logger } from './logger.js'

const SEMANTIC_PATTERNS = [
  /\b(my|i am|i'm|i prefer|remember|always|never)\b/i,
  /\b(i like|i don't like|i hate|i love)\b/i,
  /\b(my name is|call me|i work|i live)\b/i,
  /\b(my goal|my project|my business)\b/i,
]

function isSemanticContent(text: string): boolean {
  return SEMANTIC_PATTERNS.some(p => p.test(text))
}

/**
 * Build memory context to inject above the user's message.
 * Combines FTS keyword search + recent-access list. Dedupes. Touches each.
 */
export async function buildMemoryContext(chatId: string, userMessage: string): Promise<string> {
  const seen = new Set<number>()
  const memories: Memory[] = []

  for (const mem of searchMemories(chatId, userMessage, 3)) {
    if (!seen.has(mem.id)) { memories.push(mem); seen.add(mem.id) }
  }

  for (const mem of getRecentMemories(chatId, 5)) {
    if (!seen.has(mem.id)) { memories.push(mem); seen.add(mem.id) }
  }

  if (memories.length === 0) return ''

  for (const mem of memories) touchMemory(mem.id)

  const lines = memories.map(m => `- ${m.content} (${m.sector})`).join('\n')
  return `[Memory context]\n${lines}\n`
}

/**
 * Save a conversation turn.
 * Skip very short messages and commands. Route to semantic or episodic based on signals.
 */
export async function saveConversationTurn(chatId: string, userMsg: string, assistantMsg: string): Promise<void> {
  const combined = `User: ${userMsg}\nAssistant: ${assistantMsg}`

  if (userMsg.length <= 20) return
  if (userMsg.trim().startsWith('/')) return

  const sector: 'semantic' | 'episodic' = isSemanticContent(userMsg) ? 'semantic' : 'episodic'

  try {
    saveMemory(chatId, combined, sector)
    logger.debug({ chatId, sector, len: combined.length }, 'Memory saved')
  } catch (err) {
    logger.warn({ err }, 'Memory save failed')
  }
}

export { decayMemories } from './db.js'
