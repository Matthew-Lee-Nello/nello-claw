import { query } from '@anthropic-ai/claude-agent-sdk'
import { PROJECT_ROOT, TYPING_REFRESH_MS } from './config.js'
import { logger } from './logger.js'

export interface RunAgentResult {
  text: string | null
  newSessionId?: string
}

export type AgentEvent =
  | { type: 'init'; sessionId: string | undefined }
  | { type: 'thinking'; text?: string }
  | { type: 'text'; text: string }
  | { type: 'tool_use'; name: string; id: string }
  | { type: 'tool_result'; id: string }
  | { type: 'done'; text: string | null }
  | { type: 'error'; error: string }

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
  return runAgentStream(message, sessionId, undefined, onTyping)
}

/**
 * Streaming variant — same return shape as runAgent, but fires onEvent for
 * every SDK event so the dashboard can render incremental output.
 */
export async function runAgentStream(
  message: string,
  sessionId?: string,
  onEvent?: (e: AgentEvent) => void,
  onTyping?: () => void,
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const e = event as any
      if (e.type === 'system' && e.subtype === 'init') {
        newSessionId = e.session_id
        onEvent?.({ type: 'init', sessionId: newSessionId })
        const mcpStatuses = e.mcp_servers
        if (Array.isArray(mcpStatuses)) {
          for (const mcp of mcpStatuses) {
            if (mcp.status && mcp.status !== 'connected') {
              logger.warn({ mcp: mcp.name, status: mcp.status }, 'MCP not connected')
            }
          }
        }
      } else if (e.type === 'assistant') {
        const blocks = e.message?.content ?? []
        for (const block of blocks) {
          if (block.type === 'text' && block.text) {
            onEvent?.({ type: 'text', text: block.text })
          } else if (block.type === 'tool_use') {
            onEvent?.({ type: 'tool_use', name: block.name ?? '', id: block.id ?? '' })
          } else if (block.type === 'thinking' && block.thinking) {
            onEvent?.({ type: 'thinking', text: block.thinking })
          }
        }
      } else if (e.type === 'user') {
        const blocks = e.message?.content ?? []
        for (const block of blocks) {
          if (block.type === 'tool_result') {
            onEvent?.({ type: 'tool_result', id: block.tool_use_id ?? '' })
          }
        }
      } else if (e.type === 'result') {
        text = e.result ?? null
      }
    }

    onEvent?.({ type: 'done', text })
    return { text, newSessionId }
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err)
    onEvent?.({ type: 'error', error: errMsg })
    throw err
  } finally {
    if (typingTimer) clearInterval(typingTimer)
  }
}
