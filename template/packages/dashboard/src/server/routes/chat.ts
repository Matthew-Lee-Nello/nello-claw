import { Router } from 'express'
import { randomUUID } from 'node:crypto'
import { getDb, getSession, setSession, clearSession, buildMemoryContext, saveConversationTurn, runAgent, logger } from '@nc/core'

interface DashboardChat {
  id: string
  name: string
  session_id: string | null
  archived_at: number | null
  created_at: number
  updated_at: number
}

export function chatRouter(): Router {
  const r = Router()

  r.get('/', (_req, res) => {
    const rows = getDb().prepare('SELECT * FROM dashboard_chats WHERE archived_at IS NULL ORDER BY updated_at DESC').all() as DashboardChat[]
    res.json(rows)
  })

  r.post('/', (req, res) => {
    const name = req.body?.name || 'New chat'
    const id = randomUUID().slice(0, 8)
    const now = Date.now()
    getDb().prepare('INSERT INTO dashboard_chats (id, name, session_id, created_at, updated_at) VALUES (?, ?, NULL, ?, ?)').run(id, name, now, now)
    res.json({ id, name })
  })

  r.delete('/:id', (req, res) => {
    getDb().prepare('UPDATE dashboard_chats SET archived_at = ? WHERE id = ?').run(Date.now(), req.params.id)
    res.json({ ok: true })
  })

  r.get('/:id/messages', (req, res) => {
    const rows = getDb().prepare('SELECT id, role, content, created_at FROM dashboard_messages WHERE chat_id = ? ORDER BY created_at ASC').all(req.params.id)
    res.json(rows)
  })

  r.post('/:id/message', async (req, res) => {
    const chatId = req.params.id
    const text: string = req.body?.text ?? ''
    if (!text.trim()) { res.status(400).json({ error: 'empty message' }); return }

    // Validate the chat exists before inserting messages, otherwise the
    // FOREIGN KEY constraint surfaces as an opaque 500 (Isaac hit this with
    // chat_id="test"). Return 404 with a clear message instead.
    const chatRow = getDb().prepare('SELECT id FROM dashboard_chats WHERE id = ? AND archived_at IS NULL').get(chatId) as { id: string } | undefined
    if (!chatRow) { res.status(404).json({ error: `chat not found: ${chatId}. POST /api/chat first to create one.` }); return }

    const now = Date.now()
    getDb().prepare('INSERT INTO dashboard_messages (chat_id, role, content, created_at) VALUES (?, ?, ?, ?)').run(chatId, 'user', text, now)

    try {
      const memContext = await buildMemoryContext(chatId, text)
      const message = memContext ? `${memContext}\n${text}` : text
      const sessionId = getSession(chatId)

      const result = await runAgent(message, sessionId)

      if (result.newSessionId && result.newSessionId !== sessionId) setSession(chatId, result.newSessionId)

      const reply = result.text || '(no response)'
      await saveConversationTurn(chatId, text, reply)

      getDb().prepare('INSERT INTO dashboard_messages (chat_id, role, content, created_at) VALUES (?, ?, ?, ?)').run(chatId, 'assistant', reply, Date.now())
      getDb().prepare('UPDATE dashboard_chats SET updated_at = ? WHERE id = ?').run(Date.now(), chatId)

      res.json({ reply })
    } catch (err) {
      logger.error({ err }, 'dashboard chat failed')
      res.status(500).json({ error: err instanceof Error ? err.message : String(err) })
    }
  })

  r.post('/:id/clear', (req, res) => {
    clearSession(req.params.id)
    res.json({ ok: true })
  })

  return r
}
