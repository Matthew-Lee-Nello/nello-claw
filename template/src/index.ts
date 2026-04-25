/**
 * nello-claw daemon entrypoint.
 * Runs the Telegram bot, scheduler, and dashboard under a single process.
 */

import { writeFileSync, existsSync, readFileSync, unlinkSync } from 'node:fs'
import { join } from 'node:path'
import { initDatabase, decayMemories, logger, PROJECT_ROOT, STORE_DIR, TELEGRAM_BOT_TOKEN, ALLOWED_CHAT_IDS } from '@nc/core'
import { createBot } from '@nc/bot-telegram'
import { initScheduler, stopScheduler } from '@nc/scheduler'
import { startDashboard } from '@nc/dashboard/server'
import * as voiceOnline from '@nc/voice-online'

const PID_FILE = join(STORE_DIR, 'clawd.pid')

function acquireLock(): void {
  if (existsSync(PID_FILE)) {
    const oldPid = parseInt(readFileSync(PID_FILE, 'utf-8').trim(), 10)
    if (oldPid && oldPid !== process.pid) {
      try {
        process.kill(oldPid, 0)
        logger.warn({ oldPid }, 'killing stale instance')
        try { process.kill(oldPid, 'SIGTERM') } catch {}
      } catch {
        // Process not running, lock is stale
      }
    }
  }
  writeFileSync(PID_FILE, String(process.pid))
}

function releaseLock(): void {
  try { unlinkSync(PID_FILE) } catch {}
}

async function main() {
  logger.info('nello-claw starting')

  initDatabase()
  acquireLock()

  // Daily decay sweep
  decayMemories()
  const decayTimer = setInterval(decayMemories, 24 * 60 * 60 * 1000)

  // Start dashboard
  const dashboard = startDashboard()

  // Start bot if configured
  let bot: ReturnType<typeof createBot> | null = null
  if (TELEGRAM_BOT_TOKEN) {
    bot = createBot({
      transcribeAudio: voiceOnline.transcribeAudio,
      // TTS not wired in online mode. Install @nc/voice-local for Piper TTS.
    })

    const sender = async (chatId: string, text: string) => {
      if (!bot) return
      try { await bot.api.sendMessage(chatId, text) } catch (err) { logger.error({ err }, 'send failed') }
    }

    initScheduler(sender)
    bot.start({ drop_pending_updates: true }).catch(err => {
      logger.error({ err }, 'bot.start failed')
    })
    logger.info({ chats: ALLOWED_CHAT_IDS.length }, 'Telegram bot started')
  } else {
    logger.warn('TELEGRAM_BOT_TOKEN missing - bot disabled, dashboard only')
  }

  // Shutdown
  const shutdown = async () => {
    logger.info('shutting down')
    clearInterval(decayTimer)
    stopScheduler()
    dashboard.close()
    if (bot) await bot.stop()
    releaseLock()
    process.exit(0)
  }

  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)
  process.on('uncaughtException', (err) => {
    logger.error({ err }, 'uncaught exception')
  })
  process.on('unhandledRejection', (err) => {
    logger.error({ err }, 'unhandled rejection')
  })
}

main().catch((err) => {
  logger.error({ err }, 'fatal')
  releaseLock()
  process.exit(1)
})
