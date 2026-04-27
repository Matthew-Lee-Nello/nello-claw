import { Router, type Request } from 'express'
import { randomUUID } from 'node:crypto'
import { mkdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import multer from 'multer'
import {
  getDb, getSession, setSession, clearSession,
  buildMemoryContext, saveConversationTurn, runAgentStream,
  STORE_DIR, logger,
} from '@nc/core'
import { sendToChat } from '../ws-broadcast.js'

interface DashboardChat {
  id: string
  name: string
  session_id: string | null
  archived_at: number | null
  created_at: number
  updated_at: number
}

const UPLOADS_ROOT = join(STORE_DIR, 'uploads')

// Per-chat upload directory; multer's diskStorage handler creates it on first use.
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, _file, cb) => {
      const chatId = (req as Request).params.id
      const dir = join(UPLOADS_ROOT, chatId)
      if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
      cb(null, dir)
    },
    filename: (_req, file, cb) => {
      // Keep original name; prefix with timestamp to avoid collisions.
      const safe = file.originalname.replace(/[^\w.\-]/g, '_').slice(0, 80)
      cb(null, `${Date.now()}_${safe}`)
    },
  }),
  limits: { fileSize: 200 * 1024 * 1024 }, // 200 MB per file
})

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

  r.patch('/:id', (req, res) => {
    const name: string = req.body?.name ?? ''
    if (!name.trim()) { res.status(400).json({ error: 'name required' }); return }
    const result = getDb().prepare('UPDATE dashboard_chats SET name = ?, updated_at = ? WHERE id = ?').run(name.trim(), Date.now(), req.params.id)
    if (result.changes === 0) { res.status(404).json({ error: 'chat not found' }); return }
    res.json({ ok: true })
  })

  r.delete('/:id', (req, res) => {
    const result = getDb().prepare('UPDATE dashboard_chats SET archived_at = ? WHERE id = ?').run(Date.now(), req.params.id)
    if (result.changes === 0) { res.status(404).json({ error: 'chat not found' }); return }
    res.json({ ok: true })
  })

  r.post('/:id/restore', (req, res) => {
    const result = getDb().prepare('UPDATE dashboard_chats SET archived_at = NULL, updated_at = ? WHERE id = ?').run(Date.now(), req.params.id)
    if (result.changes === 0) { res.status(404).json({ error: 'chat not found' }); return }
    res.json({ ok: true })
  })

  r.delete('/:id/permanent', (req, res) => {
    const row = getDb().prepare('SELECT archived_at FROM dashboard_chats WHERE id = ?').get(req.params.id) as { archived_at: number | null } | undefined
    if (!row) { res.status(404).json({ error: 'chat not found' }); return }
    if (row.archived_at === null) { res.status(409).json({ error: 'archive first before permanent delete' }); return }
    getDb().prepare('DELETE FROM dashboard_chats WHERE id = ?').run(req.params.id)
    res.json({ ok: true })
  })

  r.get('/archived/list', (_req, res) => {
    const rows = getDb().prepare('SELECT * FROM dashboard_chats WHERE archived_at IS NOT NULL ORDER BY archived_at DESC').all() as DashboardChat[]
    res.json(rows)
  })

  r.get('/:id/messages', (req, res) => {
    const rows = getDb().prepare('SELECT id, role, content, created_at FROM dashboard_messages WHERE chat_id = ? ORDER BY created_at ASC').all(req.params.id)
    res.json(rows)
  })

  // File upload — multipart, saves under <STORE>/uploads/<chatId>/, returns metadata.
  r.post('/:id/upload', upload.array('files', 10), (req, res) => {
    const chatId = req.params.id
    const chatRow = getDb().prepare('SELECT id FROM dashboard_chats WHERE id = ? AND archived_at IS NULL').get(chatId) as { id: string } | undefined
    if (!chatRow) { res.status(404).json({ error: `chat not found: ${chatId}` }); return }

    const files = (req.files as Express.Multer.File[] | undefined) ?? []
    const meta = files.map(f => ({
      name: f.originalname,
      saved: f.filename,
      path: f.path,
      size: f.size,
      mime: f.mimetype,
    }))
    res.json({ files: meta })
  })

  r.post('/:id/message', async (req, res) => {
    const chatId = req.params.id
    const text: string = req.body?.text ?? ''
    if (!text.trim()) { res.status(400).json({ error: 'empty message' }); return }

    const chatRow = getDb().prepare('SELECT id FROM dashboard_chats WHERE id = ? AND archived_at IS NULL').get(chatId) as { id: string } | undefined
    if (!chatRow) { res.status(404).json({ error: `chat not found: ${chatId}. POST /api/chat first to create one.` }); return }

    const now = Date.now()
    getDb().prepare('INSERT INTO dashboard_messages (chat_id, role, content, created_at) VALUES (?, ?, ?, ?)').run(chatId, 'user', text, now)
    sendToChat(chatId, 'user_message', { text, ts: now })
    sendToChat(chatId, 'thinking', { text: 'thinking…' })

    try {
      const memContext = await buildMemoryContext(chatId, text)
      const message = memContext ? `${memContext}\n${text}` : text
      const sessionId = getSession(chatId)

      const result = await runAgentStream(message, sessionId, (e) => {
        // forward streaming events to all subscribers of this chat
        sendToChat(chatId, e.type, e)
      })

      if (result.newSessionId && result.newSessionId !== sessionId) setSession(chatId, result.newSessionId)

      const reply = result.text || '(no response)'
      await saveConversationTurn(chatId, text, reply)

      getDb().prepare('INSERT INTO dashboard_messages (chat_id, role, content, created_at) VALUES (?, ?, ?, ?)').run(chatId, 'assistant', reply, Date.now())
      getDb().prepare('UPDATE dashboard_chats SET updated_at = ? WHERE id = ?').run(Date.now(), chatId)

      sendToChat(chatId, 'message_done', { reply, ts: Date.now() })
      res.json({ reply })
    } catch (err) {
      logger.error({ err }, 'dashboard chat failed')
      const errMsg = err instanceof Error ? err.message : String(err)
      sendToChat(chatId, 'error', { error: errMsg })
      res.status(500).json({ error: errMsg })
    }
  })

  r.post('/:id/clear', (req, res) => {
    clearSession(req.params.id)
    res.json({ ok: true })
  })

  return r
}
