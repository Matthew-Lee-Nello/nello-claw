/**
 * Webex transport for nello-claw — second inbound channel alongside Telegram.
 *
 * Uses webex-node-bot-framework (outbound websocket, no public URL needed).
 * Mirrors prod's webex-bot.ts pattern, minus the client-knowledge layer
 * (template doesn't ship with that). Falls back to plain runAgent + memory.
 */

import { createRequire } from 'module'
import {
  WEBEX_BOT_TOKEN,
  ALLOWED_WEBEX_EMAILS,
  logger,
  runAgent,
  buildMemoryContext,
  saveConversationTurn,
  getSession,
  setSession,
} from '@nc/core'

const WEBEX_MAX_MESSAGE_LENGTH = 7000

// Reuse the ai-humanizer same way bot-telegram does (best-effort, optional)
const require = createRequire(import.meta.url)
const humanizerPath = `${process.env.HOME}/.claude/skills/ai-humanizer/src/humanizer.js`
let autoFixText: ((text: string) => { text: string; fixes: string[] }) | null = null
try {
  const humanizer = require(humanizerPath)
  autoFixText = humanizer.autoFix
  logger.info('[webex] AI humanizer loaded')
} catch {
  logger.debug('[webex] AI humanizer not available')
}

interface WebexTrigger {
  text: string
  message: { id: string; roomId: string; markdown?: string }
  person: { id: string; emails: string[]; displayName?: string }
  room: { id: string; type?: string }
}

interface WebexBotShim {
  say(payload: string | { markdown?: string; text?: string }): Promise<unknown>
  room: { id: string }
}

export interface WebexFrameworkShim {
  start(): Promise<void>
  stop(): Promise<void>
  on(event: string, handler: (...args: unknown[]) => void): void
  hears(
    pattern: RegExp | string,
    handler: (bot: WebexBotShim, trigger: WebexTrigger) => void | Promise<void>,
  ): void
}

function isWebexAuthorized(emails: string[]): boolean {
  if (ALLOWED_WEBEX_EMAILS.length === 0) return false
  return emails.some(e => ALLOWED_WEBEX_EMAILS.includes(e.toLowerCase()))
}

function splitWebexMessage(text: string, limit = WEBEX_MAX_MESSAGE_LENGTH): string[] {
  if (text.length <= limit) return [text]
  const chunks: string[] = []
  let remaining = text
  while (remaining.length > 0) {
    if (remaining.length <= limit) { chunks.push(remaining); break }
    let splitAt = remaining.lastIndexOf('\n', limit)
    if (splitAt < limit / 2) splitAt = remaining.lastIndexOf(' ', limit)
    if (splitAt < limit / 2) splitAt = limit
    chunks.push(remaining.slice(0, splitAt))
    remaining = remaining.slice(splitAt).trimStart()
  }
  return chunks
}

async function deleteWebexMessage(messageId: string): Promise<void> {
  try {
    const res = await fetch(`https://webexapis.com/v1/messages/${messageId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${WEBEX_BOT_TOKEN}` },
    })
    if (!res.ok && res.status !== 404) {
      logger.debug({ status: res.status, messageId }, '[webex] placeholder delete returned non-204')
    }
  } catch (err) {
    logger.debug({ err, messageId }, '[webex] placeholder delete failed (non-fatal)')
  }
}

async function handleWebexMessage(bot: WebexBotShim, trigger: WebexTrigger): Promise<void> {
  const senderEmails = trigger.person?.emails ?? []
  const roomId = trigger.room?.id ?? trigger.message?.roomId

  if (!isWebexAuthorized(senderEmails)) {
    logger.warn({ senderEmails }, '[webex] unauthorized sender — dropping message')
    return
  }
  if (!roomId) {
    logger.error('[webex] trigger missing roomId — dropping message')
    return
  }

  const chatId = `webex:${roomId}`
  const rawText = trigger.text ?? ''
  if (!rawText.trim()) return

  logger.info({ chatId, textLength: rawText.length, sender: senderEmails[0] }, '[webex] handling message')

  let placeholderId: string | null = null
  try {
    const placeholder = await bot.say({ markdown: '_⏳ thinking..._' }) as { id?: string }
    placeholderId = placeholder?.id ?? null
  } catch {
    // non-fatal
  }

  try {
    const memoryContext = await buildMemoryContext(chatId, rawText)
    const fullMessage = memoryContext + rawText
    const sessionId = getSession(chatId) ?? undefined

    const result = await runAgent(fullMessage, sessionId)
    if (result.newSessionId) setSession(chatId, result.newSessionId)

    if (result.text) {
      await saveConversationTurn(chatId, rawText, result.text)
      let responseText = result.text
      if (autoFixText) {
        try {
          const fixed = autoFixText(responseText)
          if (fixed.fixes.length > 0) responseText = fixed.text
        } catch {}
      }

      if (placeholderId) {
        await deleteWebexMessage(placeholderId)
        placeholderId = null
      }

      const chunks = splitWebexMessage(responseText)
      for (const chunk of chunks) {
        try { await bot.say({ markdown: chunk }) }
        catch { await bot.say(chunk) }
      }
    } else {
      if (placeholderId) await deleteWebexMessage(placeholderId)
      await bot.say('No response generated.')
    }
  } catch (error) {
    logger.error({ error, chatId }, '[webex] message handling error')
    const errMsg = error instanceof Error ? error.message : String(error)
    if (placeholderId) await deleteWebexMessage(placeholderId)
    try { await bot.say(`Error: ${errMsg.slice(0, 200)}`) } catch {}
  }
}

export async function createWebexBot(): Promise<WebexFrameworkShim | null> {
  if (!WEBEX_BOT_TOKEN) {
    logger.info('[webex] WEBEX_BOT_TOKEN not set — Webex transport disabled')
    return null
  }

  // Node 24+ exposes globalThis.navigator as a read-only getter; the webex SDK
  // tries to assign at import time. Redefine writable before the dynamic import.
  try {
    Object.defineProperty(globalThis, 'navigator', {
      value: (globalThis as unknown as { navigator?: unknown }).navigator ?? {},
      writable: true,
      configurable: true,
    })
  } catch { /* already writable */ }

  const mod = await import('webex-node-bot-framework') as unknown as {
    default: new (opts: Record<string, unknown>) => WebexFrameworkShim
  }
  const Framework = mod.default
  const framework = new Framework({
    token: WEBEX_BOT_TOKEN,
    removeDeviceRegistrationsOnStart: true,
    messageFormat: 'markdown',
  })

  framework.on('initialized', () => {
    logger.info('[webex] framework initialized — listening for DMs')
  })
  framework.on('log', (msg: unknown) => {
    logger.debug({ msg }, '[webex] framework log')
  })
  framework.hears(/.*/, async (bot, trigger) => {
    await handleWebexMessage(bot, trigger)
  })

  await framework.start()
  logger.info('[webex] bot connected')
  return framework
}
