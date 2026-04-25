import { Router } from 'express'
import { randomUUID } from 'node:crypto'
import { listTasks, createTask, setTaskStatus, deleteTask } from '@nc/core'
import { computeNextRun } from '@nc/scheduler'

export function cronRouter(): Router {
  const r = Router()

  r.get('/tasks', (req, res) => {
    const chatId = (req.query.chat_id as string) || undefined
    res.json(listTasks(chatId))
  })

  r.post('/tasks', (req, res) => {
    const { prompt, schedule, chat_id } = req.body ?? {}
    if (!prompt || !schedule || !chat_id) { res.status(400).json({ error: 'prompt, schedule, chat_id required' }); return }
    let next: number
    try { next = computeNextRun(schedule) } catch (err) {
      res.status(400).json({ error: `invalid cron: ${err instanceof Error ? err.message : err}` }); return
    }
    const id = randomUUID().slice(0, 8)
    createTask({ id, chat_id, prompt, schedule, next_run: next, status: 'active' })
    res.json({ id, next_run: next })
  })

  r.post('/tasks/:id/pause', (req, res) => { setTaskStatus(req.params.id, 'paused'); res.json({ ok: true }) })
  r.post('/tasks/:id/resume', (req, res) => { setTaskStatus(req.params.id, 'active'); res.json({ ok: true }) })
  r.delete('/tasks/:id', (req, res) => { deleteTask(req.params.id); res.json({ ok: true }) })

  return r
}
