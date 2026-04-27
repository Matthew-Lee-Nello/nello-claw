/**
 * nello-claw daemon entrypoint.
 * Runs the Telegram bot, scheduler, and dashboard under a single process.
 */

import { writeFileSync, existsSync, readFileSync, unlinkSync } from 'node:fs'
import { join } from 'node:path'
import { initDatabase, runDecaySweep, logger, PROJECT_ROOT, STORE_DIR, TELEGRAM_BOT_TOKEN, ALLOWED_CHAT_IDS, registerTelegramBot, setTelegramRunning, setTelegramError, isTelegramPaused } from '@nc/core'
import { createBot, discoverChatId } from '@nc/bot-telegram'
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

  // Daily decay sweep + snapshot writer (vault/Memory/Daily/<date>.md)
  runDecaySweep()
  const decayTimer = setInterval(runDecaySweep, 24 * 60 * 60 * 1000)

  // Start dashboard
  const dashboard = startDashboard()

  // Discovery mode: no chat ID yet → wait for first Telegram message, capture, restart.
  if (TELEGRAM_BOT_TOKEN && ALLOWED_CHAT_IDS.length === 0) {
    logger.info('chat ID missing - entering discovery mode')
    const captured = await discoverChatId()
    if (captured !== null) {
      logger.info({ chatId: captured }, 'discovery complete - exiting for service restart')
      releaseLock()
      // Service manager (launchctl/schtasks/systemd) will relaunch us with new env
      process.exit(0)
    }
    logger.warn('discovery timed out - continuing without chat ID, bot disabled')
  }

  // Start bot if configured. Restart loop is pause-aware - the dashboard can
  // call /api/daemons/telegram/{stop,start} to flip the paused flag and the
  // loop respects it without exiting the process.
  let bot: ReturnType<typeof createBot> | null = null
  if (TELEGRAM_BOT_TOKEN && ALLOWED_CHAT_IDS.length > 0) {
    bot = createBot({
      transcribeAudio: voiceOnline.transcribeAudio,
      // TTS not wired in online mode. Install @nc/voice-local for Piper TTS.
    })
    registerTelegramBot(bot)

    const sender = async (chatId: string, text: string) => {
      if (!bot) return
      try { await bot.api.sendMessage(chatId, text) } catch (err) { logger.error({ err }, 'send failed') }
    }

    initScheduler(sender)
    logger.info({ chats: ALLOWED_CHAT_IDS.length }, 'Telegram bot starting')

    // Background restart loop. Don't await - it never resolves while paused
    // is false and the bot is healthy. Process stays alive via the dashboard
    // server in the same node process.
    ;(async () => {
      let attempt = 0
      // eslint-disable-next-line no-constant-condition
      while (true) {
        if (isTelegramPaused()) {
          setTelegramRunning(false)
          await new Promise(r => setTimeout(r, 2000))
          continue
        }
        try {
          await bot!.start({
            drop_pending_updates: true,
            onStart: () => {
              attempt = 0
              setTelegramRunning(true)
              setTelegramError(null)
              logger.info('Telegram bot polling')
            },
          })
          setTelegramRunning(false)
          if (!isTelegramPaused()) {
            logger.warn('Telegram polling exited cleanly, restarting in 5s')
            await new Promise(r => setTimeout(r, 5000))
          }
        } catch (err) {
          setTelegramRunning(false)
          const e = err as { error_code?: number; message?: string }
          const isConflict = e?.error_code === 409
          const delay = isConflict ? 30_000 : Math.min(60_000, 2_000 * 2 ** attempt)
          attempt++
          setTelegramError(e?.message ?? String(err))
          logger.error({ err, attempt, delay }, `Telegram polling stopped, restarting in ${Math.round(delay / 1000)}s`)
          await new Promise(r => setTimeout(r, delay))
        }
      }
    })().catch(err => logger.error({ err }, 'Telegram restart loop crashed'))
  } else if (!TELEGRAM_BOT_TOKEN) {
    logger.warn('TELEGRAM_BOT_TOKEN missing - bot disabled, dashboard only')
  }

  // Shutdown
  const shutdown = async () => {
    logger.info('shutting down')
    clearInterval(decayTimer)
    stopScheduler()
    dashboard.close()
    if (bot) { await bot.stop(); setTelegramRunning(false) }
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
