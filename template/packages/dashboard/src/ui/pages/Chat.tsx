import React, { useEffect, useRef, useState, useCallback } from 'react'

interface ChatRow {
  id: string
  name: string
  session_id: string | null
  archived_at: number | null
  created_at: number
  updated_at: number
}
interface Message { role: 'user' | 'assistant'; content: string }
interface DbMessage { id: number; role: string; content: string; created_at: number }

const ACTIVE_KEY = 'nc-dashboard-chat-id'

export default function Chat() {
  const [chats, setChats] = useState<ChatRow[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [messagesByChat, setMessagesByChat] = useState<Record<string, Message[]>>({})
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const endRef = useRef<HTMLDivElement>(null)

  // Load list on mount, seed if empty, restore last active.
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const list = (await fetch('/api/chat').then(r => r.json())) as ChatRow[]
        if (cancelled) return
        if (list.length === 0) {
          const created = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Dashboard' }),
          }).then(r => r.json())
          if (cancelled) return
          setChats([{ ...created, session_id: null, archived_at: null, created_at: Date.now(), updated_at: Date.now() }])
          setActiveId(created.id)
          localStorage.setItem(ACTIVE_KEY, created.id)
        } else {
          setChats(list)
          const stored = localStorage.getItem(ACTIVE_KEY)
          const pick = stored && list.find(c => c.id === stored) ? stored : list[0].id
          setActiveId(pick)
          localStorage.setItem(ACTIVE_KEY, pick)
        }
      } catch (err) {
        if (!cancelled) setError(`Couldn't reach the daemon: ${String(err)}`)
      }
    })()
    return () => { cancelled = true }
  }, [])

  // Load messages when active chat changes (cache per chat).
  useEffect(() => {
    if (!activeId) return
    if (messagesByChat[activeId]) return
    fetch(`/api/chat/${activeId}/messages`)
      .then(r => r.ok ? r.json() : [])
      .then((rows: DbMessage[]) => {
        setMessagesByChat(prev => ({
          ...prev,
          [activeId]: rows.map(r => ({ role: r.role as 'user' | 'assistant', content: r.content })),
        }))
      })
      .catch(() => {})
  }, [activeId, messagesByChat])

  // Auto-scroll on new message.
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeId, messagesByChat, busy])

  const newChat = useCallback(async () => {
    try {
      const created = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'New chat' }),
      }).then(r => r.json())
      const list = (await fetch('/api/chat').then(r => r.json())) as ChatRow[]
      setChats(list)
      setActiveId(created.id)
      localStorage.setItem(ACTIVE_KEY, created.id)
      setInput('')
    } catch (err) {
      setError(`Couldn't create chat: ${String(err)}`)
    }
  }, [])

  const switchTo = useCallback((id: string) => {
    setActiveId(id)
    localStorage.setItem(ACTIVE_KEY, id)
    setError('')
  }, [])

  const archive = useCallback(async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('Archive this chat?')) return
    await fetch(`/api/chat/${id}`, { method: 'DELETE' })
    const list = (await fetch('/api/chat').then(r => r.json())) as ChatRow[]
    setChats(list)
    if (activeId === id) {
      const next = list[0]?.id ?? null
      setActiveId(next)
      if (next) localStorage.setItem(ACTIVE_KEY, next)
      else localStorage.removeItem(ACTIVE_KEY)
    }
  }, [activeId])

  const send = async () => {
    const text = input.trim()
    if (!text || !activeId || busy) return
    setInput('')
    setError('')
    setMessagesByChat(prev => ({
      ...prev,
      [activeId]: [...(prev[activeId] || []), { role: 'user', content: text }],
    }))
    setBusy(true)

    try {
      const res = await fetch(`/api/chat/${activeId}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      const data = await res.json()
      if (!res.ok) {
        const why = data?.error || `HTTP ${res.status}`
        setMessagesByChat(prev => ({
          ...prev,
          [activeId]: [...(prev[activeId] || []), { role: 'assistant', content: `⚠ Daemon error: ${why}` }],
        }))
        setError(`Daemon error: ${why}. Run /install-doctor in this folder to diagnose.`)
      } else if (!data.reply) {
        setMessagesByChat(prev => ({
          ...prev,
          [activeId]: [
            ...(prev[activeId] || []),
            { role: 'assistant', content: '⚠ Empty reply. Run `claude` once in this folder to authenticate.' },
          ],
        }))
      } else {
        setMessagesByChat(prev => ({
          ...prev,
          [activeId]: [...(prev[activeId] || []), { role: 'assistant', content: data.reply }],
        }))
      }
    } catch (err) {
      setMessagesByChat(prev => ({
        ...prev,
        [activeId]: [...(prev[activeId] || []), { role: 'assistant', content: `⚠ Network error: ${String(err)}` }],
      }))
      setError(`Network error talking to the daemon. Is it running?`)
    } finally {
      setBusy(false)
    }
  }

  const messages = activeId ? (messagesByChat[activeId] || []) : []
  const activeChat = chats.find(c => c.id === activeId)

  return (
    <div className="chat-layout">
      {/* Tab list */}
      <aside className="chat-list-pane">
        <button className="new-chat" onClick={newChat}>+ New chat</button>
        <div className="chat-list">
          {chats.map(c => (
            <div
              key={c.id}
              className={`chat-list-item ${c.id === activeId ? 'active' : ''}`}
              onClick={() => switchTo(c.id)}
            >
              <span className="chat-list-name">{c.name}</span>
              <button
                className="chat-list-archive"
                onClick={e => archive(c.id, e)}
                title="Archive"
              >×</button>
            </div>
          ))}
          {chats.length === 0 && (
            <div className="chat-list-empty">No chats yet.</div>
          )}
        </div>
      </aside>

      {/* Conversation pane */}
      <section className="chat-main">
        {activeChat && (
          <header className="chat-header">
            <div className="chat-avatar-wrap">
              <div className="chat-avatar">L</div>
              <span className={`status-dot ${busy ? 'thinking' : 'online'}`} aria-label={busy ? 'thinking' : 'online'} />
            </div>
            <div className="chat-header-text">
              <div className="chat-header-name">Luke</div>
              <div className="chat-header-status">{busy ? 'typing…' : activeChat.name}</div>
            </div>
          </header>
        )}

        {error && (
          <div className="chat-error">{error}</div>
        )}

        <div className="chat-messages">
          {!activeId && (
            <div className="chat-empty">No chat selected. Click + New chat to start.</div>
          )}
          {messages.length === 0 && activeId && !busy && (
            <div className="chat-empty">
              Ask anything. Bypass permissions is on. This chat shares memory with your Telegram bot and terminal Claude Code.
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={`message-row ${m.role}`}>
              {m.role === 'assistant' && <div className="msg-avatar assistant">L</div>}
              <div className={`message-bubble ${m.role}`}>{m.content}</div>
              {m.role === 'user' && <div className="msg-avatar user">You</div>}
            </div>
          ))}

          {busy && (
            <div className="message-row assistant">
              <div className="msg-avatar assistant">L</div>
              <div className="message-bubble assistant typing">
                <span className="typing-dots">
                  <i style={{ animationDelay: '0ms' }} />
                  <i style={{ animationDelay: '150ms' }} />
                  <i style={{ animationDelay: '300ms' }} />
                </span>
              </div>
            </div>
          )}

          <div ref={endRef} />
        </div>

        <div className="composer">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
            }}
            placeholder={busy ? 'thinking…' : 'Message (Enter to send, Shift+Enter for newline)'}
            disabled={busy || !activeId}
          />
          <button onClick={send} disabled={busy || !input.trim() || !activeId}>Send</button>
        </div>
      </section>
    </div>
  )
}
