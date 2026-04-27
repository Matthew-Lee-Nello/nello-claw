/**
 * Daemon control singleton - tracks Telegram bot lifecycle so the dashboard
 * can show running/paused state and pause/resume from the UI.
 *
 * The bot itself is owned by template/src/index.ts. This module just holds
 * the runtime flags and the bot reference. The restart loop in index.ts
 * checks isTelegramPaused() before each polling attempt.
 */

import { logger } from './logger.js'
import {
  TELEGRAM_BOT_TOKEN, ALLOWED_CHAT_IDS,
  WEBEX_BOT_TOKEN, ALLOWED_WEBEX_EMAILS,
} from './config.js'

// Structural types so we don't drag grammy or webex-node-bot-framework into @nc/core.
// The real bot/handle instances are passed in by template/src/index.ts.
interface BotLike {
  stop(): Promise<void>
  api: { getMe(): Promise<{ username?: string }> }
}

interface WebexHandle {
  stop(): Promise<void>
  start?(): Promise<void>
}

interface TelegramRuntime {
  bot: BotLike | null
  running: boolean
  paused: boolean
  lastError: string | null
  username: string | null
}

interface WebexRuntime {
  handle: WebexHandle | null
  running: boolean
  paused: boolean
  lastError: string | null
}

const tg: TelegramRuntime = { bot: null, running: false, paused: false, lastError: null, username: null }
const wx: WebexRuntime = { handle: null, running: false, paused: false, lastError: null }

// ----- Telegram -----

export function registerTelegramBot(bot: BotLike): void {
  tg.bot = bot
  bot.api.getMe().then((me: { username?: string }) => { tg.username = me.username ?? null }).catch(() => {})
}

export function setTelegramRunning(running: boolean): void { tg.running = running }
export function setTelegramError(err: string | null): void { tg.lastError = err }
export function isTelegramPaused(): boolean { return tg.paused }

export async function pauseTelegram(): Promise<void> {
  tg.paused = true
  if (tg.bot && tg.running) {
    try {
      await tg.bot.stop()
      logger.info('[daemon-control] Telegram bot stopped via pause request')
    } catch (err) {
      logger.warn({ err }, '[daemon-control] Telegram stop failed')
    }
  }
}

export function resumeTelegram(): void {
  tg.paused = false
  tg.lastError = null
  logger.info('[daemon-control] Telegram resume requested')
}

export function getTelegramState() {
  return {
    configured: !!TELEGRAM_BOT_TOKEN,
    chatIdConfigured: ALLOWED_CHAT_IDS.length > 0,
    running: tg.running,
    paused: tg.paused,
    lastError: tg.lastError,
    username: tg.username,
  }
}

// ----- Webex -----

export function registerWebexHandle(handle: WebexHandle | null): void { wx.handle = handle }
export function setWebexRunning(running: boolean): void { wx.running = running }
export function setWebexError(err: string | null): void { wx.lastError = err }
export function isWebexPaused(): boolean { return wx.paused }

export async function pauseWebex(): Promise<void> {
  wx.paused = true
  if (wx.handle && wx.running) {
    try {
      await wx.handle.stop()
      wx.running = false
      logger.info('[daemon-control] Webex stopped via pause request')
    } catch (err) {
      logger.warn({ err }, '[daemon-control] Webex stop failed')
      wx.lastError = err instanceof Error ? err.message : String(err)
    }
  }
}

export async function resumeWebex(): Promise<void> {
  wx.paused = false
  wx.lastError = null
  if (wx.handle && !wx.running) {
    try {
      if (wx.handle.start) {
        await wx.handle.start()
        wx.running = true
        logger.info('[daemon-control] Webex resumed')
      }
    } catch (err) {
      wx.lastError = err instanceof Error ? err.message : String(err)
      logger.error({ err }, '[daemon-control] Webex resume failed')
    }
  }
}

export function getWebexState() {
  return {
    configured: !!WEBEX_BOT_TOKEN,
    emailsConfigured: ALLOWED_WEBEX_EMAILS.length > 0,
    running: wx.running,
    paused: wx.paused,
    lastError: wx.lastError,
  }
}
