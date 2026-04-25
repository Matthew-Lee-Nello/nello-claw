import { Router } from 'express'
import { getDb } from '@nc/core'

const started = Date.now()

export function monitoringRouter(): Router {
  const r = Router()

  r.get('/health', (_req, res) => {
    res.json({ ok: true, uptime_s: Math.floor((Date.now() - started) / 1000) })
  })

  r.get('/stats', (_req, res) => {
    const mem = process.memoryUsage()
    const db = getDb()

    const memRows = (db.prepare('SELECT COUNT(*) as c FROM memories').get() as { c: number }).c
    const sessions = (db.prepare('SELECT COUNT(*) as c FROM sessions').get() as { c: number }).c
    const tasks = (db.prepare('SELECT COUNT(*) as c FROM scheduled_tasks').get() as { c: number }).c

    res.json({
      uptime_s: Math.floor((Date.now() - started) / 1000),
      memory_mb: mem.rss / 1024 / 1024,
      memory_rows: memRows,
      sessions,
      scheduled_tasks: tasks,
    })
  })

  return r
}
