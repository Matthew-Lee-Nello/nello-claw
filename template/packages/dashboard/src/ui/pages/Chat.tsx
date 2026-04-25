import React, { useEffect, useRef, useState } from 'react'

interface Message { role: 'user' | 'assistant'; content: string }

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [chatId, setChatId] = useState<string>('')
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Create or load the default dashboard chat
    fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'Dashboard' }) })
      .then(r => r.json())
      .then(data => setChatId(data.id))
      .catch(() => {})
  }, [])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async () => {
    const text = input.trim()
    if (!text || !chatId || busy) return
    setInput('')
    setMessages(m => [...m, { role: 'user', content: text }])
    setBusy(true)

    try {
      const res = await fetch(`/api/chat/${chatId}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      const data = await res.json()
      setMessages(m => [...m, { role: 'assistant', content: data.reply ?? '(no response)' }])
    } catch (err) {
      setMessages(m => [...m, { role: 'assistant', content: `Error: ${String(err)}` }])
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="chat">
      <div className="chat-messages">
        {messages.length === 0 && (
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
