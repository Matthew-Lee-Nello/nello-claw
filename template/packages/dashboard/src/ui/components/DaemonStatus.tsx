import React, { useEffect, useState, useCallback } from 'react'

interface TelegramState {
  configured: boolean
  chatIdConfigured: boolean
  running: boolean
  paused: boolean
  lastError: string | null
  username: string | null
}

interface DaemonsResponse {
  telegram: TelegramState
}

const POLL_MS = 5000

export default function DaemonStatus() {
  const [data, setData] = useState<DaemonsResponse | null>(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/daemons')
      if (res.ok) setData(await res.json())
    } catch {
      // keep last known state on transient failures
    }
  }, [])

  useEffect(() => {
    load()
    const t = setInterval(load, POLL_MS)
    return () => clearInterval(t)
  }, [load])

  const toggle = async () => {
    if (!data?.telegram?.configured) return
    const action = data.telegram.running && !data.telegram.paused ? 'stop' : 'start'
    setBusy(true)
    try {
      await fetch(`/api/daemons/telegram/${action}`, { method: 'POST' })
      await load()
    } finally {
      setBusy(false)
    }
  }

  if (!data) return null

  const { telegram: tg } = data
  const dotColour =
    !tg.configured ? '#444' :
    tg.lastError ? 'var(--red, #f87171)' :
    tg.running ? 'var(--green, #4ade80)' :
    tg.paused ? '#f59e0b' :
    '#666'

  const statusLabel =
    !tg.configured ? 'not configured' :
    tg.lastError ? 'error' :
    tg.running ? 'running' :
    tg.paused ? 'paused' :
    'starting…'

  return (
    <div
      style={{
        marginTop: 'auto',
        padding: '12px',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        fontSize: 12,
      }}
      title={tg.lastError ?? undefined}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: dotColour,
          flexShrink: 0,
        }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ color: 'var(--text)', fontWeight: 500 }}>
          Telegram {tg.username ? <span style={{ color: 'var(--muted)', fontWeight: 400 }}>@{tg.username}</span> : null}
        </div>
        <div style={{ color: 'var(--muted)', fontSize: 11 }}>{statusLabel}</div>
      </div>
      {tg.configured && (
        <button
          onClick={toggle}
          disabled={busy}
          style={{
            background: 'transparent',
            border: '1px solid var(--border)',
            color: 'var(--muted)',
            borderRadius: 4,
            padding: '3px 8px',
            fontSize: 11,
            cursor: busy ? 'wait' : 'pointer',
          }}
          title={tg.running ? 'Stop polling' : 'Start polling'}
        >
          {tg.running && !tg.paused ? 'Stop' : 'Start'}
        </button>
      )}
    </div>
  )
}
