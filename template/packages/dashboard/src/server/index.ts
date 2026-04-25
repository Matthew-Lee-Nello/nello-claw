import express from 'express'
import cors from 'cors'
import { createServer } from 'node:http'
import { WebSocketServer } from 'ws'
import { existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { DASHBOARD_PORT, logger } from '@nc/core'
import { chatRouter } from './routes/chat.js'
import { cronRouter } from './routes/cron.js'
import { monitoringRouter } from './routes/monitoring.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

export function startDashboard(): { close: () => void } {
  const app = express()
  app.use(cors({ origin: ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000', 'http://127.0.0.1:5173'] }))
  app.use(express.json({ limit: '200mb' }))

  app.use('/api/chat', chatRouter())
  app.use('/api/cron', cronRouter())
  app.use('/api/monitoring', monitoringRouter())

  // Serve built UI. Compiled server lives at dist/server/index.js, UI at dist/ui/.
  const uiDir = join(__dirname, '..', 'ui')
  if (existsSync(uiDir)) {
    app.use(express.static(uiDir))
    app.get('*', (_req, res) => res.sendFile(join(uiDir, 'index.html')))
  }

  const server = createServer(app)
  const wss = new WebSocketServer({ server, path: '/ws' })

  wss.on('connection', (ws) => {
    ws.on('message', (data) => {
      // Dashboard broadcast channel for streaming events - handled by route-level streaming in v1.1
      logger.debug({ msg: String(data) }, 'ws message')
    })
  })

  server.listen(DASHBOARD_PORT, () => {
    logger.info({ port: DASHBOARD_PORT }, 'Dashboard listening')
  })

  return { close: () => server.close() }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  startDashboard()
}
