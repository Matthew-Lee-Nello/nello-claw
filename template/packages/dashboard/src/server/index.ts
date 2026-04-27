import express from 'express'
import cors from 'cors'
import { createServer } from 'node:http'
import { WebSocketServer } from 'ws'
import { existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { DASHBOARD_PORT, logger, addLogTap } from '@nc/core'
import { chatRouter } from './routes/chat.js'
import { cronRouter } from './routes/cron.js'
import { monitoringRouter } from './routes/monitoring.js'
import { memoriesRouter } from './routes/memories.js'
import { daemonsRouter } from './routes/daemons.js'
import { subs, broadcastLog, type ClientSub } from './ws-broadcast.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

export interface DashboardHandle {
  close: () => void
  port: number
}

// Re-export for any consumer that wants to push events from outside the routes.
export { sendToChat, broadcastLog } from './ws-broadcast.js'

export function startDashboard(): DashboardHandle {
  const app = express()
  app.use(cors({ origin: ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000', 'http://127.0.0.1:5173'] }))
  app.use(express.json({ limit: '200mb' }))

  app.use('/api/chat', chatRouter())
  app.use('/api/cron', cronRouter())
  app.use('/api/monitoring', monitoringRouter())
  app.use('/api/memories', memoriesRouter())
  app.use('/api/daemons', daemonsRouter())

  const uiDir = join(__dirname, '..', 'ui')
  if (existsSync(uiDir)) {
    app.use(express.static(uiDir))
    app.get('*', (_req, res) => res.sendFile(join(uiDir, 'index.html')))
  }

  const server = createServer(app)
  const wss = new WebSocketServer({ server, path: '/ws' })

  wss.on('connection', (ws) => {
    const sub: ClientSub = { ws, chatId: null, wantLogs: false }
    subs.add(sub)
    ws.on('message', (data) => {
      try {
        const msg = JSON.parse(String(data))
        if (msg && typeof msg === 'object') {
          if (msg.type === 'subscribe' && typeof msg.chatId === 'string') sub.chatId = msg.chatId
          if (msg.type === 'subscribe-logs') sub.wantLogs = true
          if (msg.type === 'unsubscribe-logs') sub.wantLogs = false
        }
      } catch { /* ignore */ }
    })
    ws.on('close', () => { subs.delete(sub) })
  })

  // Tap pino so every log line streams to subscribed clients.
  const removeTap = addLogTap((e) => {
    broadcastLog(e.level, e.msg, e.fields, e.ts)
  })

  let actualPort = DASHBOARD_PORT
  const MAX_ATTEMPTS = 5
  let attempts = 0

  const tryListen = (port: number): void => {
    server.once('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'EADDRINUSE' && attempts < MAX_ATTEMPTS) {
        attempts++
        const next = port + 1
        logger.warn({ port, next, attempts }, 'port in use, trying next')
        actualPort = next
        tryListen(next)
      } else {
        logger.error({ err, port }, 'dashboard listen failed')
        throw err
      }
    })
    server.listen(port, () => {
      actualPort = port
      logger.info({ port }, 'Dashboard listening')
    })
  }
  tryListen(DASHBOARD_PORT)

  return {
    close: () => {
      removeTap()
      server.close()
    },
    get port() { return actualPort },
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  startDashboard()
}
