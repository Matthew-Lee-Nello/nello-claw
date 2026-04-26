import React, { useEffect, useRef, useState } from 'react'

interface Message { role: 'user' | 'assistant'; content: string }
interface DbMessage { id: number; role: string; content: string; created_at: number }

const CHAT_ID_KEY = 'nc-dashboard-chat-id'

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [chatId, setChatId] = useState<string>('')
  const [error, setError] = useState<string>('')
  const endRef = useRef<HTMLDivElement>(null)

  // Resume the same chat across tab switches + page reloads
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const stored = localStorage.getItem(CHAT_ID_KEY)
        if (stored) {
          // Verify the chat still exists by fetching its messages
          const res = await fetch(`/api/chat/${stored}/messages`)
          if (res.ok) {
            const rows: DbMessage[] = await res.json()
            if (cancelled) return
            setChatId(stored)
            setMessages(rows.map(r => ({ role: r.role as 'user' | 'assistant', content: r.content })))
            return
          }
        }
        // First time, or stored chat was deleted - create a new one
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'Dashboard' }),
        })
        const data = await res.json()
        if (cancelled) return
        localStorage.setItem(CHAT_ID_KEY, data.id)
        setChatId(data.id)
      } catch (err) {
        if (!cancelled) setError(`Couldn't reach the daemon: ${String(err)}. Try \`launchctl kickstart -k gui/$(id -u)/com.nello-claw.server\` then refresh.`)
      }
    })()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async () => {
    const text = input.trim()
    if (!text || !chatId || busy) return
    setInput('')
    setError('')
    setMessages(m => [...m, { role: 'user', content: text }])
    setBusy(true)

    try {
      const res = await fetch(`/api/chat/${chatId}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      const data = await res.json()
      if (!res.ok) {
        const why = data?.error || `HTTP ${res.status}`
        setMessages(m => [...m, { role: 'assistant', content: `⚠ Daemon error: ${why}` }])
        setError(`Daemon error: ${why}. Run \`/install-doctor\` from this folder in Claude Code to diagnose.`)
      } else if (!data.reply) {
        setMessages(m => [...m, { role: 'assistant', content: '⚠ Empty reply from Claude. Most likely the daemon\'s Claude Code session isn\'t logged in. Open a terminal in this folder and run `claude` once to authenticate, then send another message.' }])
      } else {
        setMessages(m => [...m, { role: 'assistant', content: data.reply }])
      }
    } catch (err) {
      setMessages(m => [...m, { role: 'assistant', content: `⚠ Network error: ${String(err)}` }])
      setError(`Network error talking to the daemon. Is it running? \`launchctl list | grep nello-claw\``)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="chat">
      {error && (
        <div style={{ background: 'rgba(248,113,113,0.12)', border: '1px solid var(--red, #f87171)', color: 'var(--red, #f87171)', padding: '10px 14px', borderRadius: 8, margin: '12px 16px 0', fontSize: 13 }}>
          {error}
        </div>
      )}
      <div className="chat-messages">
        {messages.length === 0 && !error && (
          <div style={{ color: 'var(--muted)', marginTop: 40 }}>
            Ask anything. Bypass permissions is on. This chat shares memory with your Telegram bot and terminal Claude Code.
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className="message">
            <div className="role">{m.role}</div>
            <div className="body">{m.content}</div>
          </div>
        ))}
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
          disabled={busy}
        />
        <button onClick={send} disabled={busy || !input.trim()}>Send</button>
      </div>
    </div>
  )
}
