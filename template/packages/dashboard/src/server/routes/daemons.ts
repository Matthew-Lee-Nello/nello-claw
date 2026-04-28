import { Router } from 'express'
import {
  getTelegramState, pauseTelegram, resumeTelegram,
  getWebexState, pauseWebex, resumeWebex,
  logger,
} from '@nc/core'

export function daemonsRouter(): Router {
  const r = Router()

  r.get('/', (_req, res) => {
    // Only surface Webex when the user has provided a token. The wizard
    // doesn't collect Webex creds yet, so for one-click installs there's
    // nothing to show — hiding the row keeps the UI honest.
    const webex = getWebexState()
    res.json({
      telegram: getTelegramState(),
      ...(webex.configured ? { webex } : {}),
    })
  })

  // Telegram
  r.post('/telegram/start', (_req, res) => {
    resumeTelegram()
    logger.info('[daemons] Telegram start via API')
    res.json({ ok: true, telegram: getTelegramState() })
  })

  r.post('/telegram/stop', async (_req, res) => {
    try {
      await pauseTelegram()
      logger.info('[daemons] Telegram stop via API')
      res.json({ ok: true, telegram: getTelegramState() })
    } catch (err) {
      res.status(500).json({ error: String(err) })
    }
  })

  // Webex
  r.post('/webex/start', async (_req, res) => {
    try {
      await resumeWebex()
      logger.info('[daemons] Webex start via API')
      res.json({ ok: true, webex: getWebexState() })
    } catch (err) {
      res.status(500).json({ error: String(err) })
    }
  })

  r.post('/webex/stop', async (_req, res) => {
    try {
      await pauseWebex()
      logger.info('[daemons] Webex stop via API')
      res.json({ ok: true, webex: getWebexState() })
    } catch (err) {
      res.status(500).json({ error: String(err) })
    }
  })

  return r
}
