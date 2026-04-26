import { query } from '@anthropic-ai/claude-agent-sdk'
import { PROJECT_ROOT, TYPING_REFRESH_MS } from './config.js'
import { logger } from './logger.js'

export interface RunAgentResult {
  text: string | null
  newSessionId?: string
}

/**
 * Run one turn of Claude Code.
 * - Uses bypassPermissions (unattended operation)
 * - Loads CLAUDE.md from PROJECT_ROOT + user global skills from ~/.claude/
 * - onTyping fires every TYPING_REFRESH_MS while waiting for the result event
 */
export async function runAgent(
  message: string,
  sessionId?: string,
  onTyping?: () => void
): Promise<RunAgentResult> {
  let typingTimer: NodeJS.Timeout | null = null
  if (onTyping) {
    typingTimer = setInterval(() => {
      try { onTyping() } catch { /* ignore */ }
    }, TYPING_REFRESH_MS)
  }

  try {
    const generator = query({
      prompt: message,
      options: {
        cwd: PROJECT_ROOT,
        resume: sessionId,
        settingSources: ['project', 'user'],
        permissionMode: 'bypassPermissions',
      },
    })

    let newSessionId: string | undefined
    let text: string | null = null

    for await (const event of generator) {
      if (event.type === 'system' && event.subtype === 'init') {
        newSessionId = (event as any).session_id
        const mcpStatuses = (event as any).mcp_servers
        if (Array.isArray(mcpStatuses)) {
          for (const mcp of mcpStatuses) {
            if (mcp.status && mcp.status !== 'connected') {
              logger.warn({ mcp: mcp.name, status: mcp.status }, 'MCP not connected')
            }
          }
        }
      }
      if (event.type === 'result') {
        // SDK shape: { type: 'result', subtype: 'success'|'error_*', result: string, ... }
        // event.result IS the assistant's text (a string), not an object with a .result field.
        // Earlier code did event.result?.result which always returned undefined -> "(no response)".
        text = (event as any).result ?? null
      }
    }

    return { text, newSessionId }
  } finally {
    if (typingTimer) clearInterval(typingTimer)
  }
}
